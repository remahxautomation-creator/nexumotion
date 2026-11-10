import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import { sendInquiryNotification } from "@/lib/email";
import { sendWhatsAppNotification } from "@/lib/whatsapp";

/**
 * A sourcing request from the home page assistant: a free-text need, up to
 * three answers, and the catalogue parts that were suggested for it.
 *
 * Guests get one request; after that the response asks them to register. The
 * check is on the email they give (durable: it reads past inquiries) and on the
 * IP (per isolate only, so it slows a script rather than stopping one). A
 * signed-in user is not limited beyond the normal hourly rate limit.
 *
 * Saved as an Inquiry first, then announced by email and WhatsApp, so a failed
 * notification never loses the lead — it is still in /admin/inquiries.
 */
const MARKER = "[AI assistant request]";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

  // Honeypot, as on the inquiry form.
  if (str(body?.website, 200)) return NextResponse.json({ ok: true });

  const need = str(body?.need, 1000);
  const answers = Array.isArray(body?.answers) ? body.answers.slice(0, 3).map((a: unknown) => str(a, 300)) : [];
  const matches = Array.isArray(body?.matches) ? body.matches.slice(0, 6).map((m: unknown) => str(m, 200)).filter(Boolean) : [];

  const session = await auth();
  const user = session?.user;
  const name = str(user?.name, 120) || str(body?.name, 120);
  const email = (str(user?.email, 200) || str(body?.email, 200)).toLowerCase();
  const phone = str(body?.phone, 40) || null;
  const company = str(body?.company, 120) || null;

  if (need.length < 5) return NextResponse.json({ error: "Describe what you need" }, { status: 400 });
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (!user && !phone) return NextResponse.json({ error: "A WhatsApp or phone number is required" }, { status: 400 });

  const ip = clientIp(req);
  if (isRateLimited(`need:ip:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  if (!user) {
    const previous = await prisma.inquiry.count({ where: { email, message: { startsWith: MARKER } } });
    if (previous > 0 || isRateLimited(`need:guest:${ip}`, 1, 30 * 24 * 60 * 60 * 1000)) {
      return NextResponse.json({ error: "signup_required", signupRequired: true }, { status: 403 });
    }
  }

  const questions = ["Brand / part number", "Key ratings", "Quantity / timing"];
  const message = [
    MARKER,
    `Need: ${need}`,
    ...answers.map((a: string, i: number) => `${questions[i]}: ${a || "not sure"}`),
    matches.length ? `Suggested from catalogue: ${matches.join("; ")}` : "No catalogue match shown",
    user ? "Account: signed in" : "Account: guest (first request)",
  ].join("\n");

  const qty = Number((answers[2] ?? "").match(/\d+/)?.[0]);
  const created = await prisma.inquiry.create({
    data: {
      kind: "UNLISTED",
      name, email, phone, company,
      message,
      partNumber: answers[0] ? answers[0].slice(0, 120) : null,
      quantity: Number.isFinite(qty) && qty > 0 ? Math.min(qty, 1_000_000) : null,
    },
  });

  // Awaited, not fire-and-forget: Workers cancel outstanding work once the
  // response returns. Both calls cap themselves and swallow their failures.
  await Promise.all([
    sendInquiryNotification(created),
    sendWhatsAppNotification(
      `New AI assistant request\n${name}${company ? ` (${company})` : ""}\n${email}${phone ? `\n${phone}` : ""}\n\n${message.replace(MARKER + "\n", "")}`
    ),
  ]);

  return NextResponse.json({ ok: true });
}
