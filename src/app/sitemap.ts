import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      take: 5000,
    }),
    prisma.category.findMany({ where: { isActive: true }, select: { slug: true } }),
    prisma.brand.findMany({ where: { isActive: true }, select: { slug: true } }),
  ]);

  return [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/brands`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/search`, changeFrequency: "weekly", priority: 0.5 },
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
