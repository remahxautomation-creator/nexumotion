import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE } from "@/i18n/dictionaries";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const locale = body?.locale;
  if (locale !== "en" && locale !== "ar") {
    return NextResponse.json({ error: "Unsupported locale" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
