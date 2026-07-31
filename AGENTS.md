<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AutoParts MENA — Industrial Automation E-commerce

> Industrial automation parts e-commerce · Egypt / Middle East / Africa
> 50+ brands · 5,000+ SKUs target · B2B/B2C hybrid · Engineer-first

## 0. What This Is

Production-grade e-commerce for industrial automation parts (PLCs, VFDs, HMIs, sensors,
pneumatics, …). Core differentiators:

- **Parametric search** — filter by any spec (voltage, IP rating, kW, …) per category
- **Cross-reference engine** — search by competitor/OEM/legacy part number
- **BOM workflows** — quick order pad, CSV BOM upload, project lists
- **No login walls** — pricing and specs visible to all; guest checkout

## 1. Tech Stack (as built)

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | scaffolded via create-next-app; spec said 15, latest installed |
| Language | TypeScript | strict |
| Styling | Tailwind CSS v4 (CSS-first `@theme` in `globals.css`) | no tailwind.config.js |
| DB | **SQLite for local dev** via Prisma 6 | ⚠️ pinned to Prisma 6 (Prisma 7 changed config model). Production: switch provider to `postgresql` |
| State | Zustand (cart, persisted to localStorage) | `src/hooks/useCart.ts` |
| Icons | lucide-react | |
| Fonts | Inter (body) + JetBrains Mono (SKUs, `.sku` class) | |
| Search | Prisma `contains` queries for now | Meilisearch planned |
| Auth | Not yet — `/account` is a stub | NextAuth planned |

### SQLite adaptations (revert when moving to PostgreSQL)
- `String[]` fields (`images`, `certifications`, `options`) → `Json` storing JSON-encoded arrays; parse with `parseJsonArray()` in `src/lib/utils.ts`
- Prisma enums → `String` fields with allowed values documented in schema comments
  (`role`, `stockStatus`, `dataType`, `matchType`, `status`, `paymentStatus`)

## 2. Commands

```bash
npm run dev                 # dev server on :3000
npm run build               # production build
npx prisma migrate dev      # apply/create migrations
npx tsx prisma/seed.ts      # reseed (deterministic PRNG — stable output)
```

`.env` → `DATABASE_URL="file:./dev.db"`

## 3. Repository Map

```
prisma/
  schema.prisma          # all models (User, Brand, Category, Product, SpecTemplate,
                         #  ProductSpec, CrossReference, Project, Order, Review, …)
  seed.ts                # 50 brands, 20 categories + spec templates, ~485 products
  seed-data/brands.ts    # 50 brand definitions
  seed-data/categories.ts# 20 categories with parametric spec templates
src/
  app/
    page.tsx                     # homepage: hero, trust bar, categories, featured, brands
    categories/[slug]/page.tsx   # category listing + parametric filter sidebar
    products/[slug]/page.tsx     # PDP: spec matrix, cross-refs, buy box, related
    brands/page.tsx              # A–Z brand directory
    brands/[slug]/page.tsx       # brand page
    search/page.tsx              # text search + competitor-SKU cross-ref fallback
    cart/page.tsx                # client cart (zustand)
    quick-order/page.tsx         # "SKU QTY" paste pad
    account/page.tsx             # stub (NextAuth later)
    api/products/lookup/route.ts # SKU lookup for quick order
  components/
    layout/Header.tsx            # sticky header, mega-menu, search bar, cart badge
    layout/Footer.tsx
    product/ProductCard.tsx      # SKU-first card + stock badge + Add to Cart
    product/AddToCartButton.tsx
    search/FilterSidebar.tsx     # URL-param driven ENUM/BOOLEAN filters
  hooks/useCart.ts               # zustand cart store (persisted)
  lib/prisma.ts                  # singleton client
  lib/utils.ts                   # cn, formatPrice, STOCK_LABELS, parseJsonArray
```

## 4. Design System

- Primary `#0052CC` · Secondary/CTA `#FF6B00` · Success `#36B37E` · Warning `#FFAB00` · Danger `#DE350B`
- Canvas `#F4F5F7`, surfaces white with `border-slate-200`
- SKUs always in JetBrains Mono via `.sku` class — **show SKU everywhere**
- Spec tables over marketing copy; stock badge on every card

## 5. Conventions

- Server components by default; `"use client"` only for interactivity (cart, filters, header)
- Category/brand/search pages are `force-dynamic` (SQLite reads at request time)
- Filter state lives in URL search params (shareable/saveable searches later)
- Prices stored as `Decimal`, converted with `Number()` at the boundary, formatted with `formatPrice()`
- Slugs: `slugify(brand + sku)` for products; unique constraints on `sku` and `slug`
- Seed is deterministic (LCG PRNG, seed 42) — reseeding produces identical data

## 6. Roadmap (remaining phases from the build spec)

1. **Search upgrade** — Meilisearch, autocomplete, range sliders for NUMBER specs, saved searches
2. **Auth** — NextAuth (credentials + OAuth), roles GUEST/BUYER/ENGINEER/ADMIN
3. **Checkout** — guest checkout flow, order creation, Stripe + Paymob/Fawry, multi-currency (USD/EUR/EGP/AED/SAR)
4. **Projects/BOMs** — project CRUD, CSV BOM upload (papaparse), share links, Excel export
5. **User dashboard** — orders, reorder, quote requests, back-in-stock alerts
6. **Admin** — product CRUD + bulk CSV import, stock/order management, analytics
7. **i18n** — Arabic RTL + English
8. **Production DB** — PostgreSQL migration (see §1 adaptations), deploy (Vercel + managed PG)
