/** Exercises the weight-based shipping quote against real catalogue lines. */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function quote(items: { productId: string; qty: number }[]) {
  const res = await fetch("http://localhost:3000/api/cart/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  return res.ok ? await res.json() : { error: res.status };
}

async function main() {
  const heavy = await prisma.product.findFirst({
    where: { category: { slug: "hydraulics" } },
    select: { id: true, sku: true, price: true, weightKg: true },
  });
  const light = await prisma.product.findFirst({
    where: { category: { slug: "electronic-components" } },
    select: { id: true, sku: true, price: true, weightKg: true },
  });
  const withRealWeight = await prisma.product.findFirst({
    where: { weightKg: { not: null } },
    select: { id: true, sku: true, price: true, weightKg: true },
  });

  if (!heavy || !light || !withRealWeight) { console.log("missing sample products"); process.exit(1); }

  const show = (label: string, t: Record<string, unknown>) =>
    console.log(
      label.padEnd(34),
      "sub $" + t.subtotal,
      "| ship $" + t.shipping,
      "| kg " + t.weightKg,
      "| total $" + t.total,
      "| EGP " + t.totalEgp
    );

  console.log("sample parts:");
  console.log("  heavy (VFD):", heavy.sku, "weight:", heavy.weightKg ?? "estimated");
  console.log("  light (component):", light.sku, "weight:", light.weightKg ?? "estimated");
  console.log("  real weight:", withRealWeight.sku, withRealWeight.weightKg, "kg\n");

  show("1x light component", await quote([{ productId: light.id, qty: 1 }]));
  show("50x light component", await quote([{ productId: light.id, qty: 50 }]));
  show("1x VFD", await quote([{ productId: heavy.id, qty: 1 }]));
  show("10x VFD (heavier)", await quote([{ productId: heavy.id, qty: 10 }]));
  show("1x part w/ real weight", await quote([{ productId: withRealWeight.id, qty: 1 }]));
  show("mixed basket", await quote([
    { productId: heavy.id, qty: 2 },
    { productId: light.id, qty: 20 },
  ]));

  process.exit(0);
}
main();
