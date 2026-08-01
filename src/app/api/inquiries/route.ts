import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { systems } from "@/content/systems";

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

  // Light rate limit: cap repeat submissions from the same email in an hour.
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await prisma.inquiry.count({ where: { email, createdAt: { gte: hourAgo } } });
  if (recent >= 5) {
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
