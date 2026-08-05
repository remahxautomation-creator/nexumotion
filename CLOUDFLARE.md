# Deploying to Cloudflare Workers

The app runs on Workers via `@opennextjs/cloudflare`. The Next.js build and the
Worker packaging both succeed; what is still needed from you is a database.

## Why Postgres and not D1

D1 is SQLite and would otherwise be the obvious choice — but **D1 has no
interactive transactions**, and two paths depend on them:

- `src/app/api/orders/route.ts` — decrements stock and writes the order
- `src/app/api/quotes/[id]/route.ts` — same, on quote acceptance

Both run inside `prisma.$transaction(async tx => …)` so stock can never be
deducted without the order being recorded. On D1 those would become separate
writes, and a failure between them would silently lose an order or leak stock.

So the datasource is Postgres, reached over an HTTP driver adapter
(`@prisma/adapter-neon`), which works on the Workers runtime — it has no TCP.

## One-time setup

### 1. Create a Postgres database
[Neon](https://neon.tech) has a free tier and its serverless driver is what the
adapter targets. Supabase or any Postgres reachable over HTTPS also works. Copy
the connection string.

### 2. Point local dev at it
Prisma cannot target two providers from one schema, so local dev now uses the
same Postgres. In `.env`:

```
DATABASE_URL="postgresql://…"
```

### 3. Create the schema and load the catalogue

```bash
npx prisma migrate deploy          # applies prisma/migrations
npx tsx scripts/import-catalog.ts --commit
npx tsx scripts/backfill-datasheets-weights.ts --commit
npx tsx scripts/backfill-images.ts --commit
npx tsx scripts/prune-dead-images.ts --commit
npx tsx scripts/derive-from-specs.ts --commit
npx tsx prisma/seed.ts             # admin user only, after ADMIN_PASSWORD is set
```

The SQLite migrations are archived in `prisma/migrations-sqlite-archive/` for
reference; they will not replay against Postgres.

### 4. Set Worker secrets
Never put these in `wrangler.jsonc` — it is committed.

```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put AUTH_SECRET        # openssl rand -hex 32, fresh per environment
npx wrangler secret put ADMIN_PASSWORD
```

`AUTH_TRUST_HOST=true` and `NEXT_PUBLIC_SITE_URL` are not secret and can go in
the dashboard as plain variables.

## Cloudflare dashboard settings

| Field | Value |
|---|---|
| Project name | `nexumotion` |
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx wrangler deploy` |
| Non-production branches | `npx wrangler versions upload` |
| Root directory | `/` |

`npm run build` alone is not enough — it produces a Next.js server build, not a
Worker. The OpenNext step converts it.

## Local commands

```bash
npm run cf:build     # build the Worker bundle
npm run cf:preview   # run it locally in workerd
npm run cf:deploy    # build and deploy in one step
```

**On Windows**, `cf:build` fails at the final packaging step with
`EPERM: operation not permitted, symlink`. Windows blocks symlink creation
without Developer Mode or an elevated shell. The Next.js build itself completes
— only the local packaging step is affected, and Cloudflare's Linux build
container is not. Enable Developer Mode if you want the full build locally.

## Known behaviour on Workers

- **Images.** `next/image` optimisation is limited on Workers. Only 38% of the
  supplier image URLs still resolved when last checked, so most products show
  the placeholder regardless — see `ENRICHMENT.md`.
- **Query latency is the main cost.** The Neon HTTP driver does a round trip per
  query — the trade for a runtime with no TCP. Measured from a dev machine in
  Egypt against the `eu-central-1` database, warm: homepage 3.9s, a category
  page 7.5s, search 2.4s, a product page 0.7s.

  Most of that is distance, not the driver. A Worker is not in Egypt; it runs at
  the Cloudflare edge, and Neon is in Frankfurt, so production round trips
  should be far shorter than this test. **That is a reasonable expectation, not
  a measurement — re-time these four pages against the deployed Worker before
  trusting it.** If they are still slow, the fix is fewer queries per page
  rather than a faster driver: the category page issues one per filter facet,
  and those can be folded into a single grouped query.
- **No incremental cache configured.** Every catalogue page is `force-dynamic`
  and reads the database per request. If pages are later made static, add an R2
  incremental cache in `open-next.config.ts`.

## Still required before this is a real storefront

Unchanged from `DEPLOYMENT.md`: the admin password is public in the repo,
prices are the source file's UK retail figures with no margin, and stock is
`0 / BACKORDER` on every line.
