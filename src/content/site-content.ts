// ─────────────────────────────────────────────────────────────────────────────
// EDITABLE SITE CONTENT
//
// Everything here is marketing content you control. Two of these blocks are
// PLACEHOLDER and must be replaced with real material before the site is public:
//
//   • customers   — logos/names of companies you actually supply
//   • testimonials — quotes real customers actually gave you, with permission
//
// Publishing invented testimonials or another company's logo as a "customer"
// is false advertising and trademark misuse. `isPlaceholder` below controls a
// visible warning banner; flip it to false only once the content is genuine.
// ─────────────────────────────────────────────────────────────────────────────

// Two flags, not one. They started as a single `isPlaceholder` covering both
// sections, but the customer list is now real while the testimonials are still
// invented — clearing one flag would have dropped the warning from three made-up
// quotes as well.
export const customersArePlaceholder = false;
export const testimonialsArePlaceholder = true;

/** @deprecated Use the specific flags above. Kept so nothing breaks silently. */
export const isPlaceholder = testimonialsArePlaceholder;

// ── Customers ───────────────────────────────────────────────────────────────
// Replace with companies you actually supply. `logo` is an optional path under
// /public (e.g. "/customers/acme.svg"); when absent a typographic mark is used,
// which is a safe default — you need written permission to display a customer's
// actual logo, and most supply agreements cover this explicitly.
export type Customer = { name: string; sector: string; logo?: string };

// Transcribed from the client wall supplied by the business. Names only, with
// no `logo` set, so each renders as a typographic mark — reproducing a
// customer's actual logo needs their permission, and the names alone carry the
// same credibility without that exposure. Add `logo: "/customers/<file>.svg"`
// per entry once permission and the files are in hand.
//
// Sectors are the companies' own industries, not claims about the work done for
// them. A few marks on the supplied sheet were Arabic-only or too small to read
// with confidence and were left out rather than guessed at — a misspelt client
// name is worse than a shorter list.
export const customers: Customer[] = [
  // Food, beverage and ingredients
  { name: "Nestlé", sector: "Food & Beverage" },
  { name: "Danone", sector: "Food & Beverage" },
  { name: "Coca-Cola", sector: "Food & Beverage" },
  { name: "PepsiCo", sector: "Food & Beverage" },
  { name: "Heineken", sector: "Food & Beverage" },
  { name: "Americana", sector: "Food & Beverage" },
  { name: "Juhayna", sector: "Dairy" },
  { name: "Almarai", sector: "Dairy" },
  { name: "Beyti", sector: "Dairy" },
  { name: "Edita", sector: "Bakery & Snacks" },
  { name: "Chipsy", sector: "Snacks" },
  { name: "Halwani Bros", sector: "Food Processing" },
  { name: "Farm Frites", sector: "Food Processing" },
  { name: "Greenland", sector: "Dairy" },
  { name: "Hero", sector: "Food & Beverage" },
  { name: "Savola Group", sector: "Food & Beverage" },
  { name: "Nile Sugar", sector: "Sugar" },
  { name: "Lesaffre Egypt", sector: "Yeast & Fermentation" },
  { name: "Döhler", sector: "Ingredients" },
  { name: "Givaudan", sector: "Flavours & Fragrance" },

  // Pharmaceutical and healthcare
  { name: "Pfizer", sector: "Pharmaceuticals" },
  { name: "GlaxoSmithKline", sector: "Pharmaceuticals" },
  { name: "Novartis", sector: "Pharmaceuticals" },
  { name: "Sanofi", sector: "Pharmaceuticals" },
  { name: "Eli Lilly", sector: "Pharmaceuticals" },
  { name: "SEDICO", sector: "Pharmaceuticals" },

  // Consumer goods
  { name: "Unilever", sector: "Consumer Goods" },
  { name: "Procter & Gamble", sector: "Consumer Goods" },
  { name: "Electrolux", sector: "Home Appliances" },
  { name: "Olympic Group", sector: "Home Appliances" },
  { name: "Fresh", sector: "Home Appliances" },
  { name: "El Araby Group", sector: "Home Appliances" },

  // Automotive and heavy industry
  { name: "Mercedes-Benz", sector: "Automotive" },
  { name: "BMW", sector: "Automotive" },
  { name: "General Motors", sector: "Automotive" },
  { name: "Pirelli", sector: "Automotive" },
  { name: "ArcelorMittal", sector: "Steel" },
  { name: "Saint-Gobain", sector: "Building Materials" },
  { name: "GLC Paints", sector: "Coatings" },

  // Energy, logistics and process
  { name: "TotalEnergies", sector: "Oil & Gas" },
  { name: "Halliburton", sector: "Oil & Gas" },
  { name: "DP World Sokhna", sector: "Ports & Logistics" },
  { name: "KONE", sector: "Lifts & Escalators" },
  { name: "Krones", sector: "Process Machinery" },
  { name: "Groupe Atlantic", sector: "HVAC" },

  // Packaging, paper and plastics
  { name: "Rexam", sector: "Packaging" },
  { name: "Taghleef Industries", sector: "Packaging Films" },
  { name: "Interstate Paper Industries", sector: "Paper" },
  { name: "RKW", sector: "Plastic Films" },
  { name: "HYMA Plastic & Foam", sector: "Plastics" },

  // Other
  { name: "EgyptAir", sector: "Aviation" },
  { name: "Eastern Company S.A.E", sector: "Manufacturing" },
  { name: "Synergy Egypt", sector: "Industrial Services" },
];

// ── Testimonials ────────────────────────────────────────────────────────────
// Replace with real quotes, collected with permission. Keep role and company —
// engineers trust "Maintenance Manager at a named plant" far more than a name
// alone. Do not invent these.
export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  company: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Placeholder — replace with a real customer quote. Ask for something specific: what they needed, how fast it arrived, what it saved them.",
    author: "Customer name",
    role: "Maintenance Manager",
    company: "Company name",
  },
  {
    quote:
      "Placeholder — a quote about cross-referencing or finding an obsolete part works well here, because that is what the platform is genuinely good at.",
    author: "Customer name",
    role: "Automation Engineer",
    company: "Company name",
  },
  {
    quote:
      "Placeholder — a purchasing-side quote about BOM uploads or quote turnaround balances the two engineering ones above.",
    author: "Customer name",
    role: "Procurement Lead",
    company: "Company name",
  },
];

// ── Contact details ─────────────────────────────────────────────────────────
// Real, live contact details — used by the top bar, the floating contact dock
// and the footer, so they only need changing here.
//
// `phone` is the display form; the tel: link strips it back to E.164, and
// `whatsapp` must stay digits only (no +, no spaces) because wa.me rejects
// anything else. Both resolve to +201559404399 — Egypt (20) plus the 015
// mobile prefix with its leading zero dropped, which is what international
// dialling expects.
export const contact = {
  phone: "+20 15 59404399",
  whatsapp: "201559404399",
  email: "technical@nexumotion.com",
  whatsappGreeting: "Hello, I'd like to ask about a part.",
};

// ── About page facts ────────────────────────────────────────────────────────
// These are claims about your business. Set them to what is actually true.
export const companyFacts = {
  foundedYear: "2026",
  city: "Cairo",
  country: "Egypt",
  brandCount: "50+",
  categoryCount: "20",
  regionsServed: "Egypt, GCC & Africa",
};
