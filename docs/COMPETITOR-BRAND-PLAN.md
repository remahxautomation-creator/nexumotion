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
| Enclosures & Climate Control | Rittal, TP Electric (enclosures) |
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
| **Rittal** | _new:_ Enclosures & Climate Control | AE compact enclosures, KX small boxes, TopTherm fans & filters, SK coolers |
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

## 4. Execution plan

### Step 1: Taxonomy ✅ code done, apply it with the commands below
Data is in `prisma/seed-data/expansion-2026-11.ts` (12 brands, 4 categories, 25 spec
templates). Apply it with:
```bash
npx tsx scripts/add-taxonomy-expansion.ts --commit        # local DB + writes the SQL
npx wrangler d1 execute nexumotion --remote --file=prisma/taxonomy-expansion.sql
npx tsx prisma/generate-import-templates.ts               # CSV templates for the new categories
```
Both steps are idempotent. New brands and categories stay hidden on the site until they
have at least one product (`scripts/build-snapshot.ts` filters empty ones).

Original task list:
1. Add the **Priority A + B brands** that aren't in it yet to `prisma/seed-data/brands.ts`
   (name, country, one-line description written by us), and to `brand-intel.ts` (tier,
   focus categories, website, note).
2. Add the **new categories**, each with spec templates in `prisma/seed-data/categories.ts`:
   - `Enclosures & Climate Control`: material, dimensions_mm (H×W×D), ip_rating, mounting, cooling_capacity_w
   - `Signalling Devices`: type (tower/beacon/sounder), diameter_mm, voltage, light_source, ip_rating, tiers
   - `UPS & Power Quality`: power_kva, topology (online/line-interactive/offline), input_voltage, backup_min, phases
   - `Energy Meters`: measurement, communication, mounting, accuracy_class
3. Run `npx tsx scripts/seed-taxonomy.ts --commit` locally, then mirror to D1 and
   `npm run catalog:import` templates (`prisma/generate-import-templates.ts`).
4. Add logos to `public/brands/` via `scripts/fetch-brand-logos.ts` (nominative use only).
5. Add Arabic names for the new categories to `src/i18n/dictionaries.ts` if category chrome is translated.

### Step 2: Product data (business side, runs in parallel)
For each Priority A brand, ask the Egyptian authorised distributor or the manufacturer rep for a
**product master export (CSV/BMEcat) plus a price list**. Ask for the top movers first, not the
full range. Target **50–150 SKUs per brand** at launch, about 700 SKUs for Priority A.
- Phoenix Contact, Turck, Banner, Murrelektronik, Rittal and Finder all publish
  ETIM/BMEcat data to partners, so `scripts/convert-distributor-export.ts` can map it.
- Use the competitors' **visible SKUs as a demand signal only** (e.g. Turck `BI5U-M18-AP6X-H1141`,
  Siemens `3RK2400-2CE00-2AA2`). They tell us which part numbers Egyptian buyers search
  for. The data itself still comes from the manufacturer.

### Step 3: Import (per brand, using the existing pipeline in `docs/ADDING-PRODUCTS.md`)
```bash
npm run catalog:import -- import-templates/<category>.csv            # dry run
npm run catalog:import -- import-templates/<category>.csv --commit
npm run catalog:images -- --commit
npx wrangler d1 execute nexumotion --remote --file=import-templates/.d1-sync.sql
npm run catalog:publish
```

### Step 4: Cross-references, our competitive edge
Competitors list parts by brand only. We add `CrossReference` rows so search turns a part
number into equivalents:
- Turck ⇄ SICK ⇄ Autonics ⇄ Omron inductive sensors (same thread, range, output)
- Finder ⇄ Omron (MY/G2R) ⇄ Schneider (RXM) plug-in relays
- Banner ⇄ SICK photoelectric and light curtains
- Murrelektronik ⇄ Phoenix Contact M12 cordsets and power supplies
- CAHO ⇄ Autonics ⇄ Omron temperature controllers

### Step 5: Merchandising
- Homepage "Brands we carry" strip: add the new Priority A logos.
- Brand pages: use the `brand-intel` note as an engineer-oriented summary ("volume lines").
- SEO: brand + "Egypt" landing titles (e.g. "Turck sensors in Egypt"). Competitors rank
  for these terms with thin pages, and our spec tables beat them.

---

## 5. Suggested sequence

| Phase | Scope | Output |
|---|---|---|
| 1 | Taxonomy: 12 new brands + 4 categories (Step 1) | Brands and categories exist, import templates are ready |
| 2 | Priority A data: Phoenix Contact, Turck, Banner, Finder | About 400 SKUs live |
| 3 | Priority A data: Murrelektronik, Rittal, Pizzato | About 300 SKUs, Enclosures category live |
| 4 | Cross-reference pass (Step 4) | Competitor-SKU search covers the new brands |
| 5 | Priority B brands, as supplier data arrives | Werma, SensoPart, Sanyo Denki, RTA, Salicru, CAHO, AECO, Entes, Emas |

## Sources
- ALFA Tech: [home](https://alfatech-eg.net/), [our partners](https://alfatech-eg.net/our-partners/), [about](https://alfatech-eg.net/about-us/), [LinkedIn](https://www.linkedin.com/company/alfatechelectrical)
- Electech: [home](https://www.electech.com.eg/), [products](https://www.electech.com.eg/products/), [automation](https://www.electech.com.eg/automation/), [shop](https://shop.electech.com.eg/), [PLC](https://shop.electech.com.eg/product-category/plc/), [drives](https://shop.electech.com.eg/product-category/drives/), [inductive sensors](https://shop.electech.com.eg/product-category/sensors/inductive/)
- Al Sakr Online: [home](https://alsakronline.com/), [about](https://alsakronline.com/about/), [brands](https://alsakronline.com/brands/), [SICK](https://alsakronline.com/product-brand/shop/sick/), [Automa directory](https://automa.net/business-directory/egypt)
