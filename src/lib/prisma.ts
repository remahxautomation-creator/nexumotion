import { cache } from "react";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

/**
 * Prisma client that works both on Node (local dev, `next start`) and on the
 * Cloudflare Workers runtime.
 *
 * On Workers there is no long-lived process and no TCP, so the standard client
 * cannot be instantiated at module load. It is built lazily instead, over
 * Neon's HTTP/WebSocket driver.
 *
 * The export stays a `PrismaClient`-shaped value rather than a factory so the
 * 45 call sites keep working unchanged — the proxy below resolves the real
 * client on first property access.
 *
 * Note on transactions: order creation and quote acceptance rely on
 * interactive transactions (`$transaction(async tx => …)`) to decrement stock
 * and write the order atomically. That is why this targets Postgres and not
 * D1 — D1 has no interactive transactions, so an order could deduct stock and
 * then fail to record the order.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Locally, put it in .env; on Cloudflare, add it " +
        "as a Worker secret (`npx wrangler secret put DATABASE_URL`)."
    );
  }

  // A Neon/Postgres URL over HTTP works in both runtimes. Anything else (a
  // local `file:` SQLite URL, say) is a configuration mistake now that the
  // datasource is Postgres — fail loudly rather than half-working.
  if (url.startsWith("file:")) {
    throw new Error(
      "DATABASE_URL points at a SQLite file, but the schema targets Postgres. " +
        "Use a Postgres connection string (Neon works on both Node and Workers)."
    );
  }

  const adapter = new PrismaNeon({ connectionString: url });
  return new PrismaClient({ adapter });
}

// Workers forbid reusing an I/O object across requests. A module-level client
// holds a Neon socket opened during whichever request happened to be first;
// the next request on that isolate touches it and the runtime kills the
// request with "Cannot perform I/O on behalf of a different request", which
// showed up as the same URL passing and then failing at random.
//
// So on Workers the client is scoped to the request instead. React's cache()
// memoises per request, which keeps it to one client per request rather than
// one per property access on the proxy below.
//
// Node keeps the module-level singleton: there is no such restriction, and a
// fresh pool per request would leak connections across dev hot reloads.
const isWorkers =
  typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";

const getRequestClient = cache((): PrismaClient => createClient());

function resolve(): PrismaClient {
  if (isWorkers) return getRequestClient();
  if (!globalForPrisma.prisma) globalForPrisma.prisma = createClient();
  return globalForPrisma.prisma;
}

// Lazy proxy: nothing connects until the first query, which keeps module load
// cheap on Workers and lets the build run without a database present.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = resolve();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
