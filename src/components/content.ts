/** Final domain. Set VITE_SITE_URL in .env (used for canonical, Open Graph and schema). */
export const SITE_URL = ((import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://www.example.com").replace(/\/$/, "");

export const PHONE_MAIN = { label: "+351 914 044 112", href: "tel:+351914044112", wa: "351914044112" };
export const PHONE_ALT = { label: "+351 910 794 080", href: "tel:+351910794080" };
export const PHONE_IL = { label: "+972 54 733 3025", href: "tel:+972547333025" };
export const EMAIL = "team@spaces-pt.com";
export const INSTAGRAM = "https://www.instagram.com/spaces_pt/";
export const STUDIO = "https://spaces-pt.com/";
export const TERMS_EN = "https://spaces-pt.com/wp-content/uploads/2025/05/Terms-and-Conditions-of-Studio-Spaces-EN.docx.pdf";
export const TERMS_PT = "https://spaces-pt.com/wp-content/uploads/2025/05/Terms-and-Conditions-of-Studio-Spaces-PT.docx.pdf";
export const MAP_AREA = "https://www.google.com/maps/search/?api=1&query=Porto%20and%20Vila%20Nova%20de%20Gaia%2C%20Portugal";

export function whatsapp(text = "Hi Spaces, I'd like to talk about managing my apartment.") {
  return `https://wa.me/${PHONE_MAIN.wa}?text=${encodeURIComponent(text)}`;
}

/** Owner projections supplied by Spaces (xlsx "Calculate short-term expenses and income"), AL-licensed flats, 74% occupancy. */
export type Typology = "T0" | "T1" | "T2" | "T3";
export const PROJECTIONS: Record<Typology, { label: string; gross: [number, number, number]; utilities: number; note?: string }> = {
  T0: { label: "T0 · studio", gross: [24000, 27000, 29000], utilities: 1300 },
  T1: { label: "T1 · one bedroom", gross: [28000, 30000, 32000], utilities: 1700 },
  T2: { label: "T2 · two bedrooms", gross: [35000, 37000, 40000], utilities: 2000 },
  T3: { label: "T3 · three bedrooms", gross: [41000, 43000, 44000], utilities: 2000, note: "T3 income excludes cleaning fees." },
};
export const FIXED = { accountant: 850, condominium: 400, wear: 200 };
export const PLATFORM_RATE = 0.15;
export const MGMT_RATE = 0.2;
export const IVA = 0.23;

export function project(t: Typology, year: 0 | 1 | 2) {
  const p = PROJECTIONS[t];
  const gross = p.gross[year];
  const running = p.utilities + FIXED.accountant + FIXED.condominium + FIXED.wear;
  const platform = gross * PLATFORM_RATE;
  const management = gross * MGMT_RATE * (1 + IVA);
  const net = gross - running - platform - management;
  return { gross, running, platform, management, net };
}

export const eur = (n: number) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Math.round(n));

export const FAQS: { q: string; a: string }[] = [
  {
    q: "Which areas do you cover?",
    a: "Porto and Vila Nova de Gaia, on both banks of the Douro.",
  },
  {
    q: "What types of rental do you manage?",
    a: "Short stays for holiday and city-break guests, medium stays of weeks to months, and long-term lets to year-round tenants.",
  },
  {
    q: "How much does short-term management cost?",
    a: "Full short-term management is 20% of booking income plus IVA (Portuguese VAT, currently 23%). Medium and long-term fees are agreed per property.",
  },
  {
    q: "What costs does the owner still cover?",
    a: "In Spaces' projections the owner covers utilities and internet, an accountant, condominium fees, wear and tear, and booking-platform fees of around 15% of income. Try the estimator above to see them against income.",
  },
  {
    q: "Do I need an AL licence for short stays?",
    a: "Yes. Renting a flat to short-stay guests in Portugal requires an Alojamento Local (AL) registration, and the rules differ by municipality. The income figures on this page assume a licensed apartment. Ask us about your property's situation.",
  },
  {
    q: "My apartment is empty or dated. Can you help?",
    a: "Yes. Spaces also runs an interior design studio that can plan, furnish and set up a home before it is listed.",
  },
  {
    q: "I live abroad. How do we work together?",
    a: "Most conversations happen on WhatsApp, phone and email. There is a Portuguese line for the team and a separate Israeli number for owner consultations.",
  },
];
