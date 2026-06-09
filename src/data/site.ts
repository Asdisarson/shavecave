// Single source of truth for business info, services, and opening hours.
// Imported by BOTH the page (src/pages/index.astro) and the SEO/structured
// data (src/layouts/Layout.astro) so the visible content and the JSON-LD can
// never silently drift apart. Edit here, in one place.

const facebook = "https://www.facebook.com/ShaveCaveKlippistofa";

export const business = {
  name: "ShaveCave",
  street: "Fákafeni 9",
  postalCode: "108",
  city: "Reykjavík",
  country: "IS",
  lat: 64.12994,
  lng: -21.86512,
  /** As shown on the page. */
  phoneDisplay: "551-1886",
  /** For the tel: href. */
  phoneHref: "+3545511886",
  /** E.164 form for structured data. */
  telephone: "+354 551 1886",
  email: "shavecave@shavecave.is",
  /** Social profiles — also used (as `sameAs`) in the HairSalon JSON-LD. */
  facebook,
  sameAs: [facebook],
} as const;

// Service names + descriptions. Prices are intentionally not shown.
export const services = [
  { name: "Klipping", desc: "Ráðgjöf, nákvæm klipping og frágangur." },
  { name: "Skeggsnyrting", desc: "Mótun, línur og heitt handklæði." },
  { name: "Rakstur", desc: "Hnífsrakstur, gufa og róandi eftirmeðferð." },
  { name: "Klipping og skegg", desc: "Full þjónusta — klipping og skeggmótun." },
  { name: "Barnaklipping", desc: "Undir 12 ára — sömu umönnun, minni stóll." },
  { name: "Höfuðrakstur", desc: "Hreinn höfuðrakstur með heitu handklæði." },
] as const;

/** Weekday opening hours (Mon–Fri). Weekends closed. */
export const hours = {
  weekdayOpen: "09:15",
  weekdayClose: "18:00",
} as const;

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Minute-of-day form for the open/closed indicator — derived, never hand-typed. */
export const hoursMinutes = {
  open: toMinutes(hours.weekdayOpen),
  close: toMinutes(hours.weekdayClose),
} as const;
