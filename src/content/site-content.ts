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

// EXAMPLES — not published. The Testimonials component returns null while
// testimonialsArePlaceholder is true, so none of this reaches the site.
//
// They are written out rather than left as "Placeholder — replace me" so there
// is a target to aim at when asking customers for a quote. Notice what makes
// each one work: a specific part or situation, a number, and an outcome. "Great
// service, highly recommended" persuades nobody and is what you get if you ask
// "can we have a testimonial?" instead of the questions below.
//
// Worth asking a customer:
//   • What were you trying to fix, and what was stopping you?
//   • How long had you been looking before you found it?
//   • What would it have cost you to stay down another day?
//
// Then send back what you wrote, get their written sign-off on the exact
// wording, name, role and company, and only then set the flag to false. Written
// permission matters: publishing a real person's name against words they did
// not approve is its own problem, separate from inventing the quote.
export const testimonials: Testimonial[] = [
  {
    quote:
      "We had a drive fail on the packing line and the original was discontinued. "
      + "I found the replacement through the cross-reference in about ten minutes, "
      + "with the datasheet there to check the control terminals matched. "
      + "Back running the next morning.",
    author: "— name —",
    role: "Maintenance Manager",
    company: "— company —",
  },
  {
    quote:
      "What I actually need is the specification, not a price list. Being able to "
      + "filter on current rating and IP class and get to three real candidates, "
      + "each with its datasheet, is the part that saves me time.",
    author: "— name —",
    role: "Automation Engineer",
    company: "— company —",
  },
  {
    quote:
      "I upload the bill of materials from the panel drawing and get a priced quote "
      + "back against every line, including the parts they had to source. "
      + "That used to be a morning of emails.",
    author: "— name —",
    role: "Procurement Lead",
    company: "— company —",
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

// ── Featured brands ─────────────────────────────────────────────────────────
// The manufacturers shown on the home page, in this order. Curated rather than
// "top 18 by product count", because the wall is a statement about what the
// business represents, not a leaderboard — a brand with three lines can matter
// more to a buyer than one with seventy.
//
// `logo` is a path under /public (e.g. "/brands/siemens.svg"). Without one the
// name renders as a wordmark, so the wall works today and improves the moment
// files are added — no code change needed.
//
// Showing a manufacturer's logo to indicate you stock their products is
// ordinary nominative use and needs no permission, unlike presenting a company
// as a customer. Most manufacturers publish a brand asset pack for exactly
// this; those are the files to use, not screenshots.
//
// Slugs are checked against the catalogue at render time: any entry with no
// live products is dropped rather than linking to an empty page.
export type FeaturedBrand = { slug: string; logo?: string };

export const featuredBrands: FeaturedBrand[] = [
  { slug: "siemens" },
  { slug: "abb" },
  { slug: "schneider-electric" },
  { slug: "danfoss" },
  { slug: "omron" },
  { slug: "burkert" },
  { slug: "sick" },
  { slug: "pilz" },
  { slug: "pepperl-fuchs" },
  { slug: "weidm-ller" }, // slug generated before the umlaut was handled; see note in BrandWall
  { slug: "norgren" },
  { slug: "allen-bradley" },
  { slug: "mitsubishi-electric" },
  { slug: "ebm-papst" },
  { slug: "ifm-electronic" },
  { slug: "festo" },
];

// ── Social profiles ─────────────────────────────────────────────────────────
// Rendered in the top bar and the footer. `id` selects the glyph in
// components/layout/SocialLinks.tsx — add the glyph there before adding a
// network here, or it will render nothing.
export type SocialLink = { id: "linkedin" | "instagram" | "facebook" | "tiktok"; label: string; href: string };

export const social: SocialLink[] = [
  { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/nexumotion/" },
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/nexumotion/" },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61593233602328",
  },
  { id: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@nexumotion_automation" },
];

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
