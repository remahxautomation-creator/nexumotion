import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { systems } from "@/content/systems";
import { mirrorSitemapEntries } from "@/lib/catalog-mirror";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Generated per request, not at build time. The sitemap reads the catalogue,
// and the build runs where no database is reachable (Cloudflare's build
// container, CI). Prerendering it there fails the whole build.
export const dynamic = "force-dynamic";

/**
 * Catalogue URLs for the sitemap.
 *
 * Read from the mirror. This used to query D1 with no fallback, so when the
 * read limit was hit the sitemap silently degraded to an empty document — a
 * 200 response listing zero URLs, which is the worst possible failure mode
 * because nothing looks broken while Google is told the site has no pages.
 */
async function catalogueUrls() {
  const mirrored = await mirrorSitemapEntries().catch(() => null);
  if (mirrored) return mirrored;

  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      take: 5000,
    }),
    prisma.category.findMany({ where: { isActive: true }, select: { slug: true } }),
    prisma.brand.findMany({ where: { isActive: true }, select: { slug: true } }),
  ]);
  return { products, categories, brands };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories, brands } = await catalogueUrls();

  return [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/brands`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/search`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/systems`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/assistant`, changeFrequency: "monthly", priority: 0.8 },
    ...systems.map((s) => ({
      url: `${BASE}/systems/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...categories.map((c) => ({
      url: `${BASE}/categories/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...brands.map((b) => ({
      url: `${BASE}/brands/${b.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${BASE}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
