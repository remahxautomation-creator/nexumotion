import { location, contact, social } from "@/content/site-content";

/**
 * schema.org LocalBusiness markup.
 *
 * This is the part that actually connects the site to the Google Business
 * Profile. The embedded map is for humans; Google does not read an iframe as
 * evidence of anything. What it reads is this: a machine-readable statement of
 * name, address, coordinates, phone and profile links, which it matches against
 * the listing to confirm they are the same business.
 *
 * The details must agree with the Business Profile *exactly* — same name, same
 * phone, same address. A mismatch is worse than an omission, because Google
 * treats conflicting signals as a reason to trust the listing less. Everything
 * here is therefore generated from the same `location` and `contact` constants
 * the visible page renders, so the two cannot drift apart.
 *
 * `sameAs` links the social profiles, which is how Google associates them with
 * the business rather than treating them as unrelated pages.
 *
 * Emitted as JSON-LD in a script tag, which is Google's documented preference
 * over microdata, and costs nothing at runtime — it is a static string.
 */
export default function LocalBusinessSchema({ siteUrl }: { siteUrl: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${siteUrl}/#business`,
    name: "NexuMotion",
    alternateName: "نيكسو موشن",
    url: siteUrl,
    logo: `${siteUrl}/icon.png`,
    image: `${siteUrl}/icon.png`,
    description:
      "Genuine industrial automation parts for Egypt, the Middle East and Africa — " +
      "PLCs, VFDs, HMIs, sensors and more, with the technical data engineers need to specify them.",
    telephone: contact.phone.replace(/[^\d+]/g, ""),
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      ...(location.street ? { streetAddress: location.street } : {}),
      addressLocality: location.city.en,
      addressRegion: location.governorate.en,
      addressCountry: location.countryCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: location.lat,
      longitude: location.lng,
    },
    hasMap: location.mapsUrl,
    // Sunday to Thursday is the Egyptian working week; stating it in schema is
    // what lets Google show "Open now" rather than nothing.
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    areaServed: [
      { "@type": "Country", name: "Egypt" },
      { "@type": "Place", name: "Middle East" },
      { "@type": "Place", name: "Africa" },
    ],
    sameAs: social.map((s) => s.href),
  };

  return (
    <script
      type="application/ld+json"
      // The payload is built entirely from local constants — no user input
      // reaches it — and JSON.stringify escapes the values.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
