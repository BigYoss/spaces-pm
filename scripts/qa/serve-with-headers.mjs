#!/usr/bin/env node
// Serve a static build with the host's real response headers, so header/CSP checks are meaningful offline.
// Supports vercel.json ("headers" + "rewrites", simple (.*) / :param patterns) and Netlify _headers.
// Usage: node serve_with_headers.mjs <projectDir> [port=4180] [distDir=dist]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const [projectDir, port = 4180, distName = "dist"] = process.argv.slice(2);
if (!projectDir) { console.error("usage: node serve_with_headers.mjs <projectDir> [port] [distDir]"); process.exit(1); }
const dist = path.resolve(projectDir, distName);

// Vercel/Netlify path patterns -> RegExp: "(.*)" and "*" match anything, ":name*" too, ":name" one segment.
const toRegex = (src) => new RegExp("^" + src
  .replace(/\(\.\*\)/g, "\u0000").replace(/:[A-Za-z_]+\*/g, "\u0000").replace(/:[A-Za-z_]+/g, "\u0001").replace(/\*/g, "\u0000")
  .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
  .replace(/\u0000/g, "(.*)").replace(/\u0001/g, "([^/]+)") + "$");

let rules = [], rewrites = [];
const vj = path.join(projectDir, "vercel.json");
const nh = [path.join(dist, "_headers"), path.join(projectDir, "public", "_headers")].find((f) => fs.existsSync(f));
if (fs.existsSync(vj)) {
  const cfg = JSON.parse(fs.readFileSync(vj, "utf8"));
  rules = (cfg.headers || []).map((h) => ({ re: toRegex(h.source), headers: h.headers.map((x) => [x.key, x.value]) }));
  rewrites = (cfg.rewrites || []).map((r) => ({ re: toRegex(r.source), src: r.source, dest: r.destination }));
  console.log(`vercel.json: ${rules.length} header rule(s), ${rewrites.length} rewrite(s)`);
} else if (nh) {
  let cur = null;
  for (const line of fs.readFileSync(nh, "utf8").split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (!/^\s/.test(line)) { cur = { re: toRegex(line.trim()), headers: [] }; rules.push(cur); }
    else if (cur) { const i = line.indexOf(":"); cur.headers.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]); }
  }
  console.log(`_headers: ${rules.length} rule(s)`);
} else console.warn("No vercel.json or _headers found: serving without custom headers.");

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif",
  ".ico": "image/x-icon", ".mp4": "video/mp4", ".webm": "video/webm", ".woff2": "font/woff2", ".woff": "font/woff", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".pdf": "application/pdf" };

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  // Like Vercel: real files win; otherwise the first matching rewrite applies, with :params substituted.
  let p = urlPath;
  const direct = path.join(dist, urlPath);
  const isFile = fs.existsSync(direct) && fs.statSync(direct).isFile();
  if (!isFile) for (const r of rewrites) {
    const m = urlPath.match(r.re);
    if (!m) continue;
    const names = [...r.src.matchAll(/:([A-Za-z_]+)/g)].map((x) => x[1]);
    p = names.reduce((d, n, i) => d.replaceAll(`:${n}`, m[i + 1] ?? ""), r.dest);
    break;
  }
  for (const r of rules) if (r.re.test(urlPath)) for (const [k, v] of r.headers) res.setHeader(k, v);
  let f = path.join(dist, p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  else if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html";
  if (!f.startsWith(dist) || !fs.existsSync(f)) {
    const nf = path.join(dist, "404.html");
    res.statusCode = 404;
    if (fs.existsSync(nf)) { res.setHeader("Content-Type", TYPES[".html"]); return fs.createReadStream(nf).pipe(res); }
    return res.end("Not found");
  }
  res.setHeader("Content-Type", TYPES[path.extname(f).toLowerCase()] || "application/octet-stream");
  fs.createReadStream(f).pipe(res);
}).listen(Number(port), () => console.log(`Serving ${dist} with host headers at http://localhost:${port}`));
