# Competitor brand study: ALFA Tech, Electech, Al Sakr Online

_Researched 2026-11-10. These are the brands three Egyptian competitors carry, compared
with what NexuMotion lists today, plus a phased plan for adding the ones that fit._

> **How this was gathered.** The three sites are blocked from the cloud session's network,
> so the brand and product-line lists below come from web-search indexes of their pages
> (home, partners, brand and category pages), not from a full crawl. Treat them as the
> competitors' own claims, which may be out of date, and confirm them before signing
> supplier deals. A `nexumotion` cloud environment that allows these hosts now exists, so
> a future session can re-check the lists directly.
>
> **What we take from them:** brand names and product-line names only. Those are facts.
> We do **not** copy their product descriptions, photos or prices. Product data comes
> from the manufacturer or an authorised distributor, as set out in
> `CATALOG_SOURCING.md`.

---

## 1. What each competitor sells

### ALFA Tech: alfatech-eg.net (6th of October City, since 2008)
Electrical-distribution focused, with some automation. Exclusive or authorised for several
Turkish and Italian lines.

| Brand | Origin | Main product lines |
|---|---|---|
| TP Electric | Turkey | Industrial plugs & sockets, heavy-duty connectors, interlocked sockets, thermoplastic/aluminium enclosures |
| Pizzato | Italy | Position switches, safety switches and door interlocks, pushbuttons/HMI devices, lift (elevator) devices |
| Salicru | Spain | On-line UPS, UPS batteries, solar inverters, voltage stabilisers |
| Finder | Italy | PCB relays, industrial plug-in relays, sockets/relay modules, timers |
| AECO | Italy | Proximity, photoelectric, capacitive and level sensors |
| MAKEL | Turkey | Wiring devices: switches, sockets, distribution boxes, MCBs |
| Siemens, Schneider Electric | — | General low-voltage switchgear and automation |
| _Older listings:_ Hyundai Electric, Autonics, Entes, Emas, OSRAM, Elsewedy Cables | | |

### Electech (Electric Technology): electech.com.eg and shop.electech.com.eg (Alexandria, Borg El Arab, Cairo, KSA)
Automation-focused. A Siemens/Schneider panel builder and system integrator with a WooCommerce store.

| Brand | Main product lines seen in the store |
|---|---|
| Siemens | LOGO!, S7-1200, S7-1500, S7-300 PLCs; SINAMICS & MICROMASTER drives; servomotors; SCALANCE switches/modems; AS-i safety F-adapters (3RK2…) |
| Phoenix Contact | Terminal blocks, power supplies, interface relays |
| Turck | Inductive sensors (BI/NI M8–M30, e.g. `BI5U-M18-AP6X-H1141`), capacitive sensors, remote I/O |
| Banner | Photoelectric sensors, wireless sensors (Sure Cross), light curtains, tower lights |
| Rittal | Enclosures, enclosure climate control (fans, coolers), busbar systems |
| SensoPart | Photoelectric sensors, vision sensors (VISOR) |
| Werma | Signal towers, beacons, sounders |
| Schneider Electric | Panel components |

Store categories are PLC, Drives, Communication, Sensors (inductive / capacitive / photoelectric),
Safety relays, Safety switches, Light curtains, Power supplies, Remote I/O, and Optical & audible signals.

### Al Sakr Online: alsakronline.com (54+ brands, claims 10k–39k products)
The broadest catalog, heavily weighted to SICK (about 440 listed items). It also sells
packaging-machinery components.

| Brand | Main product lines |
|---|---|
| SICK | Absolute/incremental encoders, photoelectric & proximity sensors, light curtains (largest range) |
| Schneider Electric, ABB, Siemens, Festo | General automation |
| Murrelektronik | M8/M12 connectors & cordsets, power supplies, unmanaged Ethernet switches, IO-Link/fieldbus I/O |
| RTA | Stepper motor drives and stepper motors |
| Sanyo Denki | Servo motors & amplifiers (SANMOTION), cooling fans |
| YA-VA | Conveyor components (chain, guides, modular conveyors) |
| Findeva | Pneumatic and turbine vibrators (bulk material handling) |
| TOHO | Temperature controllers, chart recorders |
| CAHO | Temperature controllers, solid-state relays |

---

## 2. Gap analysis against NexuMotion

**Live catalog today:** 13 brands with products (Siemens, Schneider, ABB, Allen-Bradley, Omron,
Mitsubishi, Danfoss, SICK, Pilz, Festo, Autonics, Eaton, Delta), 14 live categories and
1,492 products.

| Status | Brands |
|---|---|
| ✅ Already live with products | Siemens, Schneider Electric, ABB, SICK, Festo, Autonics |
| 🟡 In `brands.ts` taxonomy but **no products yet** | Finder, Turck, Banner Engineering, Phoenix Contact |
| ❌ Not on the site at all | Murrelektronik, Rittal, Pizzato, Werma, SensoPart, Sanyo Denki, RTA, Salicru, AECO, CAHO, TOHO, Entes, Emas, TP Electric, YA-VA, Findeva, MAKEL, Hyundai Electric, Elsewedy Cables, OSRAM |

The competitors also cover several **product areas that have no category** on our site:

| Missing category | Brands that need it |
|---|---|
| Enclosures & Cooling | Rittal, TP Electric (enclosures) |
| Signalling Devices (signal towers, beacons, sounders) | Werma, Banner (tower lights) |
| UPS & Power Quality | Salicru |
| Industrial Plugs & Sockets | TP Electric |
| Energy Meters & Power Analysers | Entes |
| Stepper Motors & Drives | RTA (or a filtered sub-type under `Servo & Motion`) |
| Recorders | TOHO (or fold into `Process Instruments`) |

`Operator Devices` already exists in `categories.ts` but has no live products. Emas, Pizzato
pushbuttons and Werma can share it.

---

## 3. Recommended brand priority

The ranking weighs fit with an engineer-first automation catalog, how many competitors
stock the brand (a sign of Egyptian demand), and how easy it is to get a supplier.

### Priority A: add first (core automation, carried by 2+ competitors or high demand)
| Brand | Category on our site | Volume lines to seed |
|---|---|---|
| **Phoenix Contact** | Cables & Connectors, Power Supplies, Relays & Timers | CLIPLINE terminal blocks (PT/UT), QUINT & UNO power supplies, PLC-RSC interface relays |
| **Turck** | Sensors & Switches, I/O Modules | BI/NI inductive M8–M30, BC capacitive, TBEN / BL20 remote I/O |
| **Banner Engineering** | Sensors & Switches, Safety, Signalling | Q4X / QS18 photoelectric, EZ-SCREEN light curtains, K50 / TL50 tower lights |
| **Finder** | Relays & Timers | Series 40 / 46 / 55 plug-in relays, 34 / 38 slim relays, 80 timers, sockets |
| **Murrelektronik** | Cables & Connectors, Power Supplies, Industrial Networking | M12/M8 cordsets, Emparro power supplies, Xelity unmanaged switches, MVK / Cube I/O |
| **Rittal** | _new:_ Enclosures & Cooling | AE compact enclosures, KX small boxes, TopTherm fans & filters, SK coolers |
| **Pizzato** | Safety, Operator Devices | FR / FD position switches, NG / NS safety interlocks, E2 pushbuttons |

### Priority B: add after A (specialist, carried by one competitor, clear demand)
| Brand | Category | Volume lines |
|---|---|---|
| **Werma** | _new:_ Signalling Devices | KombiSIGN 71/72, EvoSIGNAL, MC35 beacons |
| **SensoPart** | Sensors & Switches | F10 / F25 / FT 50 photoelectric, VISOR vision sensors |
| **Sanyo Denki** | Servo & Motion | SANMOTION R servo motors and amps, San Ace cooling fans |
| **RTA** | Servo & Motion (stepper) | Stepper drives and 2/5-phase stepper motors |
| **Salicru** | _new:_ UPS & Power Quality | SLC Twin Pro online UPS, SPS line-interactive, batteries |
| **CAHO** | Temperature Controllers, Relays & Timers | Temperature controllers, SSRs |
| **AECO** | Sensors & Switches | Inductive, capacitive, level and photoelectric sensors |
| **Entes** | _new:_ Energy Meters | MPR network analysers, RG reactive-power relays |
| **Emas** | Operator Devices | Pushbuttons, pilot lights, selector switches |

### Priority C: only if a customer asks (low fit for an automation-parts site)
| Brand | Why it's deferred |
|---|---|
| TP Electric | Electrical-installation product (plugs, sockets). Add it only with the Plugs & Sockets category |
| TOHO | Niche, and overlaps with Omron / Autonics temperature control we already carry |
| YA-VA, Findeva | Machine-building / packaging components, a different buyer than ours |
| MAKEL, OSRAM, Hyundai Electric, Elsewedy Cables | Residential/commercial wiring, lighting and cable: building-electrical, not automation |

---

## 4. Status and runbook

### What is built (branch `docs/competitor-brand-plan`)
| Piece | Where | Status |
|---|---|---|
| 12 new brands + brand intel | `prisma/seed-data/expansion-2026-11.ts` | ✅ |
| 3 new categories (Signalling Devices, UPS & Power Quality, Energy Meters) with filters | same file | ✅ |
| "Enclosures & Cooling" and "Operator Devices" **reactivated**, not duplicated; enclosure filters added | same file | ✅ |
| Turck, Banner Engineering, Phoenix Contact, Finder **reactivated** (soft-deleted on 2026-09-15) | same file | ✅ |
| One idempotent SQL file for local DB **and** D1 | `scripts/add-taxonomy-expansion.ts` → `prisma/taxonomy-expansion.sql` | ✅ tested against a pruned-production replica |
| Empty categories hidden from homepage, menu and About count | `scripts/build-snapshot.ts` | ✅ |
| Shipping-weight estimates for new categories (UPS 12 kg etc.) | `src/lib/pricing.ts` | ✅ |
| New brands on the homepage brand wall once they have stock (no logo, so not in the hero) | `src/content/site-content.ts` | ✅ |
| DigiKey Product Information V4 fetcher | `scripts/fetch-digikey.ts`, `scripts/digikey/map.ts` | ✅ unit-tested; first live run pending |

Products that the September pruning deactivated stay deactivated. This only brings back
the brand and category rows.

### Runbook: on the Windows dev machine, in order
```bash
git fetch origin && git checkout docs/competitor-brand-plan && npm install

# 1. Brands and categories: local DB, then production
npm run catalog:taxonomy -- --commit
npx wrangler d1 execute nexumotion --remote --file=prisma/taxonomy-expansion.sql

# 2. DigiKey (keys in .env: DIGIKEY_CLIENT_ID / DIGIKEY_CLIENT_SECRET)
npm run catalog:digikey -- --probe          # ~25 requests: which brands DigiKey carries
npm run catalog:digikey                     # → import-data/digikey-<date>.csv
#    optional: MARKUP=1.25 npm run catalog:digikey   |   --only=Turck,Rittal

# 3. Import: dry run first, read the rejects, then commit
npm run catalog:import -- import-data/digikey-<date>.csv
npm run catalog:import -- import-data/digikey-<date>.csv --commit
npx wrangler d1 execute nexumotion --remote --file=import-templates/.d1-sync.sql

# 4. Photos (optional), then publish and deploy
npm run catalog:images -- --commit
npm run catalog:publish
git add -A && git commit -m "catalogue: DigiKey import for expansion brands" && git push
```

### Decisions taken (and why)
| Decision | Reason |
|---|---|
| Reactivate soft-deleted rows instead of inserting new ones | A second "Rittal" or a second enclosure category would split filters, URLs and SEO |
| Leave September-deactivated **products** off | That was a deliberate owner decision. The expansion should bring new, priced, current parts, not revive old RS rows |
| Hide empty categories automatically | Brands already worked this way. Categories can now be created ahead of their first import without showing "0 products" |
| DigiKey via the official API, not scraping DigiKey or RS | Allowed under DigiKey's terms, stable, and returns structured parametric data. Scraping breaks on site changes and breaches terms |
| Compose product names, drop DigiKey descriptions and photos | Same rule the RS converter follows: facts only, no copied copy |
| Prices imported at DigiKey qty-1 × `MARKUP` | A starting list price. Review before going live, since DigiKey's US price is not your landed Egypt cost |

### Still open
1. **Rotate the DigiKey Client Secret.** It was shared in a chat transcript.
2. **First live DigiKey run** (`--probe`). The API code follows DigiKey's V4 documentation but
   could not be run from the cloud session, which has no route to `api.digikey.com`.
3. **Brands DigiKey won't have:** Salicru, Entes, Emas, CAHO, AECO, RTA, likely Pizzato and
   SensoPart. Ask the Egyptian agent or manufacturer for a CSV/BMEcat export. It imports
   through the same `catalog:import` once the columns match `import-templates/<category>.csv`.
4. **Al Sakr Online.** The September pruning commit was authored from `alsakronline@gmail.com`.
   If that catalogue (SICK, Murrelektronik, RTA, Sanyo Denki, CAHO…) is your own, export it from
   its WooCommerce admin (Products → Export → CSV). That is your data, and it is the fastest
   source for the brands DigiKey lacks.
5. **Cross-references** (Step 4 of the original plan) once products exist: Turck ⇄ SICK ⇄
   Autonics inductive, Finder ⇄ Omron ⇄ Schneider relays, Banner ⇄ SICK photoelectric,
   Murrelektronik ⇄ Phoenix Contact cordsets.
6. **Logos** for the new brands (`scripts/fetch-brand-logos.ts`), then add `logo` in
   `featuredBrands` for those that have stock.
7. **Pricing review:** confirm markup and landed cost (freight + customs + VAT) per brand
   before announcing.

## Sources
- ALFA Tech: [home](https://alfatech-eg.net/), [our partners](https://alfatech-eg.net/our-partners/), [about](https://alfatech-eg.net/about-us/), [LinkedIn](https://www.linkedin.com/company/alfatechelectrical)
- Electech: [home](https://www.electech.com.eg/), [products](https://www.electech.com.eg/products/), [automation](https://www.electech.com.eg/automation/), [shop](https://shop.electech.com.eg/), [PLC](https://shop.electech.com.eg/product-category/plc/), [drives](https://shop.electech.com.eg/product-category/drives/), [inductive sensors](https://shop.electech.com.eg/product-category/sensors/inductive/)
- Al Sakr Online: [home](https://alsakronline.com/), [about](https://alsakronline.com/about/), [brands](https://alsakronline.com/brands/), [SICK](https://alsakronline.com/product-brand/shop/sick/), [Automa directory](https://automa.net/business-directory/egypt)
