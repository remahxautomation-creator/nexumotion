import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { featuredBrands } from "@/content/site-content";

/**
 * Cached reads for the queries that run on nearly every page.
 *
 * The catalogue is close to static — it changes when someone edits a product
 * or runs an import, not when a visitor arrives — yet every page was querying
 * it on every request. That cost a database round trip per page view, and made
 * scanner traffic as expensive as real traffic.
 *
 * Only genuinely shared, non-personal reads belong here. Anything scoped to a
 * user (orders, quotes, projects, the cart) must stay uncached: one visitor's
 * data must never be served to another.
 *
 * Revalidation is deliberately long. A new part appearing an hour late is
 * invisible to customers; the alternative is paying for a query on every hit.
 * Anything that must appear immediately can call revalidateTag with the tags
 * below — admin edits are the obvious case, and are wired in api/admin.
 */

export const CACHE_TAGS = {
  categories: "categories",
  brands: "brands",
  products: "products",
} as const;

const HOUR = 3600;

/** Header mega-menu. Runs on every page in the site through the root layout. */
export const getNavCategories = unstable_cache(
  async () =>
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ["nav-categories"],
  { revalidate: HOUR * 6, tags: [CACHE_TAGS.categories] }
);

/** Home page category grid, with product counts. */
export const getCategoriesWithCounts = unstable_cache(
  async () =>
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    }),
  ["categories-with-counts"],
  { revalidate: HOUR, tags: [CACHE_TAGS.categories, CACHE_TAGS.products] }
);

/** Home page brand wall — curated list, filtered to brands that have stock. */
export const getFeaturedBrands = unstable_cache(
  async () =>
    prisma.brand.findMany({
      where: {
        slug: { in: featuredBrands.map((b) => b.slug) },
        isActive: true,
        products: { some: { isActive: true } },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    }),
  ["featured-brands"],
  { revalidate: HOUR * 6, tags: [CACHE_TAGS.brands, CACHE_TAGS.products] }
);

/**
 * Counted facts on the home page.
 *
 * Five aggregate queries that previously ran on every single visit to produce
 * numbers that move a few times a month.
 */
export const getCatalogueFacts = unstable_cache(
  async () => {
    const [products, brands, specs, datasheets, crossRefs] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.brand.count({ where: { isActive: true, products: { some: { isActive: true } } } }),
      prisma.productSpec.count(),
      prisma.product.count({ where: { isActive: true, NOT: { datasheetUrl: null } } }),
      prisma.crossReference.count(),
    ]);
    return { products, brands, specs, datasheets, crossRefs };
  },
  ["catalogue-facts"],
  { revalidate: HOUR * 6, tags: [CACHE_TAGS.products, CACHE_TAGS.brands] }
);

/** About page counts. */
export const getAboutCounts = unstable_cache(
  async () => {
    const [brands, categories] = await Promise.all([
      prisma.brand.count(),
      prisma.category.count(),
    ]);
    return { brands, categories };
  },
  ["about-counts"],
  { revalidate: HOUR * 6, tags: [CACHE_TAGS.brands, CACHE_TAGS.categories] }
);
