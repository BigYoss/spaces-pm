# Spaces Property Management

```bash
npm install
cp .env.example .env        # set VITE_SITE_URL to the final domain
npm run dev                 # http://localhost:5173
npm run build && npm run preview
```

Deploy (Vercel): `npx vercel --prod`, then add `VITE_SITE_URL` under Project Settings > Environment Variables and redeploy.
Replace the hero film: overwrite `public/assets/hero-1080.mp4`, `hero-720.mp4` and `hero-poster.webp` (first frame) with the same names.
