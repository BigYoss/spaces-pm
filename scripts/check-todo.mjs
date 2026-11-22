// Fails the build if any legal page still has an unresolved [TO CONFIRM: ...] marker. Set ALLOW_TODO=1 for local drafts only.
import { readFileSync, readdirSync } from "node:fs";
const files = ["privacy/index.html", "legal/index.html", "accessibility/index.html", ...readdirSync("content/blog").filter((f) => f.endsWith(".md")).map((f) => `content/blog/${f}`)];
const open = files.flatMap((f) => (readFileSync(f, "utf8").match(/\[TO CONFIRM:[^\]]*\]/g) ?? []).map((m) => `${f}: ${m}`));
if (open.length && !process.env.ALLOW_TODO) {
  console.error("Unresolved legal placeholders:\n" + open.join("\n"));
  process.exit(1);
}
if (open.length) console.warn(`ALLOW_TODO set: ${open.length} placeholder(s) left in drafts.`);
