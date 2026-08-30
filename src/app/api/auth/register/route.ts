import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isRateLimited, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Unlimited registration let one source create accounts without bound, which
  // fills the users table and hands an attacker a supply of valid logins to
  // probe with. Limited by IP: the email is attacker-controlled.
  const HOUR = 60 * 60 * 1000;
  if (isRateLimited(`register:ip:${clientIp(req)}`, 5, HOUR)) {
    return NextResponse.json(
      { error: "Too many sign-up attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const email = (body?.email as string | undefined)?.toLowerCase().trim();
  const password = body?.password as string | undefined;
  const name = (body?.name as string | undefined)?.trim();
  const companyName = (body?.companyName as string | undefined)?.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email, password: hash, name: name || null, companyName: companyName || null, role: "BUYER" },
  });

  return NextResponse.json({ ok: true });
}
