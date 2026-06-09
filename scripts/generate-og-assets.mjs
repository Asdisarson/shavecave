// Generates the social-share image and the Apple touch icon from the logo.
// Run after changing the logo:  node scripts/generate-og-assets.mjs
//
// Output (committed to the repo, served as static files):
//   public/og.png               1200×630  — Open Graph / Twitter card
//   public/apple-touch-icon.png  180×180   — iOS home-screen icon
//
// The backgrounds are pure SVG gradients/shapes (no text), so rasterisation
// has no system-font dependency and is fully reproducible.
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logoPath = join(root, "public/images/logo.png");
const VOID = "#040404";

// ── Open Graph image (1200×630) ──────────────────────────────────────────
const W = 1200;
const H = 630;
const bg = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="44%" r="62%">
      <stop offset="0%"  stop-color="#c8966a" stop-opacity="0.24"/>
      <stop offset="42%" stop-color="#b85c38" stop-opacity="0.08"/>
      <stop offset="72%" stop-color="#040404" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${VOID}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="12"
        fill="none" stroke="#2a2722" stroke-width="2"/>
</svg>`);

// Bound the logo to a box with fit:"inside" so it's never wider/taller than
// the box — guarantees a non-negative composite offset for any logo aspect
// ratio (a height-only resize would overflow 1200px on a wide logo and crash).
const boxW = 560;
const boxH = 440;
const logo = await sharp(logoPath)
  .resize({ width: boxW, height: boxH, fit: "inside" })
  .png()
  .toBuffer();
const { width: lw = boxW, height: lh = boxH } = await sharp(logo).metadata();

await sharp(bg)
  .composite([
    {
      input: logo,
      top: Math.round((H - lh) / 2),
      left: Math.round((W - lw) / 2),
    },
  ])
  .png()
  .toFile(join(root, "public/og.png"));

// ── Apple touch icon (180×180, opaque background) ────────────────────────
const S = 180;
const iconBg = Buffer.from(
  `<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg"><rect width="${S}" height="${S}" fill="${VOID}"/></svg>`,
);
const iconSize = Math.round(S * 0.92);
const iconLogo = await sharp(logoPath)
  .resize({
    width: iconSize,
    height: iconSize,
    fit: "contain",
    background: { r: 4, g: 4, b: 4, alpha: 0 },
  })
  .toBuffer();
const iconMeta = await sharp(iconLogo).metadata();

await sharp(iconBg)
  .composite([
    {
      input: iconLogo,
      top: Math.round((S - iconMeta.height) / 2),
      left: Math.round((S - iconMeta.width) / 2),
    },
  ])
  .png()
  .toFile(join(root, "public/apple-touch-icon.png"));

console.log(
  "✓ Generated public/og.png (1200×630) and public/apple-touch-icon.png (180×180)",
);
