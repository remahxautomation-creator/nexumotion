# Adding products to the catalogue

Everything a product page shows — name, specs, price, stock, datasheet, photos —
enters through two files and three commands. No admin clicking, no object
storage, nothing to pay for. Every change is a git commit, so it is reviewable
and reversible.

## The short version

```bash
# 1. Product data: fill in the category's CSV template, then import it
npm run catalog:import -- import-templates/drives-vfds.csv            # dry run
npm run catalog:import -- import-templates/drives-vfds.csv --commit   # write

# 2. Photos: one folder per SKU under import-images/, then ingest
npm run catalog:images                                                 # dry run
npm run catalog:images -- --commit                                     # write

# 3. Push the same changes to production, then publish and commit
npx wrangler d1 execute nexumotion --remote --file=import-templates/.d1-sync.sql
npx wrangler d1 execute nexumotion --remote --file=import-images/.d1-sync.sql
npm run catalog:publish
git add -A && git commit -m "catalogue: add <what>" && git push
```

The deploy is automatic on push. Both `--commit` steps print the exact
`wrangler` line to run.

## 1. Product data — the CSV

Templates live in `import-templates/`, one per category, with the spec columns
that category filters on. `_index.csv` lists them all. Open the one you need,
delete the placeholder row, add one row per product.

| Column | Required | Notes |
|---|---|---|
| `sku` | yes | The **manufacturer's** part number, exactly as printed. This is what customers search for. |
| `name` | yes | Plain product name. Avoid marketing copy. |
| `brand` | yes | Must match a brand on the site exactly — `Schneider Electric`, not `Schneider`. Unknown brands are rejected, not created. |
| `category` | yes | Must match exactly — `Drives & VFDs`. |
| `price` | yes | USD, number only. `0` is allowed while pricing is unset. |
| `stockQty` | | Sets stock status automatically: 0 → Backorder, 1–5 → Low stock, more → In stock. |
| `shortDesc` | | One line, shown on the card. |
| `description` | | Longer text for the product page. Write your own — do not paste a distributor's. |
| `comparePrice`, `weightKg` | | Numbers. |
| `datasheetUrl`, `manualUrl`, `cadUrl` | | Links. Manufacturer-hosted is best. |
| `certifications` | | Semicolon list: `CE;UL;RoHS` |
| `spec:…` | | Any column starting `spec:` becomes a filterable spec. `spec:power_kw (kW)` gives key `power_kw`, unit `kW`. Add columns freely. |

Re-importing a SKU updates it in place and replaces its specs. Nothing is ever
deleted by the importer.

## 2. Photos — the drop folder

```
import-images/
  6SL3210-1KE11-8UB2/
    01-front.jpg
    02-side.jpg
    03-label.jpg
```

- One folder per SKU, named exactly as the SKU.
- Any format: JPG, PNG, WebP, HEIC. Phone photos are fine.
- Files are sorted by name; **the first one is the card image**, so name the
  best shot `01-…`.
- The script resizes to 1200 px, converts to WebP, strips EXIF (phone photos
  carry GPS and device data), and writes to `public/products/<sku>/`.
- Raw photos in `import-images/` are never committed; the optimised WebPs are.

### What makes a usable product photo

- Part on a plain white or light-grey background — a sheet of paper works.
- Daylight or even lighting, no hard shadows, no flash glare on the label.
- Fill the frame. The part number label should be readable in at least one shot.
- Front view first; then side, then label. Three shots is plenty.

### Whose photos you may use

- **Your own** — always.
- **Manufacturer partner-portal images** — most of your brands provide these to
  stockists (ABB Library, Siemens Industry Image Database, Schneider Partner
  Portal, Rockwell PartnerNetwork, Festo Media, SICK Partner Portal). Register
  as a distributor and download under their terms.
- **Never** another distributor's photographs. The catalogue once carried 412
  URLs to RS Components' images; they were removed for exactly this reason.

## 3. Publish

`npm run catalog:publish` regenerates the mirror (`public/catalog/`) and the
snapshot the home page reads. **The site serves from these files, not from the
database** — if you skip this step, nothing changes on the site. Then commit and
push; Cloudflare builds and deploys.

## Why it works this way

The site runs on Cloudflare's free tier. A Worker cannot write files at
runtime, so an upload button in the admin would need paid object storage. The
folder-and-script route costs nothing, keeps photos and data together in git,
and never lets the public site depend on the database being reachable — which
is what took it down once already.

## Checking the result locally

```bash
DATABASE_URL="file:./local.db" npx next build && npx next start
```
then open `http://localhost:3000/products/<slug>`. The slug is
`<brand>-<sku>` lower-cased, e.g. `siemens-6sl3210-1ke11-8ub2`.
