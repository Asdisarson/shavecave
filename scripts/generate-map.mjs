// Generates the static location map (public/map.webp) at build time from
// OpenStreetMap tiles, so the page can embed a same-origin <img> instead of a
// Google Maps iframe — no third-party requests or cookies at runtime (GDPR-clean).
// Re-run if the location changes:  node scripts/generate-map.mjs
//
// Map data © OpenStreetMap contributors (ODbL). Attribution is shown on the page.
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { business } from "../src/data/site.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const LAT = business.lat;
const LNG = business.lng;
const Z = 16; // zoom
const TILE = 256;
const GRID = 3; // 3×3 tiles → 768×768 before crop
const OUT_W = 768;
const OUT_H = 512;
const PIN_W = 30;
const PIN_H = 40;

// Slippy-map projection → fractional tile coords of the exact point.
const n = 2 ** Z;
const latRad = (LAT * Math.PI) / 180;
const xExact = ((LNG + 180) / 360) * n;
const yExact = ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n;
const x0 = Math.floor(xExact) - (GRID - 1) / 2;
const y0 = Math.floor(yExact) - (GRID - 1) / 2;

async function fetchTile(x, y) {
  const url = `https://tile.openstreetmap.org/${Z}/${x}/${y}.png`;
  const res = await fetch(url, {
    headers: { "User-Agent": "ShaveCave-static-map/1.0 (+https://shavecave.is)" },
  });
  if (!res.ok) throw new Error(`tile ${x}/${y} → HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// Fetch the grid sequentially (gentle on the tile server).
const composites = [];
for (let dx = 0; dx < GRID; dx++) {
  for (let dy = 0; dy < GRID; dy++) {
    composites.push({
      input: await fetchTile(x0 + dx, y0 + dy),
      top: dy * TILE,
      left: dx * TILE,
    });
  }
}

const stitched = await sharp({
  create: { width: GRID * TILE, height: GRID * TILE, channels: 3, background: "#1a1a1a" },
})
  .composite(composites)
  .png()
  .toBuffer();

// Dark theme: desaturate, invert, gentle contrast — matches the site palette.
const dark = await sharp(stitched)
  .grayscale()
  .negate({ alpha: false })
  .modulate({ brightness: 1.18 })
  .linear(1.06, 6)
  .toBuffer();

// Amber pin at the exact location, anchored at its bottom tip. Composited
// AFTER the dark transform so it keeps its true brand colour.
const pin = Buffer.from(`
<svg width="${PIN_W}" height="${PIN_H}" xmlns="http://www.w3.org/2000/svg">
  <path d="M15 39 C15 39 28 22 28 13.5 A13 13 0 1 0 2 13.5 C2 22 15 39 15 39 Z"
        fill="#c8966a" stroke="#040404" stroke-width="1.5"/>
  <circle cx="15" cy="13.5" r="4.5" fill="#040404"/>
</svg>`);

const markerX = (xExact - x0) * TILE;
const markerY = (yExact - y0) * TILE;
const withPin = await sharp(dark)
  .composite([
    { input: pin, top: Math.round(markerY - PIN_H), left: Math.round(markerX - PIN_W / 2) },
  ])
  .toBuffer();

// Crop to a landscape frame centred on the marker.
const cropLeft = Math.max(0, Math.min(GRID * TILE - OUT_W, Math.round(markerX - OUT_W / 2)));
const cropTop = Math.max(0, Math.min(GRID * TILE - OUT_H, Math.round(markerY - OUT_H / 2)));
await sharp(withPin)
  .extract({ left: cropLeft, top: cropTop, width: OUT_W, height: OUT_H })
  .webp({ quality: 82 })
  .toFile(join(root, "public/map.webp"));

console.log(`✓ Generated public/map.webp (${OUT_W}×${OUT_H}) — © OpenStreetMap contributors`);
