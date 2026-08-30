import { NextRequest, NextResponse } from "next/server";
import { handlers } from "@/lib/auth";
import { isRateLimited, clientIp } from "@/lib/rate-limit";

export const { GET } = handlers;

/**
 * Rate-limited sign-in.
 *
 * NextAuth's POST handler accepted unlimited attempts, which meant unlimited
 * password guessing against a known admin address. The limit is on the source
 * IP rather than the submitted email, because an attacker controls the email
 * field and would simply vary it.
 *
 * 20 rather than 5: this endpoint also serves session and CSRF calls, not just
 * credential submissions, and a legitimate user reloading a form should never
 * see a 429. It is still three orders of magnitude short of what brute force
 * needs.
 *
 * Note the limiter is in-process, so on Workers each isolate keeps its own
 * counter and the effective ceiling is higher than 20. That is a real
 * weakness — it belongs in KV — but a loose limit is still far better than
 * none.
 */
export async function POST(req: NextRequest) {
  const HOUR = 60 * 60 * 1000;
  if (isRateLimited(`auth:ip:${clientIp(req)}`, 20, HOUR)) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Please try again later." },
      { status: 429 }
    );
  }
  return handlers.POST(req);
}
