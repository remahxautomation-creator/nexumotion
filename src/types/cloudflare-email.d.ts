/**
 * Minimal types for the `cloudflare:email` runtime module.
 *
 * Declared by hand instead of adding @cloudflare/workers-types to the tsconfig
 * lib. That package replaces the DOM globals wholesale, and this project also
 * compiles Node scripts (seed, import, dump-for-d1) in the same unit — the same
 * reason src/lib/prisma.ts types the D1 binding off PrismaD1's constructor
 * rather than the global D1Database. Only what src/lib/email.ts touches is
 * declared; widen it when something else needs more.
 */
declare module "cloudflare:email" {
  export class EmailMessage {
    constructor(from: string, to: string, raw: string | ReadableStream);
    readonly from: string;
    readonly to: string;
  }
}
