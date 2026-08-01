import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { systems } from "@/content/systems";

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
