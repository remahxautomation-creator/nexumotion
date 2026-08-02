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

  await prisma.inquiry.create({
    data: { name, email, message, company, phone, country, systemSlug },
  });

  return NextResponse.json({ ok: true });
}
