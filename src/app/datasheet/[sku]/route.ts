import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mirrorDatasheetUrl } from "@/lib/catalog-mirror";

/**
 * Serves a product datasheet from our own path, e.g. /datasheet/XB4BD53,
 * so the supplier's document host is not exposed in customer-facing links.
 *
 * IMPORTANT: this is a redirect, not a re-host. The PDF still lives on the
 * source CDN, which means the link breaks if they rotate or remove the asset,
 * and their servers carry the download. Re-hosting needs object storage — R2 is
 * not enabled on this account, and it would mean serving ~1.4 GB of documents
 * we did not author. `scripts/check-datasheet-liveness.ts` is the cheaper half
 * of the same goal: it verifies what we link to and clears anything dead, so
 * the rot is visible instead of silent.
 *
 * A missing datasheet is not an error page. This site's whole premise is that a
 * dead end should become an enquiry — the same reason an out-of-stock part and
 * an empty search both offer to source it. Someone who clicked "datasheet" has
 * told us exactly which part they care about, so they are sent to the enquiry
 * form with the SKU already filled in rather than shown a 404.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;

  const decoded = decodeURIComponent(sku);

  // Mirror first, database only as a fallback. A datasheet link is on the
  // product page of a customer who has already decided they are interested, so
  // it should not be the one thing that breaks when D1 is unavailable.
  let datasheetUrl = await mirrorDatasheetUrl(decoded).catch(() => null);

  if (!datasheetUrl) {
    try {
      const product = await prisma.product.findUnique({
        where: { sku: decoded },
        select: { datasheetUrl: true },
      });
      datasheetUrl = product?.datasheetUrl ?? null;
    } catch {
      // Fall through to the 404 below rather than failing the request.
    }
  }

  if (!datasheetUrl) return toInquiry(_req, decoded);

  // Only ever redirect to a real https URL we stored ourselves. A malformed or
  // non-https value is treated as "no datasheet" rather than an error, because
  // to the customer it is the same thing and the enquiry path is more useful.
  let target: URL;
  try {
    target = new URL(datasheetUrl);
  } catch {
    return toInquiry(_req, decoded);
  }
  if (target.protocol !== "https:") return toInquiry(_req, decoded);

  return NextResponse.redirect(target.toString(), 302);
}

/**
 * Sends the visitor to the enquiry form with the part number prefilled.
 *
 * Built against the request's own origin rather than a configured site URL, so
 * it stays correct on preview deployments and on localhost.
 */
function toInquiry(req: NextRequest, sku: string) {
  const url = new URL(`/inquiry?sku=${encodeURIComponent(sku)}`, req.nextUrl.origin);
  return NextResponse.redirect(url.toString(), 302);
}
