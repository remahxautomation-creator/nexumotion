import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private/transactional areas must never be indexed
      disallow: ["/admin", "/account", "/api", "/checkout", "/cart", "/orders", "/projects"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
