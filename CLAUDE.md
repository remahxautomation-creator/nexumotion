# CLAUDE.md — AutoParts MENA: Full Technical Build Contract

> **Brand:** AutoParts MENA
> Industrial automation parts e-commerce · Egypt-first, then Middle East & Africa
> 50+ brands · 5,000+ SKUs target · B2B/B2C hybrid · Engineer-first
> **Framework note:** also read `AGENTS.md` (Next.js version warning from create-next-app).

---

## 0. What AutoParts MENA Is

A production-grade e-commerce platform for industrial automation parts — PLCs, VFDs,
HMIs, servo systems, sensors, safety, pneumatics, process instruments, and more.

**The customer is an engineer, not a shopper.** Every design decision follows from that:

- **Show SKU everywhere** — engineers think in part numbers, not product names
- **No login walls** — pricing and full specs visible to everyone; guest checkout
- **Spec tables over marketing copy** — parametric data is the product page
- **Cross-referencing is a core feature** — "I have a Siemens part number, what's your equivalent?"
- **BOM-first buying** — engineers buy lists, not single items (quick order pad, CSV upload, project lists)

**Business model:** hybrid B2B/B2C. Retail card checkout for small buyers; quotes,
volume tiers, invoice payment, and approval workflows for corporate accounts.

**Key flows:**
```
DISCOVERY:  search (text / parametric / competitor SKU / BOM paste) → product page → cart
B2C:        cart → guest or account checkout → card (Stripe) or Fawry/Paymob (Egypt) → order tracking
B2B:        BOM/project list → quote request → admin quote → approval → invoice order
ADMIN:      bulk product import → stock management → order fulfillment → analytics
```

---

## 1. Technology Stack

| Layer | Technology | Status |
|---|---|---|
| Framework | Next.js 16 App Router + TypeScript (Turbopack) | ✅ built |
| Styling | Tailwind CSS v4 (CSS-first `@theme` in `globals.css`, no config file) | ✅ built |
| UI kit | Custom components; shadcn/ui pieces added as needed | partial |
| ORM | Prisma **6** (pinned — Prisma 7 broke the classic `url` datasource workflow) | ✅ built |
| Database | **SQLite in local dev** → PostgreSQL in production (see §2) | ✅ dev |
| Client state | Zustand (cart, persisted to localStorage) | ✅ built |
| Server data | React Server Components + Prisma direct; React Query only where client fetching is needed | ✅ built |
| Search | Prisma `contains` now → **Meilisearch** for sub-100ms parametric/typo-tolerant search | planned |
| Auth | **NextAuth.js** — credentials + Google OAuth; roles GUEST/BUYER/ENGINEER/ADMIN | planned |
| Payments | Stripe (international cards, USD) + Paymob (EGP cards) + Fawry (EGP cash) | planned |
| File storage | Cloudflare R2 or S3 — datasheets, CAD files, product images | planned |
| CSV/BOM parsing | papaparse | planned |
| i18n | next-intl — English + Arabic (RTL) | planned |
| Fonts | Inter (body) + JetBrains Mono (SKUs — `.sku` class) | ✅ built |
| Icons | lucide-react | ✅ built |
| Deployment | Vercel (app) + managed PostgreSQL (Railway/Neon/Supabase) — or the existing Ubuntu ARM server via Docker | decide at Phase 8 |

---

## 2. Database

### Dev vs production
- **Dev (current):** SQLite, `DATABASE_URL="file:./dev.db"` in `.env`. No Docker on this Windows machine.
- **Production:** PostgreSQL. Switching = change provider in `schema.prisma`, then revert the SQLite adaptations below and re-create migrations.

### SQLite adaptations (revert on PostgreSQL)
1. `String[]` fields (`Product.images`, `Product.certifications`, `SpecTemplate.options`) are `Json` columns holding JSON-encoded arrays. Always read via `parseJsonArray()` in `src/lib/utils.ts`; always write via `JSON.stringify()`.
2. Enums are `String` fields; allowed values documented in schema comments:
   - `User.role`: GUEST | BUYER | ENGINEER | ADMIN
   - `Product.stockStatus`: IN_STOCK | LOW_STOCK | OUT_OF_STOCK | BACKORDER
   - `SpecTemplate.dataType`: TEXT | NUMBER | BOOLEAN | ENUM | RANGE
   - `CrossReference.matchType`: DIRECT | FUNCTIONAL | UPGRADE | LEGACY
   - `Order.status`: PENDING | CONFIRMED | PROCESSING | SHIPPED | DELIVERED | CANCELLED | RETURNED
   - `Order.paymentStatus`: PENDING | PAID | FAILED | REFUNDED

### Models (all in `prisma/schema.prisma`)
`User`, `Brand`, `Category` (hierarchical via `parentId`), `Product`, `SpecTemplate`
(per-category parametric spec definitions — the "parts genome"), `ProductSpec`
(per-product values, with `valueNum` for numeric range filtering), `CrossReference`
(competitor SKU → our product), `Project` + `ProjectItem` (BOMs), `Order` + `OrderItem`,
`Review`.

### Key schema rules
- `Product.sku` and `Product.slug` are unique; slug = `slugify(brand + sku)`
- Prices are `Decimal`; convert with `Number()` at the RSC boundary; format with `formatPrice()`
- Numeric specs duplicate into `ProductSpec.valueNum` so range filters (`gte`/`lte`) work
- `CrossReference.competitorSku` is indexed — it powers search fallback

### Seed
`npx tsx prisma/seed.ts` — deterministic (LCG PRNG, seed 42), safe to re-run (clears first).
Seeds 50 brands, 20 categories with full spec templates, ~485 products with specs +
cross-references, and an admin user (`admin@autoparts-mena.com`).

---

## 3. Repository Structure

```
autoparts-mena/
├── CLAUDE.md                    ← this file (build contract)
├── AGENTS.md                    ← Next.js version warning + build log
├── .env                         ← DATABASE_URL (never commit; gitignored)
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── seed-data/{brands,categories}.ts
└── src/
    ├── app/
    │   ├── layout.tsx               # fonts, header (mega-menu), footer
    │   ├── page.tsx                 # ✅ homepage
    │   ├── categories/[slug]/       # ✅ listing + parametric filter sidebar
    │   ├── products/[slug]/         # ✅ PDP: spec matrix, cross-refs, buy box
    │   ├── brands/                  # ✅ A–Z directory + brand pages
    │   ├── search/                  # ✅ text search + competitor-SKU fallback
    │   ├── cart/                    # ✅ zustand cart
    │   ├── quick-order/             # ✅ "SKU QTY" paste pad
    │   ├── account/                 # ⬜ stub → dashboard (orders, projects, quotes)
    │   ├── checkout/                # ⬜ Phase 3
    │   ├── projects/                # ⬜ Phase 4 (BOM manager)
    │   ├── (admin)/dashboard/       # ⬜ Phase 6
    │   └── api/
    │       ├── products/lookup/     # ✅ SKU lookup for quick order
    │       ├── auth/[...nextauth]/  # ⬜ Phase 2
    │       ├── orders/              # ⬜ Phase 3
    │       └── webhooks/{stripe,paymob,fawry}/  # ⬜ Phase 3
    ├── components/
    │   ├── layout/{Header,Footer}.tsx
    │   ├── product/{ProductCard,AddToCartButton}.tsx
    │   ├── search/FilterSidebar.tsx
    │   ├── cart/                    # ⬜ CartDrawer, MiniCart
    │   └── checkout/                # ⬜ CheckoutForm, AddressForm
    ├── hooks/useCart.ts
    └── lib/{prisma,utils}.ts
```

---

## 4. Design System

| Token | Value | Use |
|---|---|---|
| Primary | `#0052CC` | buttons, links, active states |
| Primary dark | `#003D99` | hover |
| Secondary | `#FF6B00` | CTAs (checkout, hero), cart badge |
| Success | `#36B37E` | in-stock |
| Warning | `#FFAB00` | low stock |
| Danger | `#DE350B` | out of stock, destructive |
| Canvas | `#F4F5F7` | page background |
| Surface | white + `border-slate-200` | cards, tables |

- SKUs always in JetBrains Mono via the `.sku` class
- Stock badge on every product card (`STOCK_LABELS` in `lib/utils.ts`)
- Sticky header: logo → search bar → brands/quick-order/account/cart; category row with mega-menu below
- Mobile (later): bottom tab bar — Search, Categories, Cart, Account

---

## 5. Conventions

- Server components by default; `"use client"` only for interactivity (cart, filters, header, quick-order)
- Catalog pages are `force-dynamic` (DB reads at request time; revisit with caching at Phase 8)
- **Filter state lives in URL search params** — spec template `key`s map 1:1 to query params. This makes searches shareable and is the foundation for saved searches.
- API routes return plain JSON with `Number()`-converted prices
- Currency: USD display for now; multi-currency (EGP/AED/SAR/EUR) is a Phase 3 concern — store order totals + currency on the order, never convert historical orders

---

## 6. Build Order — Phases

Execute in order. Each phase ends with `npm run build` passing and a browser walkthrough.

### Phase 0 — Foundation ✅ DONE
Scaffold, Prisma schema + migration, seed (50 brands / 20 categories / ~485 products),
design tokens, layout with mega-menu.

### Phase 1 — Catalog ✅ DONE
Homepage, category pages with parametric ENUM/BOOLEAN filters, product detail page
(spec matrix, cross-references, buy box), brand directory + pages, text search with
competitor-SKU fallback, cart, quick-order pad + lookup API.

### Phase 2 — Auth & Accounts ✅ DONE
- NextAuth v5 (beta): credentials provider with bcrypt, JWT sessions, role in token/session
  (`src/lib/auth.ts`); Google OAuth deferred — needs client ID/secret from the owner
- `/login`, `/register` pages + `/api/auth/register`; auth guard via `auth()` + `redirect()`
  inside server pages (not middleware — avoids Prisma-on-edge issues)
- Account dashboard shell with orders/projects/saved-searches cards
- Seed admin: `admin@autoparts-mena.com` / `ADMIN_PASSWORD` env (default `ChangeMe-Admin1`)
- `.env` needs `AUTH_SECRET` + `AUTH_TRUST_HOST=true`

### Phase 3 — Checkout & Orders 🟡 CORE DONE (payments pending API keys)
Done:
- `/checkout`: guest + authenticated; address form; totals = subtotal + flat $25 shipping
  (free ≥ $1000) + 14% Egypt VAT — constants at top of `/api/orders` and `/checkout`
- `/api/orders` POST: server-side prices, transactional order + items creation, stock
  decrement with stockStatus recompute; session user wins over typed email; guests get a
  `role=GUEST` user row by email
- Payment method: "confirm order — pay on invoice" (manual follow-up)
- `/orders/[orderNumber]` confirmation — owner session OR `?e=<email>` match required
- `/account/orders` history with status badges
Remaining (needs owner's API keys):
- Stripe Payment Intents (USD) + webhook → `paymentStatus=PAID`
- Paymob card + Fawry reference-code flows (EGP) + webhooks
- Multi-currency display (EGP/AED/SAR rate table); order-confirmation email (Resend)
- Reorder button

### Phase 4 — Projects / BOMs 🟡 CORE DONE
Done:
- `/projects` list + create; `/projects/[id]` detail (owner-only) with per-line stock
  badges, qty editing (blur-to-save), line/project totals, delete project
- BOM import: CSV/TXT file upload or paste; formats `SKU,QTY` / `SKU;QTY` / `SKU QTY` /
  bare `SKU`; header row skipped; per-line added/not_found/invalid results; duplicate
  SKU merges qty. No papaparse — regex parser in `BomImport.tsx` (revisit if Excel needed)
- Bulk API `POST /api/projects/[id]/items` (max 500 lines, exact-then-contains SKU match)
- "Add all to cart" → zustand cart with quantities
Remaining:
- Add-to-project button on product cards; share via signed link; Excel export;
  convert to quote request (Phase 7)

### Phase 5 — Search Upgrade 🟡 CORE DONE (Meilisearch deferred to deployment)
Done:
- Header autocomplete (`SearchAutocomplete`): 200ms debounce, AbortController,
  `/api/search/suggest` returns top-8 products; on zero hits checks cross-references and
  offers "N equivalents found for competitor part"
- NUMBER spec range filters: min/max inputs in `FilterSidebar` → `{key}_min`/`{key}_max`
  URL params → `ProductSpec.valueNum gte/lte` in category query
- Saved searches: `SavedSearch` model (migration `saved_searches`), POST/DELETE
  `/api/saved-searches` (relative catalog URLs only, max 50/user), "Save search" button
  on category pages, `/account/searches` list with delete
Remaining:
- Meilisearch when deployed (Docker); back-in-stock alerts; save-search on /search page

### Phase 6 — Admin 🟡 CORE DONE (built before 4/5 — orders needed managing)
Done:
- `/admin` (layout guards `role === "ADMIN"`; non-admins → `/account`): dashboard with
  order/revenue/user counts, recent orders, low/out-of-stock list
- `/admin/orders`: status-filter chips, inline order status + payment status dropdowns
  → `PATCH /api/admin/orders/[id]` (also accepts `trackingNumber`)
- `/admin/products`: search + low-stock filter, inline price/stock/active editing
  → `PATCH /api/admin/products/[id]` (recomputes stockStatus from qty)
- "Admin Panel" button on /account for admins
- `/admin/products/new` create form; `/admin/products/import` bulk CSV
  (`sku,name,brand,category,price,stockQty,shortDesc`; upsert by SKU; per-row
  created/updated/error results; brand/category matched by name or slug; max 1000 rows)
  — both backed by `POST /api/admin/products`
- `/admin/analytics`: best sellers by revenue, orders by status, revenue by brand/category
Remaining:
- Cross-reference manager; user/role management; top-searches analytics (needs search
  logging); abandoned carts (needs server-side carts)

### Phase 7 — B2B & Quotes 🟡 CORE DONE
Models (migration `quotes_and_price_tiers`): `PriceTier` (productId+minQty unique),
`QuoteRequest` (REQUESTED | QUOTED | ACCEPTED | REJECTED | EXPIRED), `QuoteItem`
(listPrice snapshot + admin `quotedPrice`).
Done:
- "Request a quote" button in cart → `POST /api/quotes` (snapshots list prices)
- `/admin/quotes` + `/admin/quotes/[id]`: per-line price editing with stock visibility,
  live discount %, note to customer, send/update/reject
- `/account/quotes` + `/account/quotes/[id]`: list vs quoted prices, admin reply,
  accept (address form) → transactional order at quoted prices (status CONFIRMED,
  stock decremented, quote linked via `orderId`) or decline
- `PATCH /api/quotes/[id]` handles quote/accept/reject with role + ownership checks
- Volume tiers shown on product pages (1–9 / 10–49 / 50–99 / 100+);
  `unitPriceFor()` helper in `lib/pricing.ts`; seed adds tiers to ~30% of products
Remaining:
- Apply tier pricing automatically in cart/checkout (helper exists, not wired)
- Corporate accounts: multi-user companies, approval workflow, invoice payment terms
- Quote expiry job; request-quote directly from a project

### Phase 8 — i18n, SEO, Production 🟡 SEO + local prod done
Done:
- `sitemap.xml` (559 URLs: products + categories + brands + static) and `robots.txt`
  disallowing `/admin`, `/account`, `/api`, `/checkout`, `/cart`, `/orders`, `/projects`
  — both read `NEXT_PUBLIC_SITE_URL` (defaults to localhost, MUST be set before going live)
- Product pages: `generateMetadata` (SKU-first title, OG tags, canonical) + Product
  JSON-LD with schema.org availability mapping
- Verified running as a real production build (`npm run build && npm start`)
- `DEPLOYMENT.md`: blockers, Postgres migration steps, env vars, Vercel/Ubuntu runbooks
Remaining:
- next-intl: English + Arabic with RTL (`dir="rtl"`, Cairo font)
- BreadcrumbList/Organization JSON-LD; category/brand metadata
- PostgreSQL migration (revert §2 adaptations); R2 storage for datasheets/CAD/images
- Actual remote deploy (see `DEPLOYMENT.md` blockers first); Meilisearch
- Lighthouse ≥ 90; WCAG 2.1 AA pass

---

## 7. Key Constraints & Decisions

| Decision | Rationale |
|---|---|
| SQLite in dev | No Docker on the dev machine; Prisma abstracts the swap |
| Prisma pinned to v6 | v7 removed `url` in datasource blocks; v6 keeps the classic workflow |
| Next.js 16 (not 15) | Latest scaffold; read `node_modules/next/dist/docs/` before using unfamiliar APIs — params/searchParams are Promises |
| Tailwind v4 CSS-first | No JS config; tokens live in `globals.css` `@theme` |
| Filters in URL params | Shareable, bookmarkable, and saved-searches-ready |
| No login walls | Core product principle — engineers must see specs and prices immediately |
| Cross-ref fallback in search | Competitor part numbers are the #1 way buyers arrive |
| Deterministic seed | Reproducible dev data; screenshots and tests stay stable |

---

## 8. Development Commands

```bash
npm run dev                  # dev server on :3000
npm run build                # production build (must pass before every commit)
npx prisma migrate dev       # create/apply migrations
npx prisma studio            # inspect DB
npx tsx prisma/seed.ts       # reseed
```
