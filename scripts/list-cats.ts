import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const cs = await p.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });
  for (const c of cs) if (c._count.products > 0) console.log(`${c.slug}: ${c._count.products}`);
  process.exit(0);
}
main();
