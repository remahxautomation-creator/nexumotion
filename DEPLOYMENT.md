# Deployment — AutoParts MENA

## Current state: local production build

The app runs as a real production build on this machine:

```bash
npm run build
npm start          # http://localhost:3000
```

Nothing is exposed publicly. `next start` serves the optimized bundle — the same code
path a real deployment uses, so what you see locally is what would ship.

---

## ⚠️ Blockers before ANY public deployment

These are not optional. The app is functionally complete but not yet safe to expose.

| # | Blocker | Why it matters | Fix |
|---|---|---|---|
| 1 | **Default admin password** | `admin@autoparts-mena.com` / `ChangeMe-Admin1` is in git history and in this repo's seed. Anyone who reads the code owns your admin panel. | Set `ADMIN_PASSWORD` to a strong secret and re-run the seed, or change it in the DB before first boot. |
| 2 | **Demo catalog is fake** | All 486 products have invented SKUs, prices, and stock. Customers finding them would be misled; Google would index fake parts. | Load the real catalog via `/admin/products/import`, or deploy with an empty product table. |
| 3 | **No payment processing** | Checkout records orders as "pay on invoice" only. No card capture exists. | Add Stripe/Paymob/Fawry keys (see below) or keep invoice-only and say so on the checkout page. |
| 4 | **SQLite** | Single-file DB; no concurrent writer safety, no managed backups. | Migrate to PostgreSQL (below). |
| 5 | **`AUTH_SECRET` is dev-only** | Committed-adjacent local value. | Generate a fresh one per environment; never reuse the dev value. |
| 6 | **No HTTPS / no rate limiting** | Credentials would cross the wire in plaintext; APIs are unthrottled. | Terminate TLS at nginx/Vercel; add rate limiting on `/api/auth/*` and `/api/orders`. |

---

## SQLite → PostgreSQL

1. In `prisma/schema.prisma`, change the datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Revert the SQLite adaptations documented in `CLAUDE.md` §2:
   - `Json` list fields (`Product.images`, `Product.certifications`, `SpecTemplate.options`)
     → `String[]`, and drop the `JSON.stringify` / `parseJsonArray` calls at those sites.
   - Optionally promote the documented string fields back to real Prisma enums
     (`role`, `stockStatus`, `dataType`, `matchType`, `status`, `paymentStatus`).
3. Delete `prisma/migrations/` and run `npx prisma migrate dev --name init` against Postgres
   (the existing migrations are SQLite-specific and will not replay).
4. Reseed: `npx tsx prisma/seed.ts` — or import the real catalog instead.

---

## Environment variables

```bash
DATABASE_URL=              # postgresql://user:pass@host:5432/autoparts
AUTH_SECRET=               # openssl rand -hex 32  (unique per environment)
AUTH_TRUST_HOST=true
ADMIN_PASSWORD=            # strong; consumed by prisma/seed.ts
NEXT_PUBLIC_SITE_URL=      # https://yourdomain.com — used by sitemap.xml and robots.txt

# Payments (not yet wired — see Phase 3 remaining in CLAUDE.md)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PAYMOB_API_KEY=
PAYMOB_HMAC_SECRET=
FAWRY_MERCHANT_CODE=
FAWRY_SECURITY_KEY=
```

`NEXT_PUBLIC_SITE_URL` matters: without it, `sitemap.xml` and `robots.txt` advertise
`http://localhost:3000` to search engines.

---

## Option A — Vercel + managed Postgres

Best fit for Next.js. Requires accounts you must create.

1. Create a Postgres database (Neon, Supabase, or Vercel Postgres) → copy its connection string.
2. Complete the PostgreSQL migration above.
3. `npm i -g vercel && vercel login && vercel link`
4. Add every env var above in the Vercel dashboard (Production scope).
5. `vercel --prod`
6. Run migrations against production: `npx prisma migrate deploy`

## Option B — Your Ubuntu ARM server (80.225.65.148)

That box already runs Qualifay with **live WhatsApp sessions**. Rules: add only new
containers, never restart `evolution_api`, and take a free port (5435 and 3000 are taken
by Qualifay — use e.g. 3010 for this app and 5436 for its Postgres).

Rough shape:
1. Push this repo to GitHub, clone it onto the server.
2. Add a `Dockerfile` (multi-stage: `npm ci` → `npm run build` → `next start`) targeting
   `linux/arm64`, plus a `docker-compose.yml` with its own Postgres on 5436.
3. `npx prisma migrate deploy` inside the container on first boot.
4. Add an nginx server block proxying your domain to `127.0.0.1:3010`, then Certbot for TLS.

The Dockerfile and compose file are **not written yet** — they're the first task when you
choose this route.

---

## Post-deploy checklist

- [ ] Admin password changed from the default
- [ ] Real catalog loaded (or product table empty)
- [ ] `NEXT_PUBLIC_SITE_URL` set, `/robots.txt` and `/sitemap.xml` show the real domain
- [ ] HTTPS working; HTTP redirects to HTTPS
- [ ] Place one end-to-end test order, then cancel it
- [ ] Database backups scheduled
- [ ] Confirm `/admin` and `/account` return a redirect (not content) when signed out
