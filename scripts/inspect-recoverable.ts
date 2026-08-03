/** What can be filled from specs we already store, before going to any API. */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const specs = await prisma.productSpec.findMany({ select: { specKey: true, specName: true, value: true, productId: true } });

  const byKey = new Map<string, number>();
  for (const s of specs) byKey.set(s.specKey, (byKey.get(s.specKey) ?? 0) + 1);

  console.log("=== most common spec keys ===");
  for (const [k, n] of [...byKey.entries()].sort((a, b) => b[1] - a[1]).slice(0, 22)) {
    console.log(String(n).padStart(5), k);
  }

  // Certifications are currently 100% empty, but approvals data is in the specs.
  const approvals = specs.filter((s) => /standards|approval|certification|hazardous/i.test(s.specName));
  const productsWithApprovals = new Set(approvals.map((s) => s.productId));
  console.log(`\napproval-bearing spec rows : ${approvals.length}`);
  console.log(`distinct products covered  : ${productsWithApprovals.size}`);
  console.log("samples:");
  for (const s of approvals.slice(0, 4)) console.log("  -", s.specName, "=", s.value.slice(0, 110));

  // Which certification marks actually appear?
  const MARKS = ["CE", "UL", "cULus", "cUL", "CSA", "RoHS", "REACH", "UKCA", "ATEX", "IECEx",
    "EAC", "CCC", "KC", "FM", "DNV", "ABS", "LR", "BV", "RCM", "VDE", "TUV", "WEEE", "IP"];
  const markCount = new Map<string, number>();
  for (const s of approvals) {
    for (const m of MARKS) {
      const re = new RegExp(`(^|[^A-Za-z])${m}([^A-Za-z]|$)`);
      if (re.test(s.value)) markCount.set(m, (markCount.get(m) ?? 0) + 1);
    }
  }
  console.log("\ncertification marks present in the data:");
  console.log([...markCount.entries()].sort((a, b) => b[1] - a[1]).map(([m, n]) => `${m}(${n})`).join(", "));

  // Weight is 88% missing — is it hiding in any other spec?
  const weighty = specs.filter((s) => /weight|mass/i.test(s.specName));
  console.log(`\nspec rows mentioning weight/mass: ${weighty.length} across ${new Set(weighty.map(w=>w.productId)).size} products`);

  process.exit(0);
}
main();
