#!/usr/bin/env node
// Ship: build -> QA under production headers -> commit -> push -> wait for the Vercel deployment of that commit.
//
// Usage:
//   node scripts/ship.mjs -m "Commit message"          full ship of the current branch (main = production, other = preview)
//   node scripts/ship.mjs --qa                          build + QA only (no commit, no push)
//   node scripts/ship.mjs -m "..." --no-wait            ship without waiting for Vercel
//   node scripts/ship.mjs -m "..." --widths 1280,375    custom QA widths (default 1280,375,320)
//
// Stops at the first failure and never pushes a commit that failed the build or QA.
// Commits use the GitHub no-reply identity so no personal email lands in the history.
// Vercel status needs network access to api.vercel.com and a token (VERCEL_TOKEN, or one injected by a proxy).
import { spawn, spawnSync } from "node:child_process";
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import net from "node:net";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const opt = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const MESSAGE = opt("-m", opt("--message", ""));
const QA_ONLY = flag("--qa");
const NO_WAIT = flag("--no-wait");
const WIDTHS = opt("--widths", "1280,375,320");
const IDENTITY = ["-c", "user.name=BigYoss", "-c", "user.email=BigYoss@users.noreply.github.com"];
const VERCEL = { team: "team_6FsJM2iyP2QXs61Rrtb3rDJA", project: "prj_PRwM059z8Rxa6sH5crcVFp235ysn" };

const step = (n, t) => console.log(`\n\x1b[1m[${n}] ${t}\x1b[0m`);
const fail = (msg) => { console.error(`\n\x1b[31m✗ SHIP STOPPED: ${msg}\x1b[0m`); process.exit(1); };
const ok = (msg) => console.log(`\x1b[32m✓ ${msg}\x1b[0m`);
const git = (...a) => spawnSync("git", a, { cwd: ROOT, encoding: "utf8" });

if (!QA_ONLY && !MESSAGE) fail('a commit message is required: node scripts/ship.mjs -m "What changed"');

// 0. Preconditions
step(0, "Preconditions");
const branch = git("branch", "--show-current").stdout.trim();
if (!branch) fail("detached HEAD; check out a branch first.");
const env = existsSync(join(ROOT, ".env")) ? readFileSync(join(ROOT, ".env"), "utf8") : "";
for (const k of ["VITE_SITE_URL", "VITE_FORM_ENDPOINT"]) if (!new RegExp(`^${k}=.+`, "m").test(env)) console.warn(`! ${k} missing from .env: the local build will differ from production.`);
ok(`branch ${branch} (${branch === "main" ? "pushes deploy to PRODUCTION" : "pushes deploy a preview"})`);

// 1. Build (includes the legal placeholder guard, type check, prerender and blog)
step(1, "Build");
const build = spawnSync("npm", ["run", "build"], { cwd: ROOT, encoding: "utf8", env: { ...process.env, ALLOW_TODO: "" } });
if (build.status !== 0) { console.error((build.stdout + build.stderr).split("\n").slice(-25).join("\n")); fail("build failed (see above)."); }
ok("build passed");

// 2. QA: serve dist with the real vercel.json headers, run the regression on every built page
step(2, `QA under production headers at ${WIDTHS}px`);
const pages = [];
(function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (n === "index.html") pages.push("/" + relative(join(ROOT, "dist"), dir).replace(/\\/g, "/"));
  }
})(join(ROOT, "dist"));
pages.sort();
const port = await new Promise((r) => { const s = net.createServer().listen(0, () => { const p = s.address().port; s.close(() => r(p)); }); });
const server = spawn(process.execPath, [join(ROOT, "scripts/qa/serve-with-headers.mjs"), ROOT, String(port)], { stdio: "ignore" });
const stop = () => { try { server.kill(); } catch { /* gone */ } };
process.on("exit", stop);
for (let i = 0; i < 40; i++) {
  if (await fetch(`http://localhost:${port}/`).then(() => true, () => false)) break;
  await new Promise((r) => setTimeout(r, 250));
}
const qa = spawnSync(process.execPath, [join(ROOT, "scripts/qa/regression.mjs"), `http://localhost:${port}`, ...pages.map((p) => p === "/" ? "/" : p.replace(/\/$/, "")), "--widths", WIDTHS], { cwd: ROOT, encoding: "utf8" });
stop();
const report = qa.stdout + qa.stderr;
if (qa.status === 2) { console.error(report); fail("QA could not run (Playwright missing?)."); }
if (qa.status !== 0) {
  // Print only the pages that have problems.
  const sections = report.split(/\n(?=## )/).filter((sec) => sec.startsWith("## ") && /\n- (?!✅)/.test(sec));
  console.error(sections.map((sec) => sec.trim()).join("\n\n"));
  fail("QA found issues (above). Fix them; nothing was committed.");
}
ok(`QA clean: ${pages.length} pages × ${WIDTHS.split(",").length} widths (CSP, errors, broken assets, reflow, axe)`);
if (QA_ONLY) { console.log("\n--qa: stopping before commit."); process.exit(0); }

// 3. Commit
step(3, "Commit");
git("add", "-A");
if (git("diff", "--cached", "--quiet").status === 0) {
  console.log("Nothing new to commit; pushing existing commits.");
} else {
  const c = spawnSync("git", [...IDENTITY, "commit", "-q", "-F", "-"], { cwd: ROOT, input: MESSAGE, encoding: "utf8" });
  if (c.status !== 0) fail("commit failed: " + c.stderr);
}
const sha = git("rev-parse", "HEAD").stdout.trim();
ok(`HEAD ${sha.slice(0, 7)}: ${git("log", "-1", "--format=%s").stdout.trim()}`);

// 4. Push
step(4, `Push ${branch}`);
let pushed = false;
for (let attempt = 1, wait = 2000; attempt <= 4 && !pushed; attempt++, wait *= 2) {
  const p = git("push", "-u", "origin", branch);
  if (p.status === 0) pushed = true;
  else if (/rejected|non-fast-forward|fetch first/i.test(p.stderr)) fail(`push rejected; the remote has commits you lack. Run: git fetch origin ${branch} && git merge --no-edit FETCH_HEAD, then ship again.`);
  else { console.warn(`push attempt ${attempt} failed, retrying in ${wait / 1000}s`); await new Promise((r) => setTimeout(r, wait)); }
}
if (!pushed) fail("push failed after 4 attempts (network?).");
ok("pushed");
if (NO_WAIT) process.exit(0);

// 5. Wait for the Vercel deployment of this exact commit
step(5, "Vercel deployment");
// curl, not fetch: Node's fetch ignores HTTPS_PROXY, and sandboxes often route outbound traffic through a proxy.
const api = async (p) => {
  const url = `https://api.vercel.com${p}${p.includes("?") ? "&" : "?"}teamId=${VERCEL.team}`;
  const r = spawnSync("curl", ["-s", "--max-time", "20", "-H", `Authorization: Bearer ${process.env.VERCEL_TOKEN || "proxyinjected"}`, url], { encoding: "utf8" });
  if (r.status !== 0) throw new Error("curl failed");
  return JSON.parse(r.stdout);
};
let dep = null;
const deadline = Date.now() + 10 * 60 * 1000;
while (Date.now() < deadline) {
  const list = await api(`/v6/deployments?projectId=${VERCEL.project}&limit=10`).catch(() => null);
  if (!list?.deployments) { console.warn("! cannot reach the Vercel API from here; check the deployment in the dashboard."); process.exit(0); }
  dep = list.deployments.find((d) => d.meta?.githubCommitSha === sha);
  if (dep && ["READY", "ERROR", "CANCELED"].includes(dep.state)) break;
  await new Promise((r) => setTimeout(r, 5000));
}
if (!dep) fail("no deployment for this commit appeared within 10 minutes (is the Git integration connected?).");
if (dep.state !== "READY") {
  const ev = await api(`/v3/deployments/${dep.uid}/events?limit=-1&builds=1`).catch(() => []);
  const lines = (Array.isArray(ev) ? ev : []).map((e) => String(e.payload?.text ?? e.text ?? "").replace(/\x1b\[[0-9;]*m/g, "").trim()).filter(Boolean);
  console.error(lines.slice(-20).join("\n"));
  fail(`deployment ${dep.state} (build log tail above).`);
}
const target = dep.target === "production" ? "PRODUCTION" : "preview";
ok(`${target} deployment READY: https://${dep.url}`);
if (target === "PRODUCTION") ok("live at the production domain (see vercel.json / project domains)");
