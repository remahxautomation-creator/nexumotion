import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Serves a product datasheet from our own path, e.g. /datasheet/XB4BD53,
 * so the supplier's document host is not exposed in customer-facing links.
 *
 * IMPORTANT: this is a redirect, not a re-host. The PDF still lives on the
 * source CDN, which means (a) the link breaks if they rotate or remove the
 * asset, and (b) their servers carry the download. The durable fix is to
 * mirror the PDFs into your own object storage, or link to the manufacturer's
 * own datasheet page — most manufacturers publish these openly and would
 * rather distributors linked to them.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;

  const product = await prisma.product.findUnique({
    where: { sku: decodeURIComponent(sku) },
    select: { datasheetUrl: true },
  });

  if (!product?.datasheetUrl) {
    return NextResponse.json({ error: "No datasheet on file for this part" }, { status: 404 });
  }

  // Only ever redirect to a real https URL we stored ourselves.
  let target: URL;
  try {
    target = new URL(product.datasheetUrl);
  } catch {
    return NextResponse.json({ error: "Stored datasheet link is invalid" }, { status: 404 });
  }
  if (target.protocol !== "https:") {
    return NextResponse.json({ error: "Stored datasheet link is invalid" }, { status: 404 });
  }

  return NextResponse.redirect(target.toString(), 302);
}
