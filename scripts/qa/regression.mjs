#!/usr/bin/env node
// Launch regression check: loads each page under the final headers and reports CSP violations, page errors,
// console errors, broken same-origin resources, missing security headers, and (if axe-core is installed) axe violations.
// Usage: node regression.mjs http://localhost:4180 / /privacy /legal [--widths 1280,320]
// Exit code 1 if anything fails. Third-party network failures are listed separately (sandboxes often block them).
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
// Resolve from the project, NODE_PATH, then the global npm root (sandboxes often preinstall Playwright globally).
let globalRoot = "";
try { globalRoot = require("node:child_process").execSync("npm root -g", { encoding: "utf8" }).trim(); } catch { /* no npm */ }
const load = (id) => { for (const from of [process.cwd() + "/", import.meta.url, globalRoot + "/"]) { try { return createRequire(from)(id); } catch { /* next */ } } try { return require(id); } catch { return null; } };
const resolveFile = (id) => { for (const from of [process.cwd() + "/", import.meta.url, globalRoot + "/"]) { try { return createRequire(from).resolve(id); } catch { /* next */ } } try { return require.resolve(id); } catch { return null; } };
const pw = load("playwright");
if (!pw) { console.error("Playwright not found. npm i -D playwright (and npx playwright install chromium), or run where it is preinstalled."); process.exit(2); }
const { chromium } = pw;
const axePath = resolveFile("axe-core/axe.min.js");
const axeSrc = axePath ? require("node:fs").readFileSync(axePath, "utf8") : null;

const args = process.argv.slice(2);
const wi = args.indexOf("--widths");
const widths = wi >= 0 ? args.splice(wi, 2)[1].split(",").map(Number) : [1280, 320];
const [base, ...paths] = args;
if (!base || !paths.length) { console.error("usage: node regression.mjs <baseUrl> <path...> [--widths 1280,320]"); process.exit(2); }
const origin = new URL(base).origin;
const WANT = ["content-security-policy", "strict-transport-security", "x-content-type-options", "referrer-policy", "permissions-policy"];

const browser = await chromium.launch();
// CSP is enforced in the main context (to catch violations); axe runs in a separate context that bypasses CSP,
// because a strict script-src correctly blocks axe's injected script.
const ctx = await browser.newContext();
const axeCtx = await browser.newContext({ bypassCSP: true });
const out = ["# Launch regression", "", `Base: ${base} · widths: ${widths.join(", ")} · axe: ${axeSrc ? "on" : "off (npm i axe-core to enable)"}`, ""];
let failures = 0;
const external = new Set();

for (const pth of paths) {
  for (const w of widths) {
    const page = await ctx.newPage(); await page.setViewportSize({ width: w, height: 900 });
    const issues = [];
    await page.exposeFunction("__cspHit", (v) => issues.push(`CSP: ${v}`));
    await page.addInitScript(() => document.addEventListener("securitypolicyviolation", (e) => window.__cspHit(`${e.violatedDirective} blocked ${e.blockedURI || "inline"}`)));
    page.on("pageerror", (e) => issues.push(`page error: ${e.message}`));
    page.on("console", (m) => { if (m.type() === "error" && !/net::ERR_(TUNNEL|PROXY|NAME|CONNECTION)/.test(m.text())) issues.push(`console: ${m.text().slice(0, 160)}`); });
    page.on("requestfailed", (r) => { const u = new URL(r.url()); if (u.origin === origin) issues.push(`failed: ${u.pathname} ${r.failure()?.errorText}`); else external.add(u.host); });
    page.on("response", (r) => { const u = new URL(r.url()); if (u.origin === origin && r.status() >= 400) issues.push(`HTTP ${r.status()}: ${u.pathname}`); });
    const resp = await page.goto(base.replace(/\/$/, "") + pth, { waitUntil: "load", timeout: 60000 });
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
    await page.waitForTimeout(800);
    if (w === widths[0]) {
      const h = resp.headers();
      const missing = WANT.filter((k) => !h[k]);
      if (missing.length && (h["content-type"] || "").includes("html")) issues.push(`missing headers: ${missing.join(", ")}`);
    }
    const isHtml = (resp.headers()["content-type"] || "").includes("html");
    if (isHtml && await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) issues.push("horizontal scroll (reflow 1.4.10)");
    if (axeSrc && (resp.headers()["content-type"] || "").includes("html")) {
      const ap = await axeCtx.newPage(); await ap.setViewportSize({ width: w, height: 900 });
      await ap.goto(base.replace(/\/$/, "") + pth, { waitUntil: "load" }); await ap.waitForTimeout(500);
      await ap.addScriptTag({ content: axeSrc });
      const v = await ap.evaluate(async () => (await axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"] })).violations.map((x) => `${x.id} (${x.nodes.length}) ${x.nodes[0].target.join(" ")}`));
      v.forEach((x) => issues.push(`axe: ${x}`));
      await ap.close();
    }
    failures += issues.length;
    out.push(`## ${pth} @${w}px · HTTP ${resp.status()}`, "", issues.length ? issues.map((i) => `- ${i}`).join("\n") : "- ✅ clean", "");
    await page.close();
  }
}
await browser.close();
if (external.size) out.push(`Third-party hosts that failed to load (often a sandbox block, verify on the live site): ${[...external].join(", ")}`, "");
out.push(failures ? `**${failures} issue(s) found.**` : "**All pages clean.**");
console.log(out.join("\n"));
process.exit(failures ? 1 : 0);
