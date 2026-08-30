import { PrismaClient } from "@prisma/client";

/**
 * Prisma client for Cloudflare D1, with a local SQLite fallback.
 *
 * Why D1 rather than the Neon Postgres this replaced: Neon's free tier meters
 * *compute time*, so it bills for how long the database is awake, not for work
 * done. Every page here queries on every request, and scanners hitting the site
 * kept the compute alive around the clock — the allowance ran out and the site
 * went down. D1 bills rows read instead, so idle costs nothing, and it runs
 * inside the same network as the Worker rather than across the Atlantic.
 *
 * Two runtimes, one export:
 *
 *   Workers — the D1 binding `DB` from wrangler.jsonc, resolved per request.
 *   Node    — a plain client against DATABASE_URL (`file:...`), used by
 *             `next dev`, `next start` and the seed/import scripts.
 *
 * The export stays a PrismaClient-shaped value rather than a factory so the
 * call sites are untouched; the proxy below resolves lazily on first property
 * access.
 *
 * Note on transactions: D1 has no interactive transactions, so the
 * `$transaction(async tx => …)` form is unavailable. Order creation and quote
 * acceptance use a conditional UPDATE plus a rows-affected check instead —
 * see the comments in those routes. That is race-safe in a way the previous
 * read-then-write was not.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const onWorkers =
  typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";

function nodeClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Locally this should be a SQLite file, e.g. " +
        'DATABASE_URL="file:./local.db". On Cloudflare the D1 binding is used instead.'
    );
  }
  if (!url.startsWith("file:")) {
    throw new Error(
      `DATABASE_URL is "${url.slice(0, 12)}…" but the schema targets SQLite. ` +
        "Postgres URLs stopped working when this moved to D1."
    );
  }
  return new PrismaClient();
}

async function workerClient(): Promise<PrismaClient> {
  // Imported lazily: both packages pull in Workers-only APIs, and requiring
  // them at module scope breaks the Node scripts that share this file's
  // dependency graph.
  const [{ PrismaD1 }, { getCloudflareContext }] = await Promise.all([
    import("@prisma/adapter-d1"),
    import("@opennextjs/cloudflare"),
  ]);
  const { env } = getCloudflareContext();
  // Typed off PrismaD1's own constructor rather than the global D1Database,
  // which is only declared when @cloudflare/workers-types is in the tsconfig
  // lib — and pulling that in would drag Workers globals into the Node scripts
  // that share this compilation unit.
  type D1 = ConstructorParameters<typeof PrismaD1>[0];
  const db = (env as unknown as Record<string, unknown>).DB as D1 | undefined;
  if (!db) {
    throw new Error(
      "D1 binding `DB` is missing. Check the d1_databases block in wrangler.jsonc."
    );
  }
  return new PrismaClient({ adapter: new PrismaD1(db) });
}

/**
 * On Workers the client is built per request rather than cached globally.
 * Workers forbid reusing an I/O object across requests — the Neon setup hit
 * exactly that ("Cannot perform I/O on behalf of a different request") and it
 * presented as the same URL passing and then failing at random.
 */
let workerClientPromise: Promise<PrismaClient> | null = null;

function resolve(): PrismaClient {
  if (onWorkers) {
    // The proxy below is synchronous, so the async binding lookup is wrapped in
    // a second proxy that awaits it on each call. Prisma's model methods all
    // return promises, so awaiting inside them is transparent to callers.
    return new Proxy({} as PrismaClient, {
      get(_t, model: string | symbol) {
        return new Proxy(
          {},
          {
            get(_t2, method: string | symbol) {
              return async (...args: unknown[]) => {
                workerClientPromise ??= workerClient();
                const client = await workerClientPromise;
                const target = (client as unknown as Record<string, Record<string, unknown>>)[
                  model as string
                ];
                const fn = target?.[method as string];
                if (typeof fn !== "function") {
                  throw new TypeError(`prisma.${String(model)}.${String(method)} is not a function`);
                }
                return (fn as (...a: unknown[]) => unknown).apply(target, args);
              };
            },
          }
        );
      },
    });
  }

  if (!globalForPrisma.prisma) globalForPrisma.prisma = nodeClient();
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = resolve();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
