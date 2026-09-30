import { contact, social, formatAddress, location } from "@/content/site-content";

/**
 * Site-level identity: who publishes this, and how to search it.
 *
 * The LocalBusiness block next to this one describes the shop as a place a
 * buyer can visit. This describes the *site* as a source: an Organization with
 * a name, logo and contact point, and a WebSite with a SearchAction.
 *
 * The SearchAction matters more than it used to. It is the machine-readable
 * statement that this site has a part-number search at a stable URL, which is
 * what lets an assistant answering "who stocks 1SNA645051R0400" reach the
 * result page directly instead of guessing a URL or giving up at the home page.
 */
export default function WebSiteSchema({ siteUrl }: { siteUrl: string }) {
  const graph = [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "NexuMotion",
      alternateName: "نيكسو موشن",
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      email: contact.email,
      telephone: contact.phone,
      address: {
        "@type": "PostalAddress",
        addressLocality: location.city.en,
        addressRegion: location.governorate.en,
        addressCountry: "EG",
        streetAddress: formatAddress("en"),
      },
      areaServed: ["EG", "SA", "AE", "KW", "QA", "OM", "BH", "Africa"],
      knowsLanguage: ["ar", "en"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: contact.phone,
        email: contact.email,
        availableLanguage: ["Arabic", "English"],
      },
      sameAs: social.map((s) => s.href),
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "NexuMotion",
      inLanguage: ["ar", "en"],
      publisher: { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
