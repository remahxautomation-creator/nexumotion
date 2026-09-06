/**
 * Read-only catalogue served from the assets binding when the database is not
 * available.
 *
 * The site went down when D1's daily read limit was reached: every page that
 * queried the catalogue returned 500 while pages touching no data stayed up.
 * The aggregate counters are covered by the committed snapshot, but search,
 * brand pages, category pages and product detail all need real product rows —
 * ~1.2 MB of them, far too much for the Worker bundle, which has roughly 750 KB
 * of headroom under Cloudflare's 3 MiB limit once Prisma's WASM engine is
 * counted.
 *
 * So the rows live in public/catalog/ and are fetched through the ASSETS
 * binding, which has no size limit and costs the Worker script nothing. Files
 * are loaded lazily and independently: a search reads listing.json only and
 * never pays for the 756 KB of specs that only product detail needs.
 *
 * This is the primary read path for catalogue browsing, not a fallback. It
 * began as one — consulted only when Prisma threw — but that left the site
 * paying for 1,025 rarely-changing products on every request, which is what
 * exhausted the read limit in the first place. Callers now read the mirror
 * first and drop to D1 only when a slug is missing from it, which happens in
 * the window between a catalogue import and the next `npm run mirror`.
 *
 * It is read-only and has no notion of stock or price movement since it was
 * generated. That is acceptable because the catalogue is published content —
 * every line is BACKORDER and quoted by inquiry — but it is the reason order
 * placement re-reads stock from D1 rather than trusting anything here.
 *
 * Regenerate with `npx tsx scripts/build-mirror.ts` after any catalogue import.
 */

/** Compact on-disk shapes. Single-letter keys — see scripts/build-mirror.ts. */
type RawProduct = {
  i: string; s: string; n: string; g: string; d: string | null;
  p: number; cp: number | null; ss: string; q: number;
  b: string; c: string | null; m: string | null;
};
type RawBrand = { id: string; slug: string; name: string; country: string | null; description: string | null };
type RawCategory = { id: string; slug: string; name: string; description: string | null };
type RawCrossRef = { k: string; i: string };

type ListingFile = {
  generatedAt: string;
  brands: RawBrand[];
  categories: RawCategory[];
  products: RawProduct[];
  crossRefs: RawCrossRef[];
};
type DetailFile = {
  generatedAt: string;
  detail: Record<string, {
    desc: string | null; ds: string | null; w: number | null;
    cert: string | null; imgs: string | null; disc: boolean; repl: string | null;
  }>;
};
type SpecsFile = {
  generatedAt: string;
  specs: Record<string, Array<[string, string | null, string | null, string | null]>>;
};

/** The shape pages actually render — ProductCard's props, plus the brand name. */
export type MirrorProduct = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDesc: string | null;
  price: number;
  comparePrice: number | null;
  stockStatus: string;
  stockQty: number;
  brandName: string;
  brandSlug: string;
  categoryId: string | null;
  image: string | null;
};

/**
 * Parsed files, kept per isolate.
 *
 * Only settled values are stored, never the in-flight promise: Workers reject
 * awaiting I/O started by a different request, which is the failure this
 * codebase already hit with a shared Prisma client. Two concurrent misses may
 * both fetch, which is cheap and harmless.
 */
const files = new Map<string, unknown>();

async function loadFile<T>(name: string): Promise<T> {
  const cached = files.get(name);
  if (cached) return cached as T;

  const data = await readAsset<T>(name);
  files.set(name, data);
  return data;
}

async function readAsset<T>(name: string): Promise<T> {
  const onWorkers =
    typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";

  if (onWorkers) {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = getCloudflareContext();
    const assets = (env as unknown as Record<string, unknown>).ASSETS as
      | { fetch(req: Request): Promise<Response> }
      | undefined;
    if (!assets) throw new Error("ASSETS binding is missing; cannot read the catalogue mirror");

    // The hostname is ignored by the assets binding — only the path is matched.
    const res = await assets.fetch(new Request(`https://assets.local/catalog/${name}`));
    if (!res.ok) throw new Error(`Catalogue mirror ${name} returned ${res.status}`);
    return (await res.json()) as T;
  }

  // Node — `next dev`, `next start` and the scripts. Read straight off disk so
  // the fallback can be exercised locally without deploying.
  const [{ readFile }, { resolve }] = await Promise.all([
    import("node:fs/promises"),
    import("node:path"),
  ]);
  const raw = await readFile(resolve(process.cwd(), "public/catalog", name), "utf8");
  return JSON.parse(raw) as T;
}

/** Indexes built once per isolate, on top of the parsed listing file. */
type ListingIndex = {
  generatedAt: string;
  products: MirrorProduct[];
  byBrandSlug: Map<string, MirrorProduct[]>;
  byCategoryId: Map<string, MirrorProduct[]>;
  bySlug: Map<string, MirrorProduct>;
  brandsBySlug: Map<string, RawBrand>;
  categoriesBySlug: Map<string, RawCategory>;
  categoriesById: Map<string, RawCategory>;
  crossRefs: RawCrossRef[];
};

let index: ListingIndex | null = null;

async function getIndex(): Promise<ListingIndex> {
  if (index) return index;

  const file = await loadFile<ListingFile>("listing.json");

  const brandsById = new Map(file.brands.map((b) => [b.id, b]));
  const products: MirrorProduct[] = file.products.map((p) => {
    const brand = brandsById.get(p.b);
    return {
      id: p.i,
      sku: p.s,
      name: p.n,
      slug: p.g,
      shortDesc: p.d,
      price: p.p,
      comparePrice: p.cp,
      stockStatus: p.ss,
      stockQty: p.q,
      brandName: brand?.name ?? "",
      brandSlug: brand?.slug ?? "",
      categoryId: p.c,
      image: p.m,
    };
  });

  const byBrandSlug = new Map<string, MirrorProduct[]>();
  const byCategoryId = new Map<string, MirrorProduct[]>();
  const bySlug = new Map<string, MirrorProduct>();

  for (const p of products) {
    bySlug.set(p.slug, p);
    if (p.brandSlug) {
      const list = byBrandSlug.get(p.brandSlug);
      if (list) list.push(p);
      else byBrandSlug.set(p.brandSlug, [p]);
    }
    if (p.categoryId) {
      const list = byCategoryId.get(p.categoryId);
      if (list) list.push(p);
      else byCategoryId.set(p.categoryId, [p]);
    }
  }

  index = {
    generatedAt: file.generatedAt,
    products,
    byBrandSlug,
    byCategoryId,
    bySlug,
    brandsBySlug: new Map(file.brands.map((b) => [b.slug, b])),
    categoriesBySlug: new Map(file.categories.map((c) => [c.slug, c])),
    categoriesById: new Map(file.categories.map((c) => [c.id, c])),
    crossRefs: file.crossRefs,
  };
  return index;
}

/**
 * Search, matching the live query's behaviour: SKU, name, short description or
 * brand name, then competitor SKU as a second pass when nothing matched.
 *
 * `contains` in the Prisma query is case-insensitive on SQLite for ASCII, which
 * is what part numbers are, so both sides are lowercased here to agree.
 */
export async function mirrorSearch(
  term: string,
  take = 48
): Promise<{ products: MirrorProduct[]; crossMatched: boolean }> {
  const idx = await getIndex();
  const q = term.trim().toLowerCase();
  if (!q) return { products: [], crossMatched: false };

  const hit = (p: MirrorProduct) =>
    p.sku.toLowerCase().includes(q) ||
    p.name.toLowerCase().includes(q) ||
    (p.shortDesc?.toLowerCase().includes(q) ?? false) ||
    p.brandName.toLowerCase().includes(q);

  const products: MirrorProduct[] = [];
  for (const p of idx.products) {
    if (hit(p)) {
      products.push(p);
      if (products.length >= take) break;
    }
  }
  if (products.length > 0) return { products, crossMatched: false };

  const ids = new Set(
    idx.crossRefs.filter((r) => r.k.toLowerCase().includes(q)).slice(0, take).map((r) => r.i)
  );
  if (ids.size === 0) return { products: [], crossMatched: false };

  const byCross = idx.products.filter((p) => ids.has(p.id)).slice(0, take);
  return { products: byCross, crossMatched: byCross.length > 0 };
}

/** A brand and the products under it, ordered as the live page orders them. */
export async function mirrorBrand(slug: string): Promise<{
  brand: RawBrand;
  products: MirrorProduct[];
  productCount: number;
} | null> {
  const idx = await getIndex();
  const brand = idx.brandsBySlug.get(slug);
  if (!brand) return null;

  const products = idx.byBrandSlug.get(slug) ?? [];
  return { brand, products: products.slice(0, 60), productCount: products.length };
}

/** A category and the products under it. */
export async function mirrorCategory(slug: string): Promise<{
  category: RawCategory;
  products: MirrorProduct[];
  productCount: number;
} | null> {
  const idx = await getIndex();
  const category = idx.categoriesBySlug.get(slug);
  if (!category) return null;

  const products = idx.byCategoryId.get(category.id) ?? [];
  return { category, products: products.slice(0, 60), productCount: products.length };
}

/**
 * One product with everything its page renders.
 *
 * This is the only entry point that pulls detail.json and specs.json, so the
 * listing paths never pay for them.
 */
export async function mirrorProduct(slug: string): Promise<{
  product: MirrorProduct;
  brand: RawBrand | null;
  categoryName: string | null;
  categorySlug: string | null;
  description: string | null;
  datasheetUrl: string | null;
  weightKg: number | null;
  certifications: string | null;
  images: string | null;
  isDiscontinued: boolean;
  specs: Array<{ specKey: string; specName: string | null; value: string | null; unit: string | null }>;
  related: MirrorProduct[];
} | null> {
  const idx = await getIndex();
  const product = idx.bySlug.get(slug);
  if (!product) return null;

  const [detailFile, specsFile] = await Promise.all([
    loadFile<DetailFile>("detail.json"),
    loadFile<SpecsFile>("specs.json"),
  ]);

  const d = detailFile.detail[product.id];
  const specs = (specsFile.specs[product.id] ?? []).map(([specKey, specName, value, unit]) => ({
    specKey,
    specName,
    value,
    unit,
  }));

  const related = (
    product.categoryId ? (idx.byCategoryId.get(product.categoryId) ?? []) : []
  )
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const category = product.categoryId ? (idx.categoriesById.get(product.categoryId) ?? null) : null;

  return {
    product,
    brand: idx.brandsBySlug.get(product.brandSlug) ?? null,
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
    description: d?.desc ?? null,
    datasheetUrl: d?.ds ?? null,
    weightKg: d?.w ?? null,
    certifications: d?.cert ?? null,
    images: d?.imgs ?? null,
    isDiscontinued: d?.disc ?? false,
    specs,
    related,
  };
}

/** When the mirror was generated, for the staleness notice pages show. */
export async function mirrorGeneratedAt(): Promise<string> {
  return (await getIndex()).generatedAt;
}
