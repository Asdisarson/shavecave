# ShaveCave

Marketing site for **ShaveCave** — a walk-in barbershop (klippistofa) in
Reykjavík. Single-page, statically generated with [Astro](https://astro.build)
and [Tailwind CSS](https://tailwindcss.com). Content is in Icelandic.

🌐 Production: <https://shavecave.is>

## Stack

- **Astro 6** — static output (`output: "static"`), no server/runtime needed
- **Tailwind CSS 4** (via `@tailwindcss/postcss`)
- **Self-hosted fonts** — Cinzel + Outfit, bundled with `@fontsource/*` (no
  Google Fonts CDN request)
- **`@astrojs/sitemap`** — generates `sitemap-index.xml` at build

## Develop

```sh
npm install
npm run dev        # http://localhost:4321
```

| Command              | Action                                       |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Start the dev server                         |
| `npm run build`      | Build the production site to `./dist/`       |
| `npm run preview`    | Preview the built site locally               |
| `npm run check`      | Type-check with `astro check`                |
| `npm run gen:assets` | Regenerate `og.png` + `apple-touch-icon.png` |
| `npm run gen:map`    | Regenerate the static location map (`map.webp`) |

## Deploy

Build, then publish the **whole `dist/` folder** to any static host
(no Node server required):

```sh
npm run build
# upload ./dist  →  Netlify / Cloudflare Pages / Vercel / S3 / nginx …
```

- **`public/_headers`** sets security headers (CSP, HSTS, X-Frame-Options, …)
  and long-cache for `/_astro/*`. It is read natively by **Netlify** and
  **Cloudflare Pages**. On **Vercel**, port it to `vercel.json` `headers`; on
  **nginx/Apache**, set the equivalents in server config.
- `robots.txt` and `sitemap-index.xml` are served from the site root.

## Editing content

All page content lives in **`src/pages/index.astro`**:

- **Services** — the `services` array at the top of the file (name +
  description; prices are intentionally not shown).
- **Hours / phone / email / address** — the *Finndu okkur* section.
- **Business info for SEO** (NAP, geo coordinates, opening hours, social links)
  — the `business` object in **`src/layouts/Layout.astro`**, which feeds the
  `HairSalon` JSON-LD structured data. Keep it in sync with the visible content.

If you change the logo (`public/images/logo.png`), run `npm run gen:assets`
to rebuild the social-share image and touch icon. If you move location (edit
`lat`/`lng` in `src/data/site.ts`), run `npm run gen:map` to rebuild the map.

The location map (`public/map.webp`) is a build-time render of OpenStreetMap
tiles (data © OpenStreetMap contributors), embedded as a same-origin image —
so the site makes **no third-party requests at runtime** (no map iframe, no
Google cookies). Clicking the map opens directions in a new tab.

## SEO

- Per-page `<title>`/description, canonical, Open Graph + Twitter cards
- `HairSalon` JSON-LD (name, address, geo, opening hours, social profiles,
  service catalogue)
- `sitemap-index.xml`, `robots.txt`, `og.png` (1200×630), `apple-touch-icon.png`

## Project structure

```text
public/            static assets (logo, favicons, og.png, robots.txt, _headers)
scripts/           build-time helpers (generate-og-assets.mjs)
src/
  layouts/Layout.astro   <head>, meta/SEO, JSON-LD, font imports
  pages/index.astro      the page
  pages/404.astro        not-found page
  styles/global.css      theme tokens, animations, reduced-motion
astro.config.mjs
```
