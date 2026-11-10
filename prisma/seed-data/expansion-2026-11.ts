// Catalogue expansion, November 2026: brands carried by Egyptian competitors
// (ALFA Tech, Electech, Al Sakr Online) that fit an automation-parts catalogue,
// plus the categories they need. See docs/COMPETITOR-BRAND-PLAN.md for the
// study and the priority reasoning.
//
// These are kept in their own file so scripts/add-taxonomy-expansion.ts can
// ship exactly this set to the local database and to D1, without touching
// categories that were deliberately left out of production. brands.ts,
// categories.ts and brand-intel.ts spread these in, so seed.ts and
// seed-taxonomy.ts pick them up on a fresh database too.
//
// Descriptions are our own wording. Only brand names, countries and
// product-line names come from the research. Those are facts, not copy.
import type { CategorySeed } from "./categories";
import type { BrandIntel } from "./brand-intel";

export type BrandSeed = { name: string; country: string; description: string };

export const expansionBrands: BrandSeed[] = [
  // Priority A
  { name: "Murrelektronik", country: "Germany", description: "Decentralised installation — M8/M12 cordsets, Emparro power supplies, IP67 I/O and unmanaged switches." },
  { name: "Rittal", country: "Germany", description: "Enclosures and climate control — AE/KX enclosures, TopTherm fans, cooling units, busbar systems." },
  { name: "Pizzato", country: "Italy", description: "Position switches, safety interlocks and pushbuttons for machine guarding." },
  // Priority B
  { name: "Werma", country: "Germany", description: "Signal towers, beacons and sounders — KombiSIGN and EvoSIGNAL." },
  { name: "SensoPart", country: "Germany", description: "Photoelectric sensors and VISOR vision sensors." },
  { name: "Sanyo Denki", country: "Japan", description: "SANMOTION servo and stepper systems, San Ace cooling fans." },
  { name: "RTA", country: "Italy", description: "Stepper motor drives and stepper motors for machine builders." },
  { name: "Salicru", country: "Spain", description: "Online and line-interactive UPS, batteries, voltage stabilisers and solar inverters." },
  { name: "CAHO", country: "Taiwan", description: "Temperature controllers and solid-state relays." },
  { name: "AECO", country: "Italy", description: "Inductive, capacitive, photoelectric and level sensors." },
  { name: "Entes", country: "Turkey", description: "Energy meters, network analysers and power-factor controllers." },
  { name: "Emas", country: "Turkey", description: "Pushbuttons, pilot lights, selector switches and cam switches." },
];

export const expansionBrandIntel: BrandIntel[] = [
  {
    name: "Murrelektronik", website: "https://www.murrelektronik.com", tier: 2,
    focus: ["Cables & Connectors", "Power Supplies", "Industrial Networking", "I/O Modules"],
    note: "Carried by Al Sakr Online. M12 cordsets and Emparro supplies are the volume lines; cross-references Phoenix Contact.",
  },
  {
    name: "Rittal", website: "https://www.rittal.com", tier: 1,
    focus: ["Enclosures & Climate Control"],
    note: "Carried by Electech. Default panel enclosure on Egyptian projects; AE compact enclosures and TopTherm fans move fastest.",
  },
  {
    name: "Pizzato", website: "https://www.pizzato.com", tier: 2,
    focus: ["Safety", "Sensors & Switches", "Operator Devices"],
    note: "Carried by ALFA Tech. FR/FD position switches and NG/NS safety interlocks; strong in lift and packaging machinery.",
  },
  {
    name: "Werma", website: "https://www.werma.com", tier: 2,
    focus: ["Signalling Devices"],
    note: "Carried by Electech. KombiSIGN 71/72 signal towers are the panel-builder standard.",
  },
  {
    name: "SensoPart", website: "https://www.sensopart.com", tier: 3,
    focus: ["Sensors & Switches"],
    note: "Carried by Electech. F10/F25 photoelectric and VISOR vision sensors.",
  },
  {
    name: "Sanyo Denki", website: "https://www.sanyodenki.com", tier: 3,
    focus: ["Servo & Motion"],
    note: "Carried by Al Sakr Online. SANMOTION servo replacements and San Ace fans for panel cooling.",
  },
  {
    name: "RTA", website: "https://www.rta.it", tier: 3,
    focus: ["Servo & Motion"],
    note: "Carried by Al Sakr Online. Stepper drives and motors for packaging machines.",
  },
  {
    name: "Salicru", website: "https://www.salicru.com", tier: 2,
    focus: ["UPS & Power Quality"],
    note: "Carried by ALFA Tech. SLC Twin Pro online UPS for control panels and server rooms.",
  },
  {
    name: "CAHO", tier: 3,
    focus: ["Temperature Controllers", "Relays & Timers"],
    note: "Carried by Al Sakr Online. Value-line temperature controllers and SSRs; cross-references Autonics and Omron. Website to be confirmed.",
  },
  {
    name: "AECO", tier: 3,
    focus: ["Sensors & Switches"],
    note: "Carried by ALFA Tech (exclusive). Proximity, photoelectric and level sensors. Website to be confirmed.",
  },
  {
    name: "Entes", website: "https://www.entes.com.tr", tier: 2,
    focus: ["Energy Meters"],
    note: "Older ALFA Tech listing. MPR network analysers and RG reactive-power relays are common in Egyptian MCC panels.",
  },
  {
    name: "Emas", website: "https://www.emas.com.tr", tier: 3,
    focus: ["Operator Devices"],
    note: "Older ALFA Tech listing. Price-tier pushbuttons and pilot lights.",
  },
];

export const expansionCategories: CategorySeed[] = [
  {
    name: "Enclosures & Climate Control",
    description: "Panel enclosures, junction boxes, filter fans, cooling units and heaters.",
    specs: [
      { name: "Product Type", key: "product_type", dataType: "ENUM", options: ["Enclosure", "Junction box", "Filter fan", "Cooling unit", "Heater", "Thermostat"] },
      { name: "Material", key: "material", dataType: "ENUM", options: ["Sheet steel", "Stainless steel", "Aluminium", "Polycarbonate", "Polyester (GRP)", "ABS"] },
      { name: "Height", key: "height", unit: "mm", dataType: "NUMBER" },
      { name: "Width", key: "width", unit: "mm", dataType: "NUMBER" },
      { name: "Depth", key: "depth", unit: "mm", dataType: "NUMBER" },
      { name: "IP Rating", key: "ip_rating", dataType: "ENUM", options: ["IP54", "IP55", "IP65", "IP66", "IP67"] },
      { name: "Cooling Capacity", key: "cooling_capacity", unit: "W", dataType: "NUMBER" },
    ],
  },
  {
    name: "Signalling Devices",
    description: "Signal towers, beacons and sounders for machine and process status.",
    specs: [
      { name: "Device Type", key: "device_type", dataType: "ENUM", options: ["Signal tower", "Beacon", "Sounder", "Beacon + sounder"] },
      { name: "Diameter", key: "diameter", unit: "mm", dataType: "NUMBER" },
      { name: "Light Source", key: "light_source", dataType: "ENUM", options: ["LED", "Xenon", "Incandescent"] },
      { name: "Light Mode", key: "light_mode", dataType: "ENUM", options: ["Permanent", "Blinking", "Flashing", "Rotating", "Multi-mode"] },
      { name: "Voltage", key: "voltage", dataType: "ENUM", options: ["24V DC", "24V AC/DC", "115V AC", "230V AC"] },
      { name: "IP Rating", key: "ip_rating", dataType: "ENUM", options: ["IP54", "IP65", "IP66", "IP67"] },
    ],
  },
  {
    name: "UPS & Power Quality",
    description: "Uninterruptible power supplies, batteries and voltage stabilisers.",
    specs: [
      { name: "Product Type", key: "product_type", dataType: "ENUM", options: ["UPS", "Battery", "Voltage stabiliser", "Solar inverter"] },
      { name: "Power", key: "power", unit: "kVA", dataType: "NUMBER" },
      { name: "Topology", key: "topology", dataType: "ENUM", options: ["Online double conversion", "Line-interactive", "Offline"] },
      { name: "Phases (in/out)", key: "phases", dataType: "ENUM", options: ["1/1", "3/1", "3/3"] },
      { name: "Form Factor", key: "form_factor", dataType: "ENUM", options: ["Tower", "Rack", "Rack/Tower", "DIN rail"] },
      { name: "Backup Time", key: "backup_time", unit: "min", dataType: "NUMBER" },
    ],
  },
  {
    name: "Energy Meters",
    description: "Energy meters, network analysers, power-factor controllers and current transformers.",
    specs: [
      { name: "Device Type", key: "device_type", dataType: "ENUM", options: ["Energy meter", "Network analyser", "Power factor controller", "Current transformer"] },
      { name: "Phases", key: "phases", dataType: "ENUM", options: ["Single-phase", "Three-phase"] },
      { name: "Communication", key: "communication", dataType: "ENUM", options: ["None", "Pulse", "Modbus RTU", "Modbus TCP", "M-Bus"] },
      { name: "Mounting", key: "mounting", dataType: "ENUM", options: ["DIN rail", "Panel 96x96", "Panel 72x72"] },
      { name: "Accuracy Class", key: "accuracy_class", dataType: "ENUM", options: ["0.5S", "1", "2"] },
      { name: "Max Current", key: "max_current", unit: "A", dataType: "NUMBER" },
    ],
  },
];
