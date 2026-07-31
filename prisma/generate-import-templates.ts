import { PrismaClient } from "@prisma/client";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

// Generates one CSV template per category, with the base import columns plus that
// category's parametric spec columns. Hand these to each brand's distributor rep —
// a filled template imports straight into /admin/products/import.
async function main() {
  const outDir = join(process.cwd(), "import-templates");
  mkdirSync(outDir, { recursive: true });

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { specs: { orderBy: { sortOrder: "asc" } } },
  });

  const base = ["sku", "name", "brand", "category", "price", "stockQty", "shortDesc"];
  const index: string[] = ["category,file,spec_columns"];

  for (const cat of categories) {
    const specCols = cat.specs.map((s) => `spec:${s.key}${s.unit ? ` (${s.unit})` : ""}`);
    const header = [...base, ...specCols].join(",");

    // One illustrative row showing the expected shape — replace with real data.
    const example = [
      "<manufacturer-part-number>",
      "<product name>",
      "<brand name exactly as in the platform>",
      cat.name,
      "<price USD>",
      "<qty>",
      "<one-line description>",
      ...cat.specs.map((s) =>
        s.dataType === "ENUM"
          ? `<${(JSON.parse(String(s.options)) as string[]).slice(0, 3).join(" | ") || "value"}>`
          : s.dataType === "NUMBER"
          ? "<number>"
          : s.dataType === "BOOLEAN"
          ? "<Yes | No>"
          : "<text>"
      ),
    ]
      .map((v) => (v.includes(",") ? `"${v}"` : v))
      .join(",");

    const slug = cat.slug;
    const file = `${slug}.csv`;
    writeFileSync(join(outDir, file), `${header}\n${example}\n`, "utf8");
    index.push(`"${cat.name}",${file},${cat.specs.length}`);
  }

  writeFileSync(join(outDir, "_index.csv"), index.join("\n") + "\n", "utf8");
  console.log(`Wrote ${categories.length} templates + index to import-templates/`);
  process.exit(0);
}

main();
