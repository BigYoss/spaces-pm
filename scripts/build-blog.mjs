// Builds the owner guides (blog) as static HTML after the Vite build.
// Source: content/blog/*.md, each starting with a JSON front-matter block between "---" lines.
// Output: dist/blog/<slug>/index.html, dist/blog/index.html, dist/blog/rss.xml, sitemap entries, dist/llms.txt.
// Pages reuse the built accessibility page as their shell, so they share the site's CSS, header, footer and widget.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { marked } from "marked";

const ROOT = resolve(".");
const DIST = join(ROOT, "dist");
const SRC = join(ROOT, "content/blog");
const shell = readFileSync(join(DIST, "accessibility/index.html"), "utf8");
// Site origin: from the built canonical (VITE_SITE_URL), else the env var. Preview builds may lack it (Vercel scopes env vars
// per environment); fall back there, but a production build without the real URL must fail rather than ship wrong canonicals.
const fromCanonical = shell.match(/<link rel="canonical" href="(https?:\/\/[^"]+?)\/accessibility"/)?.[1];
const SITE = (fromCanonical || process.env.VITE_SITE_URL || "").replace(/\/$/, "") || (() => {
  if (process.env.VERCEL_ENV === "production") throw new Error("VITE_SITE_URL is not set for this production build.");
  console.warn("build-blog: VITE_SITE_URL not set; using a placeholder origin for this non-production build.");
  return "https://www.example.com";
})();
const WHATSAPP = "https://wa.me/351914044112?text=" + encodeURIComponent("Hi Spaces, I'd like to talk about managing my apartment.");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const jsonLd = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`;
const fmtDate = (d) => new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

// Markdown: tables get a keyboard-reachable scroll wrapper (WCAG), external links open safely.
const base = marked.Renderer.prototype;
marked.use({
  gfm: true,
  renderer: {
    table(t) { return `<div class="legal-table-wrap" role="region" aria-label="Table" tabindex="0">${base.table.call(this, t)}</div>`; },
    link(l) {
      const html = base.link.call(this, l);
      return /^https?:\/\//.test(l.href) && !l.href.startsWith(SITE) ? html.replace("<a ", '<a rel="noopener" ') : html;
    },
  },
});

function parse(file) {
  const raw = readFileSync(join(SRC, file), "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = JSON.parse(m[1]);
  for (const k of ["slug", "title", "description", "summary", "published", "reviewed"]) if (!meta[k]) throw new Error(`${file}: missing ${k}`);
  const body = m[2];
  if (/[\u2013\u2014]/.test(raw)) throw new Error(`${file}: contains an en or em dash (site rule)`);
  const words = body.split(/\s+/).filter(Boolean).length;
  return { ...meta, body, html: marked.parse(body), minutes: Math.max(2, Math.round(words / 220)) };
}

function page({ path, title, description, main, ld }) {
  return shell
    .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${esc(description)}" />`)
    .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${SITE}${path}" />` +
      `\n    <meta property="og:type" content="article" />\n    <meta property="og:title" content="${esc(title)}" />\n    <meta property="og:description" content="${esc(description)}" />\n    <meta property="og:url" content="${SITE}${path}" />\n    <meta property="og:image" content="${SITE}/assets/og.jpg" />\n    <link rel="alternate" type="application/rss+xml" title="Spaces owner guides" href="/blog/rss.xml" />\n    ${ld.map(jsonLd).join("\n    ")}`)
    .replace(/<main id="main" class="legal">[\s\S]*<\/main>/, `<main id="main" class="legal post">\n${main}\n    </main>`)
    .replaceAll('<a href="/blog">Guides</a>', '<a href="/blog" aria-current="page">Guides</a>');
}

const org = { "@type": "Organization", "@id": `${SITE}/#business`, name: "Spaces", url: `${SITE}/` };
const posts = readdirSync(SRC).filter((f) => f.endsWith(".md")).map(parse).sort((a, b) => b.published.localeCompare(a.published) || a.title.localeCompare(b.title));

for (const p of posts) {
  const path = `/blog/${p.slug}`;
  const related = posts.filter((x) => x.slug !== p.slug).slice(0, 3);
  const faq = p.faq?.length ? `
      <h2>Questions owners ask</h2>
      ${p.faq.map((f) => `<h3>${esc(f.q)}</h3>\n      <p>${esc(f.a)}</p>`).join("\n      ")}` : "";
  const sources = p.sources?.length ? `
      <h2>Sources</h2>
      <ul class="post-sources">${p.sources.map((s) => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.label)}</a></li>`).join("")}</ul>` : "";
  const main = `      <nav aria-label="Breadcrumb" class="post-crumbs"><a href="/">Home</a> <span aria-hidden="true">/</span> <a href="/blog">Owner guides</a></nav>
      <h1>${esc(p.title)}</h1>
      <p class="post-meta">Last reviewed ${fmtDate(p.reviewed)} · ${p.minutes} min read</p>
      <div class="post-short"><p class="post-short-label">In short</p><p>${esc(p.summary)}</p></div>
      ${p.html}${faq}${sources}
      <p class="post-note">This guide is general information, not legal or tax advice. Rules in Portugal change often; check the sources above and confirm your own situation with a certified accountant or the local council before acting.</p>
      <div class="post-cta"><p>Want Spaces to look at your apartment?</p><a class="btn btn-solid" href="${WHATSAPP}" target="_blank" rel="noopener">Talk to us</a></div>
      ${related.length ? `<h2>More owner guides</h2>\n      <ul class="post-related">${related.map((r) => `<li><a href="/blog/${r.slug}">${esc(r.title)}</a></li>`).join("")}</ul>` : ""}`;
  const ld = [
    { "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, description: p.description, datePublished: p.published, dateModified: p.reviewed,
      mainEntityOfPage: `${SITE}${path}`, image: `${SITE}/assets/og.jpg`, inLanguage: "en-GB", author: org, publisher: { ...org, logo: { "@type": "ImageObject", url: `${SITE}/assets/logo-512.png` } },
      ...(p.sources?.length ? { citation: p.sources.map((s) => s.url) } : {}) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Owner guides", item: `${SITE}/blog` },
      { "@type": "ListItem", position: 3, name: p.title, item: `${SITE}${path}` }] },
    ...(p.faq?.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: p.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] : []),
  ];
  mkdirSync(join(DIST, "blog", p.slug), { recursive: true });
  writeFileSync(join(DIST, "blog", p.slug, "index.html"), page({ path, title: `${p.title} | Spaces`, description: p.description, main, ld }));
}

// Index
const indexMain = `      <h1>Owner guides</h1>
      <p class="legal-lead">Plain-English guides for apartment owners in Porto and Vila Nova de Gaia: licences, taxes, rental models and running a rental from abroad.</p>
      <ul class="post-list">
${posts.map((p) => `        <li><h2><a href="/blog/${p.slug}">${esc(p.title)}</a></h2><p>${esc(p.description)}</p><p class="post-meta">Last reviewed ${fmtDate(p.reviewed)} · ${p.minutes} min read</p></li>`).join("\n")}
      </ul>`;
writeFileSync(join(DIST, "blog", "index.html"), page({
  path: "/blog", title: "Owner guides | Spaces", description: "Guides for apartment owners in Porto and Gaia: Alojamento Local licences, tourist tax, rental income tax, short vs long-term letting and managing from abroad.",
  main: indexMain,
  ld: [{ "@context": "https://schema.org", "@type": "Blog", name: "Spaces owner guides", url: `${SITE}/blog`, publisher: org, blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${SITE}/blog/${p.slug}`, datePublished: p.published })) }],
}));

// RSS
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Spaces owner guides</title><link>${SITE}/blog</link><description>Guides for apartment owners in Porto and Vila Nova de Gaia.</description><language>en-gb</language>
${posts.map((p) => `<item><title>${esc(p.title)}</title><link>${SITE}/blog/${p.slug}</link><guid>${SITE}/blog/${p.slug}</guid><pubDate>${new Date(p.published + "T09:00:00Z").toUTCString()}</pubDate><description>${esc(p.description)}</description></item>`).join("\n")}
</channel></rss>
`;
writeFileSync(join(DIST, "blog", "rss.xml"), rss);

// Sitemap: add the guides to the static sitemap copied from public/
const smPath = join(DIST, "sitemap.xml");
const sm = readFileSync(smPath, "utf8").replace("</urlset>",
  `  <url><loc>${SITE}/blog</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>\n` +
  posts.map((p) => `  <url><loc>${SITE}/blog/${p.slug}</loc><lastmod>${p.reviewed}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`).join("\n") + "\n</urlset>");
writeFileSync(smPath, sm);

// llms.txt: a plain map of the site for AI assistants (GEO)
const llms = `# Spaces property management

> Spaces manages apartments in Porto and Vila Nova de Gaia, Portugal, for short, medium and long-term rentals. Full short-stay management is 20% of booking income plus IVA; medium and long-term fees are agreed per property. Spaces also runs an interior design studio (spaces-pt.com). Contact: team@spaces-pt.com, +351 914 044 112 (WhatsApp); owner consultations from Israel: +972 54 733 3025.

## Main pages
- [Home](${SITE}/): services, fees, income estimator, how it works, FAQ, contact
- [Accessibility statement](${SITE}/accessibility)
- [Privacy and cookies](${SITE}/privacy)
- [Legal information](${SITE}/legal)

## Owner guides
${posts.map((p) => `- [${p.title}](${SITE}/blog/${p.slug}): ${p.description}`).join("\n")}
`;
writeFileSync(join(DIST, "llms.txt"), llms);

console.log(`Blog: ${posts.length} guide(s), index, RSS, sitemap and llms.txt written.`);
