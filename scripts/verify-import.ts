import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  const [products, brands, cats, specs, rsPro, noSpec] = await Promise.all([
    p.product.count(),
    p.brand.count(),
    p.category.count(),
    p.productSpec.count(),
    p.product.count({ where: { brand: { name: { contains: "RS PRO" } } } }),
    p.product.count({ where: { specs: { none: {} } } }),
  ]);
  console.log(`products ${products} | brands ${brands} | categories ${cats} | specs ${specs}`);
  console.log(`RS PRO leaked in: ${rsPro} | products with zero specs: ${noSpec}`);

  const top = await p.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { products: { _count: "desc" } },
    take: 10,
  });
  console.log("top brands:", top.map((b) => `${b.name}(${b._count.products})`).join(", "));

  const brandsWithNone = await p.brand.count({ where: { products: { none: {} } } });
  console.log("brands with no products (from original seed):", brandsWithNone);

  const sample = await p.product.findFirst({
    where: { sku: "XB4BD53" },
    include: { brand: true, category: true, specs: true },
  });
  if (sample) {
    console.log(`\nsample: ${sample.sku} | ${sample.brand.name} | ${sample.category.name} | $${sample.price}`);
    console.log("name:", sample.name);
    console.log("shortDesc:", sample.shortDesc);
    console.log("specs:", sample.specs.slice(0, 6).map((s) => `${s.specName}=${s.value}`).join(" ; "));
  }

  // Numeric specs are what the category range filters query.
  const numeric = await p.productSpec.count({ where: { valueNum: { not: null } } });
  console.log("\nnumeric spec values (drive range filters):", numeric);
  process.exit(0);
}
main();
