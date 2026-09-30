/**
 * ItemList + BreadcrumbList for a category or brand listing.
 *
 * A listing page is the answer to "what <brand>/<category> parts do you have",
 * and without this its content is only a grid of links — readable by a human,
 * ignored by anything summarising the page. The ItemList names the parts in
 * order with their URLs, so an assistant can cite specific part numbers from
 * one fetch instead of crawling each product page.
 *
 * Capped at 60 items: enough to be representative, short enough that the JSON
 * does not outweigh the page it describes.
 */
export default function ListingSchema({
  siteUrl,
  kind,
  name,
  slug,
  products,
  total,
}: {
  siteUrl: string;
  kind: "categories" | "brands";
  name: string;
  slug: string;
  products: Array<{ sku: string; name: string; slug: string }>;
  total: number;
}) {
  const pageUrl = `${siteUrl}/${kind}/${slug}`;
  const graph = [
    {
      "@type": "CollectionPage",
      "@id": `${pageUrl}#page`,
      url: pageUrl,
      name,
      isPartOf: { "@id": `${siteUrl}/#website` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: total,
        itemListElement: products.slice(0, 60).map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${siteUrl}/products/${p.slug}`,
          name: `${p.sku} — ${p.name}`,
        })),
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        {
          "@type": "ListItem", position: 2,
          name: kind === "brands" ? "Brands" : "Categories",
          item: `${siteUrl}/${kind === "brands" ? "brands" : "search"}`,
        },
        { "@type": "ListItem", position: 3, name, item: pageUrl },
      ],
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
