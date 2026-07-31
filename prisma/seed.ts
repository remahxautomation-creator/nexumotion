import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { brands } from "./seed-data/brands";
import { categories } from "./seed-data/categories";

const prisma = new PrismaClient();

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Deterministic pseudo-random so reseeding is stable
let seedState = 42;
const rand = () => {
  seedState = (seedState * 1103515245 + 12345) % 2147483648;
  return seedState / 2147483648;
};
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

// Product line definitions per brand+category used to synthesize realistic SKUs
type Line = {
  brand: string;
  category: string;
  series: string;
  skuPrefix: string;
  baseName: string;
  priceRange: [number, number];
  count: number;
};

const lines: Line[] = [
  // Siemens
  { brand: "Siemens", category: "PLC & Controllers", series: "S7-1200", skuPrefix: "6ES7", baseName: "SIMATIC S7-1200 CPU", priceRange: [280, 1400], count: 14 },
  { brand: "Siemens", category: "I/O Modules", series: "SM 1223", skuPrefix: "6ES7", baseName: "SIMATIC I/O Module", priceRange: [120, 650], count: 12 },
  { brand: "Siemens", category: "Drives & VFDs", series: "SINAMICS V20", skuPrefix: "6SL3", baseName: "SINAMICS V20 Drive", priceRange: [180, 2400], count: 16 },
  { brand: "Siemens", category: "HMI & Visualization", series: "KTP Basic", skuPrefix: "6AV2", baseName: "SIMATIC HMI KTP", priceRange: [420, 2200], count: 10 },
  { brand: "Siemens", category: "Motor Control", series: "SIRIUS 3RT2", skuPrefix: "3RT2", baseName: "SIRIUS Contactor", priceRange: [25, 380], count: 16 },
  { brand: "Siemens", category: "Power Supplies", series: "SITOP PSU", skuPrefix: "6EP1", baseName: "SITOP Power Supply", priceRange: [95, 520], count: 8 },
  { brand: "Siemens", category: "Safety", series: "SIRIUS 3SK1", skuPrefix: "3SK1", baseName: "SIRIUS Safety Relay", priceRange: [140, 480], count: 8 },
  { brand: "Siemens", category: "Operator Devices", series: "SIRIUS ACT", skuPrefix: "3SU1", baseName: "SIRIUS ACT Push Button", priceRange: [12, 85], count: 10 },
  // Schneider Electric
  { brand: "Schneider Electric", category: "PLC & Controllers", series: "Modicon M221", skuPrefix: "TM221", baseName: "Modicon M221 Controller", priceRange: [220, 900], count: 12 },
  { brand: "Schneider Electric", category: "Drives & VFDs", series: "Altivar ATV320", skuPrefix: "ATV320", baseName: "Altivar Machine Drive", priceRange: [210, 2800], count: 16 },
  { brand: "Schneider Electric", category: "Motor Control", series: "TeSys D", skuPrefix: "LC1D", baseName: "TeSys D Contactor", priceRange: [22, 420], count: 18 },
  { brand: "Schneider Electric", category: "HMI & Visualization", series: "Harmony ST6", skuPrefix: "HMIST", baseName: "Harmony ST6 HMI", priceRange: [380, 1600], count: 8 },
  { brand: "Schneider Electric", category: "Operator Devices", series: "Harmony XB4", skuPrefix: "XB4B", baseName: "Harmony Push Button", priceRange: [8, 65], count: 14 },
  { brand: "Schneider Electric", category: "Power Supplies", series: "Phaseo ABL8", skuPrefix: "ABL8", baseName: "Phaseo Power Supply", priceRange: [85, 430], count: 8 },
  { brand: "Schneider Electric", category: "Relays & Timers", series: "Zelio RXM", skuPrefix: "RXM4", baseName: "Zelio Plug-in Relay", priceRange: [9, 48], count: 10 },
  // ABB
  { brand: "ABB", category: "Drives & VFDs", series: "ACS580", skuPrefix: "ACS580", baseName: "ACS580 General Purpose Drive", priceRange: [520, 6400], count: 16 },
  { brand: "ABB", category: "PLC & Controllers", series: "AC500-eCo", skuPrefix: "PM50", baseName: "AC500-eCo CPU", priceRange: [260, 980], count: 8 },
  { brand: "ABB", category: "Motor Control", series: "AF Contactors", skuPrefix: "AF", baseName: "AF Contactor", priceRange: [30, 520], count: 16 },
  { brand: "ABB", category: "Safety", series: "Sentry", skuPrefix: "2TLA", baseName: "Sentry Safety Relay", priceRange: [150, 420], count: 6 },
  { brand: "ABB", category: "Robotics", series: "IRB", skuPrefix: "IRB", baseName: "IRB Industrial Robot", priceRange: [18000, 65000], count: 5 },
  // Delta
  { brand: "Delta", category: "Drives & VFDs", series: "VFD-M", skuPrefix: "VFD", baseName: "VFD-M Series Drive", priceRange: [140, 1900], count: 16 },
  { brand: "Delta", category: "PLC & Controllers", series: "DVP-ES2", skuPrefix: "DVP", baseName: "DVP Series PLC", priceRange: [130, 620], count: 12 },
  { brand: "Delta", category: "HMI & Visualization", series: "DOP-100", skuPrefix: "DOP-1", baseName: "DOP-100 HMI", priceRange: [220, 850], count: 10 },
  { brand: "Delta", category: "Servo & Motion", series: "ASDA-A3", skuPrefix: "ASD-A3", baseName: "ASDA-A3 Servo Drive", priceRange: [380, 2400], count: 12 },
  { brand: "Delta", category: "Power Supplies", series: "DRP Series", skuPrefix: "DRP02", baseName: "DIN Rail Power Supply", priceRange: [45, 260], count: 8 },
  { brand: "Delta", category: "Temperature Controllers", series: "DTA/DTB", skuPrefix: "DTB", baseName: "Temperature Controller", priceRange: [55, 190], count: 8 },
  // Allen-Bradley
  { brand: "Allen-Bradley", category: "PLC & Controllers", series: "CompactLogix 5380", skuPrefix: "5069", baseName: "CompactLogix Controller", priceRange: [1800, 8200], count: 10 },
  { brand: "Allen-Bradley", category: "I/O Modules", series: "Compact 5000", skuPrefix: "5069-I", baseName: "Compact 5000 I/O Module", priceRange: [280, 1100], count: 12 },
  { brand: "Allen-Bradley", category: "Drives & VFDs", series: "PowerFlex 525", skuPrefix: "25B", baseName: "PowerFlex 525 Drive", priceRange: [480, 4200], count: 14 },
  { brand: "Allen-Bradley", category: "HMI & Visualization", series: "PanelView 800", skuPrefix: "2711R", baseName: "PanelView 800 HMI", priceRange: [720, 2900], count: 8 },
  { brand: "Allen-Bradley", category: "Motor Control", series: "Bulletin 100", skuPrefix: "100-C", baseName: "Bulletin 100 Contactor", priceRange: [40, 560], count: 12 },
  // A few other brands to broaden coverage
  { brand: "Omron", category: "Sensors & Switches", series: "E3Z", skuPrefix: "E3Z", baseName: "E3Z Photoelectric Sensor", priceRange: [38, 160], count: 12 },
  { brand: "Omron", category: "Relays & Timers", series: "MY Series", skuPrefix: "MY4N", baseName: "MY Miniature Relay", priceRange: [7, 32], count: 8 },
  { brand: "Omron", category: "Temperature Controllers", series: "E5CC", skuPrefix: "E5CC", baseName: "E5CC Temperature Controller", priceRange: [95, 320], count: 8 },
  { brand: "IFM Electronic", category: "Sensors & Switches", series: "IF/IG Series", skuPrefix: "IFM", baseName: "Inductive Proximity Sensor", priceRange: [42, 210], count: 12 },
  { brand: "SICK", category: "Encoders", series: "DFS60", skuPrefix: "DFS60", baseName: "DFS60 Incremental Encoder", priceRange: [240, 720], count: 8 },
  { brand: "Festo", category: "Pneumatics", series: "DSBC", skuPrefix: "DSBC", baseName: "DSBC ISO Cylinder", priceRange: [65, 420], count: 12 },
  { brand: "SMC", category: "Pneumatics", series: "SY5000", skuPrefix: "SY5", baseName: "SY5000 Solenoid Valve", priceRange: [48, 260], count: 12 },
  { brand: "Phoenix Contact", category: "Power Supplies", series: "QUINT4", skuPrefix: "2904", baseName: "QUINT4 Power Supply", priceRange: [180, 720], count: 8 },
  { brand: "Phoenix Contact", category: "Cables & Connectors", series: "SAC", skuPrefix: "SAC-4P", baseName: "M12 Sensor Cable", priceRange: [12, 68], count: 10 },
  { brand: "Weintek", category: "HMI & Visualization", series: "cMT X", skuPrefix: "CMT", baseName: "cMT X Series HMI", priceRange: [340, 1300], count: 8 },
  { brand: "Endress+Hauser", category: "Process Instruments", series: "Cerabar", skuPrefix: "PMC21", baseName: "Cerabar Pressure Transmitter", priceRange: [420, 1900], count: 8 },
  { brand: "Pilz", category: "Safety", series: "PNOZ", skuPrefix: "PNOZ", baseName: "PNOZ Safety Relay", priceRange: [180, 620], count: 8 },
  { brand: "Autonics", category: "Sensors & Switches", series: "PR Series", skuPrefix: "PR12", baseName: "PR Inductive Sensor", priceRange: [18, 85], count: 10 },
  { brand: "Finder", category: "Relays & Timers", series: "55 Series", skuPrefix: "55.34", baseName: "55 Series Relay", priceRange: [6, 28], count: 8 },
];

const certPool = ["CE", "UL", "RoHS", "ISO9001", "cUL", "EAC"];
const stockStatuses = (qty: number) =>
  qty === 0 ? (rand() < 0.5 ? "OUT_OF_STOCK" : "BACKORDER") : qty < 10 ? "LOW_STOCK" : "IN_STOCK";

// Generate a spec value for a template
function specValue(t: { key: string; dataType: string; unit?: string | null; options: string[] }) {
  switch (t.dataType) {
    case "ENUM":
      return { value: t.options.length ? pick(t.options) : "Standard", num: null as number | null };
    case "BOOLEAN":
      return { value: rand() < 0.5 ? "Yes" : "No", num: null };
    case "NUMBER": {
      const ranges: Record<string, [number, number]> = {
        io_count: [8, 64], channels: [2, 32], voltage: [12, 480], memory: [50, 4000],
        power_kw: [1, 90], current: [1, 150], screen_size: [4, 15], torque: [1, 50],
        speed: [1000, 6000], sensing_range: [2, 40], output_voltage: [5, 48],
        power_w: [30, 960], ports: [4, 24], bore: [12, 125], stroke: [25, 500],
        pressure: [2, 350], flow: [10, 200], payload: [3, 300], reach: [500, 3200],
        axes: [4, 7], repeatability: [1, 10], pins: [3, 12], length: [1, 20],
        resolution: [100, 5000], shaft: [6, 12], alarms: [1, 3], io_capacity: [100, 5000],
      };
      const [lo, hi] = ranges[t.key] ?? [1, 100];
      const n = t.key === "repeatability" ? randInt(lo, hi) / 100 : randInt(lo, hi);
      return { value: `${n}${t.unit ? " " + t.unit : ""}`, num: n };
    }
    default:
      return { value: "—", num: null };
  }
}

async function main() {
  console.log("Clearing existing data...");
  await prisma.crossReference.deleteMany();
  await prisma.productSpec.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.projectItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.specTemplate.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();

  console.log("Seeding brands...");
  const brandMap = new Map<string, string>();
  for (const b of brands) {
    const created = await prisma.brand.create({
      data: { name: b.name, slug: slugify(b.name), country: b.country, description: b.description },
    });
    brandMap.set(b.name, created.id);
  }

  console.log("Seeding categories + spec templates...");
  const catMap = new Map<string, { id: string; templates: { key: string; name: string; unit: string | null; dataType: string; options: string[] }[] }>();
  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    const created = await prisma.category.create({
      data: { name: c.name, slug: slugify(c.name), description: c.description, sortOrder: i },
    });
    const templates = [];
    for (let j = 0; j < c.specs.length; j++) {
      const s = c.specs[j];
      await prisma.specTemplate.create({
        data: {
          categoryId: created.id,
          name: s.name,
          key: s.key,
          unit: s.unit ?? null,
          dataType: s.dataType ?? "TEXT",
          sortOrder: j,
          options: JSON.stringify(s.options ?? []),
        },
      });
      templates.push({ key: s.key, name: s.name, unit: s.unit ?? null, dataType: s.dataType ?? "TEXT", options: s.options ?? [] });
    }
    catMap.set(c.name, { id: created.id, templates });
  }

  console.log("Seeding products...");
  let total = 0;
  const competitorBrands = ["Siemens", "Schneider Electric", "ABB", "Mitsubishi Electric", "Omron"];
  for (const line of lines) {
    const brandId = brandMap.get(line.brand)!;
    const cat = catMap.get(line.category)!;
    for (let i = 0; i < line.count; i++) {
      const variant = `${randInt(10, 99)}${String.fromCharCode(65 + randInt(0, 25))}${randInt(1, 9)}`;
      const sku = `${line.skuPrefix}-${variant}${randInt(100, 999)}`;
      const specEntries = cat.templates.map((t) => ({ t, v: specValue(t) }));
      const keySpec = specEntries.find((s) => s.v.num !== null);
      const name = `${line.baseName} ${variant}${keySpec ? ` — ${keySpec.v.value}` : ""}`;
      const price = Math.round(line.priceRange[0] + rand() * (line.priceRange[1] - line.priceRange[0]));
      const qty = rand() < 0.12 ? 0 : randInt(1, 250);
      const certs = certPool.filter(() => rand() < 0.45);

      const product = await prisma.product.create({
        data: {
          sku,
          name,
          slug: slugify(`${line.brand}-${sku}`),
          shortDesc: `${line.series} series — ${line.category.toLowerCase()} by ${line.brand}.`,
          description: `${line.baseName} from the ${line.series} series. Genuine ${line.brand} part supplied with full manufacturer warranty. Suitable for industrial automation applications across MENA — panel builders, OEMs, and maintenance teams.`,
          brandId,
          categoryId: cat.id,
          price,
          comparePrice: rand() < 0.3 ? Math.round(price * (1.1 + rand() * 0.2)) : null,
          costPerUnit: "per unit",
          stockQty: qty,
          stockStatus: stockStatuses(qty),
          weightKg: randInt(1, 80) / 10,
          images: JSON.stringify([]),
          certifications: JSON.stringify(certs),
          isFeatured: rand() < 0.08,
        },
      });

      for (const { t, v } of specEntries) {
        await prisma.productSpec.create({
          data: {
            productId: product.id,
            specKey: t.key,
            specName: t.name,
            value: v.value,
            valueNum: v.num,
            unit: t.unit,
          },
        });
      }

      // Cross-references for ~40% of products
      if (rand() < 0.4) {
        const compBrand = pick(competitorBrands.filter((b) => b !== line.brand));
        await prisma.crossReference.create({
          data: {
            productId: product.id,
            competitorSku: `${compBrand.slice(0, 3).toUpperCase()}-${randInt(1000, 9999)}-${String.fromCharCode(65 + randInt(0, 25))}${randInt(10, 99)}`,
            competitorBrand: compBrand,
            competitorName: `${compBrand} equivalent — ${line.category}`,
            matchType: pick(["DIRECT", "FUNCTIONAL", "UPGRADE", "LEGACY"]),
          },
        });
      }
      total++;
    }
  }
  console.log(`Seeded ${total} products.`);

  console.log("Seeding admin user...");
  const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "ChangeMe-Admin1", 12);
  await prisma.user.upsert({
    where: { email: "admin@autoparts-mena.com" },
    update: { password: adminHash },
    create: { email: "admin@autoparts-mena.com", name: "Admin", role: "ADMIN", country: "Egypt", password: adminHash },
  });

  console.log("Done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
