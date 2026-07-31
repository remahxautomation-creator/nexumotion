// Regional demand intelligence for the 50 seeded brands.
//
// SOURCES (July 2026): Mordor Intelligence MEA Industrial Automation & VFD market
// reports, The Insight Partners MEA PLC market, plus Egyptian distributor/partner
// listings (Siemens Egypt solution partners, Alexicontrol, ARC Technologies, ATCS).
//
// `tier` reflects observed demand in the Egypt → MENA → Africa corridor, NOT global
// revenue: 1 = specified by default on most projects, 2 = strong and widely stocked,
// 3 = specialist or price-tier challenger.
//
// `focus` lists the categories (matching prisma/seed-data/categories.ts names) where
// the brand actually competes in this region — this is what drives catalog priority.
//
// Websites are the manufacturer's own product/catalog entry point. They are recorded
// for reference and supplier contact ONLY. See CATALOG_SOURCING.md — these sites are
// not to be scraped; their terms of use prohibit it.

export type BrandIntel = {
  name: string;
  website: string;
  tier: 1 | 2 | 3;
  focus: string[];
  note: string;
};

export const brandIntel: BrandIntel[] = [
  // ── Tier 1 — default specification across Egypt/MENA ──────────────────────
  {
    name: "Siemens", website: "https://mall.industry.siemens.com", tier: 1,
    focus: ["PLC & Controllers", "Drives & VFDs", "HMI & Visualization", "Motor Control", "Safety", "Power Supplies", "Operator Devices", "I/O Modules"],
    note: "Largest installed base in Egypt; local solution-partner network (MISC, ARC). S7-1200/1500, SINAMICS V20/G120, SIRIUS, SITOP are the volume lines.",
  },
  {
    name: "ABB", website: "https://new.abb.com/products", tier: 1,
    focus: ["Drives & VFDs", "PLC & Controllers", "Motor Control", "Safety", "Robotics", "Process Instruments"],
    note: "ACS580/ACS880 dominate MEA VFD demand; Q2-2025 orders USD 9.8bn led by process automation. Strong in cement, water, mining.",
  },
  {
    name: "Schneider Electric", website: "https://www.se.com", tier: 1,
    focus: ["PLC & Controllers", "Drives & VFDs", "Motor Control", "HMI & Visualization", "Power Supplies", "Operator Devices", "Relays & Timers"],
    note: "Dubai-manufactured LV switchgear + EcoStruxure driving double-digit regional growth. TeSys/Altivar/Modicon are stocked everywhere.",
  },
  {
    name: "Allen-Bradley", website: "https://www.rockwellautomation.com", tier: 1,
    focus: ["PLC & Controllers", "I/O Modules", "Drives & VFDs", "HMI & Visualization", "Motor Control", "Safety"],
    note: "Rockwell — specified on US/multinational-spec plants (oil & gas, F&B). Premium price tier; ControlLogix/CompactLogix/PowerFlex.",
  },
  {
    name: "Delta", website: "https://www.deltaww.com/en-US/products", tier: 1,
    focus: ["Drives & VFDs", "PLC & Controllers", "HMI & Visualization", "Servo & Motion", "Power Supplies", "Temperature Controllers"],
    note: "The value-tier volume leader in Egypt. Authorized suppliers (Alexicontrol) stock VFD-M/MS300, DVP PLCs, DOP HMIs deep.",
  },
  {
    name: "Omron", website: "https://industrial.omron.eu", tier: 1,
    focus: ["Sensors & Switches", "PLC & Controllers", "Relays & Timers", "Temperature Controllers", "Safety"],
    note: "E3Z photoelectric, MY/G2R relays and E5CC controllers are consumable-rate movers in packaging and F&B lines.",
  },
  {
    name: "Mitsubishi Electric", website: "https://www.mitsubishielectric.com/fa", tier: 1,
    focus: ["PLC & Controllers", "Drives & VFDs", "Servo & Motion", "HMI & Visualization"],
    note: "Named a major MEA vendor; MELSEC FX/Q, FR-E700/800 inverters strong in textiles and plastics.",
  },
  {
    name: "Danfoss", website: "https://www.danfoss.com/en/products", tier: 1,
    focus: ["Drives & VFDs", "Process Instruments"],
    note: "VLT/VACON — the reference drive for HVAC, water and wastewater across Egypt and the Gulf.",
  },
  {
    name: "Schneider Electric (Pro-face)", website: "https://www.proface.com", tier: 3,
    focus: ["HMI & Visualization"],
    note: "Pro-face GP/SP panels; niche replacement demand on legacy lines.",
  },

  // ── Tier 1/2 — process & instrumentation ──────────────────────────────────
  {
    name: "Honeywell", website: "https://process.honeywell.com", tier: 2,
    focus: ["DCS & SCADA", "Process Instruments", "Safety"],
    note: "Commands premium share via end-to-end portfolio; oil & gas and refinery DCS.",
  },
  {
    name: "Emerson", website: "https://www.emerson.com/en-us/automation", tier: 2,
    focus: ["Process Instruments", "DCS & SCADA", "Pneumatics"],
    note: "DeltaV, Rosemount, ASCO — petrochemical and pipeline standard.",
  },
  {
    name: "Yokogawa", website: "https://www.yokogawa.com/solutions/products", tier: 2,
    focus: ["DCS & SCADA", "Process Instruments"],
    note: "Listed among the major MEA operating companies; CENTUM DCS and EJA transmitters.",
  },
  {
    name: "Endress+Hauser", website: "https://www.endress.com", tier: 2,
    focus: ["Process Instruments"],
    note: "Flow/level/pressure/analytics — water utilities and pharma.",
  },

  // ── Tier 2 — sensing, connectivity, control components ────────────────────
  {
    name: "IFM Electronic", website: "https://www.ifm.com", tier: 2,
    focus: ["Sensors & Switches", "Encoders", "Cables & Connectors"],
    note: "IO-Link leadership; condition monitoring growing with predictive-maintenance projects.",
  },
  {
    name: "SICK", website: "https://www.sick.com", tier: 2,
    focus: ["Sensors & Switches", "Safety", "Encoders"],
    note: "Safety light curtains and scanners; encoder replacement demand.",
  },
  {
    name: "Pepperl+Fuchs", website: "https://www.pepperl-fuchs.com", tier: 2,
    focus: ["Sensors & Switches", "Process Instruments", "Safety"],
    note: "Intrinsic-safety barriers essential for Egyptian oil & gas zones.",
  },
  {
    name: "Balluff", website: "https://www.balluff.com", tier: 3,
    focus: ["Sensors & Switches", "Cables & Connectors"],
    note: "Position sensing and RFID; automotive and machine-builder demand.",
  },
  {
    name: "Turck", website: "https://www.turck.com", tier: 3,
    focus: ["Sensors & Switches", "Cables & Connectors", "Industrial Networking"],
    note: "Fieldbus and connectivity; competes with IFM/Balluff.",
  },
  {
    name: "Banner Engineering", website: "https://www.bannerengineering.com", tier: 3,
    focus: ["Sensors & Switches", "Safety", "Operator Devices"],
    note: "Photoelectrics and indicator towers; US-spec plants.",
  },
  {
    name: "Phoenix Contact", website: "https://www.phoenixcontact.com", tier: 2,
    focus: ["Power Supplies", "Cables & Connectors", "Relays & Timers", "Industrial Networking"],
    note: "QUINT supplies and terminal blocks — panel-builder consumables, very high line-item frequency.",
  },
  {
    name: "WAGO", website: "https://www.wago.com", tier: 2,
    focus: ["Cables & Connectors", "I/O Modules", "Relays & Timers", "PLC & Controllers"],
    note: "Spring-clamp terminals are a panel-shop staple across Egypt.",
  },
  {
    name: "Pilz", website: "https://www.pilz.com", tier: 2,
    focus: ["Safety"],
    note: "PNOZ safety relays — the default for machine-safety retrofits.",
  },
  {
    name: "Beckhoff", website: "https://www.beckhoff.com", tier: 3,
    focus: ["PLC & Controllers", "I/O Modules", "Servo & Motion", "Industrial Networking"],
    note: "EtherCAT/PC-based control; growing with machine builders and OEM exporters.",
  },
  {
    name: "B&R", website: "https://www.br-automation.com", tier: 3,
    focus: ["PLC & Controllers", "HMI & Visualization", "Servo & Motion"],
    note: "ABB group; packaging OEM installed base.",
  },

  // ── Tier 2 — motion, pneumatics, mechanical ───────────────────────────────
  {
    name: "Festo", website: "https://www.festo.com", tier: 2,
    focus: ["Pneumatics", "Servo & Motion", "Sensors & Switches"],
    note: "Cylinders and valve terminals; heavy consumable/seal-kit reorder rate.",
  },
  {
    name: "SMC", website: "https://www.smcworld.com", tier: 2,
    focus: ["Pneumatics"],
    note: "Direct Festo competitor, often lower cost; strong in F&B and packaging.",
  },
  {
    name: "Bosch Rexroth", website: "https://www.boschrexroth.com", tier: 2,
    focus: ["Hydraulics", "Servo & Motion", "PLC & Controllers"],
    note: "Hydraulics for steel, cement, marine — high-value spares.",
  },
  {
    name: "SEW-Eurodrive", website: "https://www.sew-eurodrive.com", tier: 2,
    focus: ["Servo & Motion", "Drives & VFDs"],
    note: "Gearmotors and decentralized drives; conveyor-heavy industries.",
  },
  {
    name: "Yaskawa", website: "https://www.yaskawa.com", tier: 2,
    focus: ["Drives & VFDs", "Servo & Motion", "Robotics"],
    note: "Sigma servo and GA/A1000 drives; Motoman robots in automotive.",
  },
  {
    name: "Fanuc", website: "https://www.fanuc.eu", tier: 3,
    focus: ["Robotics", "Servo & Motion"],
    note: "CNC and robots; machine-tool sector, spares are high-value.",
  },
  {
    name: "KUKA", website: "https://www.kuka.com", tier: 3,
    focus: ["Robotics"],
    note: "Automotive body-shop robots; limited but high-ticket demand.",
  },

  // ── Tier 2/3 — value tier & regional challengers (fast-growing) ───────────
  {
    name: "INVT", website: "https://www.invt.com", tier: 2,
    focus: ["Drives & VFDs", "Servo & Motion", "PLC & Controllers", "HMI & Visualization"],
    note: "Aggressive price tier winning Egyptian/African retrofit and OEM work where budget rules.",
  },
  {
    name: "Inovance", website: "https://www.inovance.com", tier: 2,
    focus: ["Drives & VFDs", "Servo & Motion", "PLC & Controllers"],
    note: "MD500 series scaling fast in MEA; strong price/performance.",
  },
  {
    name: "LS Electric", website: "https://www.ls-electric.com", tier: 2,
    focus: ["Drives & VFDs", "PLC & Controllers", "Motor Control"],
    note: "Named among leading MEA VFD companies; XGT PLCs and Metasol contactors.",
  },
  {
    name: "Xinje", website: "https://www.xinje.com", tier: 3,
    focus: ["PLC & Controllers", "HMI & Visualization", "Servo & Motion"],
    note: "Budget PLC/HMI for small machine builders.",
  },
  {
    name: "Kinco", website: "https://en.kinco.cn", tier: 3,
    focus: ["HMI & Visualization", "Servo & Motion", "PLC & Controllers"],
    note: "Low-cost HMIs and steppers.",
  },
  {
    name: "Weintek", website: "https://www.weintek.com", tier: 2,
    focus: ["HMI & Visualization"],
    note: "cMT/MT series — the value HMI of choice for Egyptian panel builders.",
  },
  {
    name: "Autonics", website: "https://www.autonics.com", tier: 2,
    focus: ["Sensors & Switches", "Temperature Controllers", "Encoders", "Relays & Timers"],
    note: "Korean value sensors/controllers; very high unit volume, low ticket.",
  },
  {
    name: "Hanyoung Nux", website: "https://www.hanyoungnux.com", tier: 3,
    focus: ["Temperature Controllers", "Relays & Timers", "Sensors & Switches"],
    note: "Temperature control for plastics and heat-treatment.",
  },

  // ── Tier 2/3 — electrical control components ─────────────────────────────
  {
    name: "Fuji Electric", website: "https://www.fujielectric.com", tier: 3,
    focus: ["Drives & VFDs", "Motor Control"],
    note: "Listed among leading MEA VFD companies; FRENIC series.",
  },
  {
    name: "Carlo Gavazzi", website: "https://www.gavazziautomation.com", tier: 3,
    focus: ["Relays & Timers", "Sensors & Switches", "Process Instruments"],
    note: "Solid-state relays and energy meters.",
  },
  {
    name: "Finder", website: "https://www.findernet.com", tier: 3,
    focus: ["Relays & Timers", "Power Supplies"],
    note: "Interface relays — high-frequency panel consumable.",
  },
  {
    name: "Lovato", website: "https://www.lovatoelectric.com", tier: 3,
    focus: ["Motor Control", "Operator Devices", "Process Instruments"],
    note: "Italian motor protection and ATS; price-competitive vs Schneider.",
  },
  {
    name: "Crouzet", website: "https://www.crouzet.com", tier: 3,
    focus: ["Relays & Timers", "Operator Devices", "Servo & Motion"],
    note: "Control relays and micro motors.",
  },
  {
    name: "Crydom", website: "https://www.sensata.com/products/solid-state-relays", tier: 3,
    focus: ["Relays & Timers"],
    note: "Sensata brand; solid-state relays for heater control.",
  },
  {
    name: "Panasonic Industry", website: "https://industry.panasonic.eu", tier: 3,
    focus: ["Sensors & Switches", "Relays & Timers", "Servo & Motion", "PLC & Controllers"],
    note: "Sensors and relays; FP-series PLCs niche.",
  },

  // ── Tier 3 — networking, HMI, IPC specialists ────────────────────────────
  {
    name: "Advantech", website: "https://www.advantech.com", tier: 3,
    focus: ["Industrial Networking", "HMI & Visualization", "DCS & SCADA"],
    note: "Industrial PCs and IoT gateways; growing with digitalization projects.",
  },
  {
    name: "Red Lion", website: "https://www.redlion.net", tier: 3,
    focus: ["Industrial Networking", "HMI & Visualization", "Process Instruments"],
    note: "Protocol converters and panel meters.",
  },
  {
    name: "Beijer Electronics", website: "https://www.beijerelectronics.com", tier: 3,
    focus: ["HMI & Visualization", "Industrial Networking"],
    note: "X2 HMIs and Westermo networking.",
  },
  {
    name: "Maple Systems", website: "https://www.maplesystems.com", tier: 3,
    focus: ["HMI & Visualization"],
    note: "Low-volume HMI alternative.",
  },
];
