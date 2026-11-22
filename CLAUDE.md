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
- `src/components/Simulator.tsx` income estimator. Figures come from Spaces' own owner projections (AL licence, 74% occupancy): gross per T0-T3 per year, utilities, accountant 850, condominium 400, wear 200, platforms 15%, management 20% + 23% IVA. Do not change these without new data from Spaces.
- `src/components/AssessmentForm.tsx` composes a WhatsApp or email message. Stores nothing.
- `src/components/HeroVideo.tsx` muted autoplay loop with poster; reduced motion keeps the poster.
- `src/components/useParallax.ts` JS fallback; main parallax is CSS scroll-driven (`view-timeline`) in site.css.
- `accessibility/index.html` + `src/statement.ts` static accessibility statement (second Vite entry, `vercel.json` rewrites `/accessibility`). Update its date and limitations after every audit; never claim more than the audit shows.
- `public/a11y-widget.js` self-hosted accessibility menu (assistive extra only, not compliance). Stores settings in localStorage only after a user change.
- `public/assets` images, hero video (`hero-1080.mp4`, `hero-720.mp4`, `hero-poster.webp`), OG image, favicons. `public/fonts` self-hosted Epilogue.

## Brand (matches spaces-pt.com)
Paper #F6F3EA, sand #EAE6DA, ink #1B1B1B, text #333, muted #595853, single accent sage #5F6E4E. Epilogue, light 300 headlines. Pill buttons, square images. Light theme only.

## Rules
- Never invent prices, reviews, ratings, awards, history or statistics. Reviews are verbatim from spaces-pt.com.
- To confirm with Spaces before launch: "~70 short-stay / ~30 long-term homes", the services list in "What we take care of", medium/long-term fees.
- No em dashes or en dashes in visible copy.
- Keep every hover style inside `@media (hover: hover) and (pointer: fine)`; inputs stay 16px; respect `prefers-reduced-motion`.
- One label per intent: contact CTA is always "Talk to us".
- Set `VITE_SITE_URL` in `.env` (and in Vercel env vars) to the final domain; also update `public/robots.txt` and `public/sitemap.xml`.
- Accessibility target: WCAG 2.2 AA (covers IS 5568 and EN 301 549). Keep the hero video pause button, roving-tabindex radio groups, focus-to-first-error and contrast over photos (tile scrim) intact.
- Privacy: the site sets no cookies and loads no third party before a click (Google Maps is click-to-load in `MapEmbed.tsx`). Adding analytics, pixels or embeds requires a consent banner first and an update to `/privacy`.
- `privacy/`, `legal/` legal pages. `scripts/check-todo.mjs` fails the build while any `[TO CONFIRM: ...]` placeholder remains (ALLOW_TODO=1 for local drafts only).
- Security headers live in `vercel.json` (strict CSP: self-hosted scripts only, Google allowed only as the map frame). Any new third-party script, font, frame or API must be added to the CSP, tested for `securitypolicyviolation` events, and declared in `/privacy`. Keep `/.well-known/security.txt` Expires in the future (renew yearly).
