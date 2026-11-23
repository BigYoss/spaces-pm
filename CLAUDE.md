# Spaces Property Management website

One-page marketing site for the property-management wing of Spaces (Porto design studio, spaces-pt.com).
Audience: apartment owners in Porto and Vila Nova de Gaia, many living abroad. Primary action: "Talk to us" (WhatsApp +351 914 044 112).

## Stack
- Vite 7 + React 19 + TypeScript, plain CSS in `src/site.css`. No CSS framework.
- Build prerenders the page to static HTML (`src/entry-server.tsx` + `scripts/prerender.mjs`), then hydrates (`src/main.tsx`).
- Icons: `@phosphor-icons/react/dist/ssr` only.
- Static output in `dist/`. Deploy target: Vercel (static, `vercel.json` sets cache and security headers).

## Files
- `src/App.tsx` page sections, JSON-LD (LocalBusiness + FAQPage).
- `src/components/content.ts` contact details, fees, FAQ, income projections (single source of truth).
- `src/components/Simulator.tsx` income estimator. Figures come from Spaces' own owner projections (centrally located flat, AL licence, 74% occupancy): gross per T0-T3 per year, utilities, accountant 850, condominium 400, wear 200, platforms 15%, management 20% + 23% IVA. Do not change these without new data from Spaces.
- `src/components/AssessmentForm.tsx` contact form. With `VITE_FORM_ENDPOINT` (Google Apps Script web app `/exec` URL, set in Vercel) it posts name, email, phone, area, type, stay, message, honeypot `website` and `page` to the script, which appends to the Spaces enquiries sheet (`docs/contact-form-apps-script.gs`), then shows a thank-you. Without it, it falls back to composing a WhatsApp/email message. `/privacy` and the CSP (`connect-src` script.google.com + script.googleusercontent.com) describe the Apps Script path; keep them in sync if the endpoint changes.
- `src/components/HeroVideo.tsx` muted autoplay loop with poster; reduced motion keeps the poster.
- `src/nav.ts` mobile menu (≤900px hamburger, slide-in dialog: focus trap, Esc/backdrop/link close, focus return, inert when closed, scroll lock). Markup lives in `App.tsx` and in each static page header (accessibility, privacy, legal; blog pages inherit from accessibility). Desktop keeps inline links and the header "Talk to us".
- `src/components/useParallax.ts` JS fallback; main parallax is CSS scroll-driven (`view-timeline`) in site.css.
- `accessibility/index.html` + `src/statement.ts` static accessibility statement (second Vite entry, `vercel.json` rewrites `/accessibility`). Update its date and limitations after every audit; never claim more than the audit shows.
- `public/a11y-widget.js` self-hosted accessibility menu (assistive extra only, not compliance). Stores settings in localStorage only after a user change.
- `public/assets` images, hero video (`hero-1080.mp4`, `hero-720.mp4`, `hero-poster.webp`), OG image, favicons. `public/fonts` self-hosted Epilogue.

## Shipping
- Ship every change with `node scripts/ship.mjs -m "message"` (skill: `.claude/skills/ship`). It builds, runs QA on every page under the real `vercel.json` headers (CSP, errors, broken assets, reflow at 1280/375/320, axe), commits with the GitHub no-reply identity, pushes, and waits for the Vercel deployment of that commit. `npm run qa` checks without committing.
- `main` deploys to production; other branches get previews. Never bypass a failed build or QA, never force-push.
- QA tools live in `scripts/qa/` (`serve-with-headers.mjs`, `regression.mjs`). Local `.env` needs `VITE_SITE_URL` and `VITE_FORM_ENDPOINT` to match production.

## Brand (matches spaces-pt.com)
Paper #F6F3EA, sand #EAE6DA, ink #1B1B1B, text #333, muted #595853, single accent sage #5F6E4E. Epilogue, light 300 headlines. Pill buttons, square images. Light theme only.

## Rules
- Never invent prices, reviews, ratings, awards, history or statistics. Reviews are verbatim from spaces-pt.com.
- To confirm with Spaces before launch: "~70 short-stay / ~30 long-term homes", the services list in "What we take care of", medium/long-term fees.
- No em dashes or en dashes in visible copy.
- Keep every hover style inside `@media (hover: hover) and (pointer: fine)`; inputs stay 16px; respect `prefers-reduced-motion`.
- One label per intent: contact CTA is always "Talk to us".
- Set `VITE_SITE_URL` in `.env` (and in Vercel env vars) to the final domain; also update `public/robots.txt` and `public/sitemap.xml`.
- Accessibility target: WCAG 2.2 AA (covers IS 5568 and EN 301 549). Keep the hero video pause button, roving-tabindex radio groups, focus-to-first-error intact. "What we take care of" is deliberately text-only (no photos) for readability.
- Privacy: the site sets no cookies and loads no third party before a click (Google Maps is click-to-load in `MapEmbed.tsx`). Adding analytics, pixels or embeds requires a consent banner first and an update to `/privacy`.
- `privacy/`, `legal/` legal pages. `scripts/check-todo.mjs` fails the build while any `[TO CONFIRM: ...]` placeholder remains (ALLOW_TODO=1 for local drafts only).
- Security headers live in `vercel.json` (strict CSP: self-hosted scripts only, Google allowed only as the map frame). Any new third-party script, font, frame or API must be added to the CSP, tested for `securitypolicyviolation` events, and declared in `/privacy`. Keep `/.well-known/security.txt` Expires in the future (renew yearly).
- Owner guides (blog): Markdown in `content/blog/*.md` with a JSON front-matter block (slug, title, description, summary, published, reviewed, faq, sources). `scripts/build-blog.mjs` runs after the Vite build and writes `/blog`, each `/blog/<slug>`, `/blog/rss.xml`, sitemap entries and `/llms.txt`, reusing the accessibility page as the shell. The build fails on en/em dashes in articles.
- Article rules: every legal, tax or regulatory fact must be backed by a linked source in `sources`; where sources conflict, say so and tell owners to confirm instead of picking a number. Update `reviewed` whenever an article is rechecked (aim: every 6 months, and after any AL or tax law change). Never describe a Spaces service that is not already stated on the site. Write all content originally; competitor sites are for topic ideas only.
