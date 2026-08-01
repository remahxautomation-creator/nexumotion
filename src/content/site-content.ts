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

export const isPlaceholder = true;

// ── Customers ───────────────────────────────────────────────────────────────
// Replace with companies you actually supply. `logo` is an optional path under
// /public (e.g. "/customers/acme.svg"); when absent a typographic mark is used,
// which is a safe default — you need written permission to display a customer's
// actual logo, and most supply agreements cover this explicitly.
export type Customer = { name: string; sector: string; logo?: string };

export const customers: Customer[] = [
  { name: "Your Customer", sector: "Cement" },
  { name: "Your Customer", sector: "Food & Beverage" },
  { name: "Your Customer", sector: "Water Treatment" },
  { name: "Your Customer", sector: "Oil & Gas" },
  { name: "Your Customer", sector: "Pharmaceuticals" },
  { name: "Your Customer", sector: "Textiles" },
  { name: "Your Customer", sector: "Packaging" },
  { name: "Your Customer", sector: "Steel" },
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
// Shown in the floating contact dock. REPLACE THESE with your real numbers
// before the site goes public — the placeholders below are not live lines.
// `whatsapp` must be digits only, international format, no + or spaces.
export const contact = {
  phone: "+20 100 000 0000",
  whatsapp: "201000000000",
  email: "sales@autoparts-mena.com",
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
