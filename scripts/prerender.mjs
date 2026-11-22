// Injects the server-rendered page into dist/index.html so crawlers and link previews see the full content.
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const { render } = await import(pathToFileURL(resolve("dist-ssr/entry-server.js")).href);
const file = resolve("dist/index.html");
writeFileSync(file, readFileSync(file, "utf8").replace("<!--app-->", render()));
rmSync("dist-ssr", { recursive: true, force: true });
console.log("Prerendered dist/index.html");
