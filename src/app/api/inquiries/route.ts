import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { systems } from "@/content/systems";
import { isRateLimited, clientIp } from "@/lib/rate-limit";

const VALID_SLUGS = new Set(systems.map((s) => s.slug));

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const name = (body?.name as string | undefined)?.trim();
  const email = (body?.email as string | undefined)?.toLowerCase().trim();
  const message = (body?.message as string | undefined)?.trim();
  const company = (body?.company as string | undefined)?.trim() || null;
  const phone = (body?.phone as string | undefined)?.trim() || null;
  const country = (body?.country as string | undefined)?.trim() || null;
  const rawSlug = (body?.systemSlug as string | undefined)?.trim();
  const systemSlug = rawSlug && VALID_SLUGS.has(rawSlug) ? rawSlug : null;

  // Part context. `kind` is not taken from the client as-is — an inquiry that
  // claims to be about a catalogue product is only recorded as one if the SKU
  // resolves below, so a forged body cannot attach itself to a real product.
  const str = (v: unknown, max: number) => {
    const s = typeof v === "string" ? v.trim() : "";
    return s ? s.slice(0, max) : null;
  };
  const requestedKind = (body?.kind as string | undefined)?.trim();
  const sku = str(body?.sku, 120);
  const manufacturer = str(body?.manufacturer, 120);
  const partNumber = str(body?.partNumber, 120);

  const rawQty = Number(body?.quantity);
  const quantity =
    Number.isFinite(rawQty) && rawQty > 0 ? Math.min(Math.floor(rawQty), 1_000_000) : null;

  // Honeypot: bots fill hidden fields, humans don't. Accept silently so the bot
  // sees success and doesn't retry with a different strategy.
  if ((body?.website as string | undefined)?.trim()) {
    return NextResponse.json({ ok: true });
  }

  if (!name || name.length > 120) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (!message || message.length < 10 || message.length > 4000) {
    return NextResponse.json(
      { error: "Please describe your requirement (10 characters minimum)" },
      { status: 400 }
    );
  }

  // Rate limit on BOTH the source IP and the supplied email. The email-only
  // check that used to stand alone here was trivially bypassed by varying the
  // address; the IP bucket is what actually costs an abuser something.
  const HOUR = 60 * 60 * 1000;
  if (
    isRateLimited(`inquiry:ip:${clientIp(req)}`, 10, HOUR) ||
    isRateLimited(`inquiry:email:${email}`, 5, HOUR)
  ) {
    return NextResponse.json(
      { error: "Too many submissions. Please email us directly." },
      { status: 429 }
    );
  }

  // Resolve the SKU against the catalogue rather than trusting the body. This
  // both attaches the inquiry to a real product for the admin view and decides
  // the kind: a SKU we do not carry is an UNLISTED request, not a PRODUCT one.
  const product = sku
    ? await prisma.product.findUnique({
        where: { sku },
        select: { id: true, sku: true, name: true, brand: { select: { name: true } } },
      })
    : null;

  let kind: "SYSTEM" | "PRODUCT" | "UNLISTED";
  if (systemSlug) kind = "SYSTEM";
  else if (product) kind = "PRODUCT";
  else if (sku || partNumber || manufacturer) kind = "UNLISTED";
  else kind = requestedKind === "UNLISTED" ? "UNLISTED" : "SYSTEM";

  await prisma.inquiry.create({
    data: {
      name,
      email,
      message,
      company,
      phone,
      country,
      systemSlug,
      kind,
      productId: product?.id ?? null,
      sku: product?.sku ?? sku,
      manufacturer: manufacturer ?? product?.brand.name ?? null,
      partNumber,
      quantity,
    },
  });

  return NextResponse.json({ ok: true });
}
