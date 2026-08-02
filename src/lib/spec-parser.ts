// Natural-language → structured catalogue filters.
//
// This runs with NO AI key required. When an LLM is configured it is used only
// to improve extraction (see lib/ai.ts) — never to generate product data. In a
// parts business a hallucinated part number means a wrong part ordered, so the
// model may interpret the question but the database always answers it.

export type ParsedQuery = {
  text: string;
  categoryHints: string[];      // category slugs
  brandHints: string[];         // brand names
  specFilters: { key: string; value: string }[];
  rangeFilters: { key: string; min?: number; max?: number }[];
  inStockOnly: boolean;
  freeText: string[];           // leftover tokens for name/SKU matching
};

// Category keyword → slug. Multiple phrasings per category, including the
// abbreviations engineers actually type.
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "plc-controllers": ["plc", "controller", "cpu", "s7", "logix", "melsec", "programmable"],
  "i-o-modules": ["i/o", "io module", "input module", "output module", "digital input", "analog input", "analogue input"],
  "drives-vfds": ["vfd", "drive", "inverter", "variable frequency", "variable speed", "vsd", "soft starter", "altivar", "sinamics", "powerflex"],
  "hmi-visualization": ["hmi", "touch panel", "operator panel", "display", "panel view", "touchscreen"],
  "servo-motion": ["servo", "motion", "servo drive", "servo motor", "positioning"],
  "motor-control": ["contactor", "overload", "motor starter", "starter", "tesys", "sirius"],
  "sensors-switches": ["sensor", "proximity", "photoelectric", "inductive", "capacitive", "ultrasonic", "limit switch", "prox"],
  safety: ["safety", "light curtain", "e-stop", "emergency stop", "interlock", "safety relay", "guard"],
  "power-supplies": ["power supply", "psu", "smps", "24v supply", "din rail supply"],
  "industrial-networking": ["switch", "ethernet", "network", "gateway", "router", "profinet switch", "media converter"],
  "relays-timers": ["relay", "timer", "solid state relay", "ssr", "interface relay"],
  pneumatics: ["pneumatic", "cylinder", "solenoid valve", "air", "actuator", "fitting"],
  hydraulics: ["hydraulic", "hydraulics", "proportional valve"],
  "process-instruments": ["transmitter", "flow meter", "flowmeter", "level", "pressure transmitter", "instrument", "ph", "turbidity"],
  "dcs-scada": ["dcs", "scada", "rtu", "telemetry"],
  robotics: ["robot", "cobot", "robotic", "manipulator"],
  "cables-connectors": ["cable", "connector", "cordset", "m12", "m8", "patch lead", "terminal"],
  "operator-devices": ["push button", "pushbutton", "pilot light", "selector", "indicator", "buzzer"],
  encoders: ["encoder", "resolver", "ppr"],
  "temperature-controllers": ["temperature controller", "pid", "thermostat", "temp controller"],
};

// Numeric units → the ProductSpec key they filter on.
const UNIT_TO_SPEC: { pattern: RegExp; key: string; scale?: number }[] = [
  { pattern: /(\d+(?:\.\d+)?)\s*kw\b/gi, key: "power_kw" },
  { pattern: /(\d+(?:\.\d+)?)\s*hp\b/gi, key: "power_kw", scale: 0.7457 },
  { pattern: /(\d+(?:\.\d+)?)\s*(?:amp|amps|a)\b/gi, key: "current" },
  { pattern: /(\d+(?:\.\d+)?)\s*(?:watt|watts|w)\b/gi, key: "power_w" },
  { pattern: /(\d+(?:\.\d+)?)\s*(?:inch|inches|in|")\b/gi, key: "screen_size" },
  { pattern: /(\d+(?:\.\d+)?)\s*(?:nm)\b/gi, key: "torque" },
  { pattern: /(\d+(?:\.\d+)?)\s*rpm\b/gi, key: "speed" },
  { pattern: /(\d+(?:\.\d+)?)\s*bar\b/gi, key: "pressure" },
  { pattern: /(\d+(?:\.\d+)?)\s*(?:ppr)\b/gi, key: "resolution" },
  { pattern: /(\d+(?:\.\d+)?)\s*(?:kg)\b/gi, key: "payload" },
  { pattern: /(\d+(?:\.\d+)?)\s*mm\b/gi, key: "sensing_range" },
];

const STOP_WORDS = new Set([
  "a","an","the","for","with","and","or","to","of","in","on","at","i","need","want","looking",
  "find","me","my","is","are","that","can","you","please","show","get","give","have","has","do",
  "какой","من","في","على","عن","الى","إلى","هل","اريد","أريد","ابحث","أبحث","محتاج",
]);

function tolerance(n: number): { min: number; max: number } {
  // ±25% band so "22 kW" surfaces an 18.5 or 30 kW neighbour rather than nothing.
  const pad = Math.max(n * 0.25, 0.5);
  return { min: Math.max(0, n - pad), max: n + pad };
}

export function parseQuery(raw: string, knownBrands: string[] = []): ParsedQuery {
  const text = raw.trim();
  const lower = text.toLowerCase();

  // ── categories ──
  const categoryHints: string[] = [];
  for (const [slug, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) categoryHints.push(slug);
  }

  // ── brands ──
  const brandHints = knownBrands.filter((b) => {
    const bl = b.toLowerCase();
    return lower.includes(bl) || (bl.includes("-") && lower.includes(bl.replace("-", " ")));
  });

  // ── enumerated specs ──
  const specFilters: { key: string; value: string }[] = [];

  const ip = lower.match(/\bip\s?(\d{2}k?)\b/i);
  if (ip) specFilters.push({ key: "ip_rating", value: `IP${ip[1].toUpperCase()}` });

  if (/\bpnp\b/i.test(lower) && /\bnpn\b/i.test(lower)) specFilters.push({ key: "output_type", value: "PNP+NPN" });
  else if (/\bpnp\b/i.test(lower)) specFilters.push({ key: "output_type", value: "PNP" });
  else if (/\bnpn\b/i.test(lower)) specFilters.push({ key: "output_type", value: "NPN" });
  if (/\bio-?link\b/i.test(lower)) specFilters.push({ key: "output_type", value: "IO-Link" });

  // Supply/coil voltage phrasings
  if (/\b24\s?v\s?dc\b/i.test(lower)) specFilters.push({ key: "coil_voltage", value: "24V DC" });
  else if (/\b230\s?v\s?ac\b/i.test(lower)) specFilters.push({ key: "coil_voltage", value: "230V AC" });
  else if (/\b110\s?v\s?ac\b/i.test(lower)) specFilters.push({ key: "coil_voltage", value: "110V AC" });

  if (/\b380\s?v|\b400\s?v|three\s?phase|3\s?phase|3-phase/i.test(lower))
    specFilters.push({ key: "voltage", value: "380V 3-ph" });
  else if (/\b220\s?v.*single|single\s?phase|1\s?phase/i.test(lower))
    specFilters.push({ key: "voltage", value: "220V 1-ph" });

  for (const [proto, val] of [
    ["profinet", "Profinet"], ["ethernet/ip", "EtherNet/IP"], ["ethernet ip", "EtherNet/IP"],
    ["modbus", "Modbus RTU"], ["ethercat", "EtherCAT"], ["canopen", "CANopen"],
  ] as const) {
    if (lower.includes(proto)) specFilters.push({ key: "communication", value: val });
  }

  // ── numeric ranges ──
  const rangeFilters: { key: string; min?: number; max?: number }[] = [];
  const consumed: string[] = [];

  // Explicit ranges: "10-30 kW", "between 10 and 30 kW"
  const explicit = lower.match(/(\d+(?:\.\d+)?)\s*(?:-|to|–|and)\s*(\d+(?:\.\d+)?)\s*(kw|a|amps?|w|bar|mm|rpm|nm)\b/i);
  if (explicit) {
    const key = guessKeyForUnit(explicit[3]);
    if (key) {
      rangeFilters.push({ key, min: Number(explicit[1]), max: Number(explicit[2]) });
      consumed.push(explicit[0]);
    }
  }

  if (rangeFilters.length === 0) {
    for (const { pattern, key, scale } of UNIT_TO_SPEC) {
      const re = new RegExp(pattern.source, pattern.flags);
      let m: RegExpExecArray | null;
      while ((m = re.exec(lower)) !== null) {
        const n = Number(m[1]) * (scale ?? 1);
        if (!Number.isFinite(n)) continue;
        // "above/over/min" and "below/under/max" qualifiers
        const before = lower.slice(Math.max(0, m.index - 22), m.index);
        if (/\b(above|over|more than|greater than|min|minimum|at least|من|أكثر)\b/.test(before)) {
          rangeFilters.push({ key, min: n });
        } else if (/\b(below|under|less than|max|maximum|up to|حتى|أقل)\b/.test(before)) {
          rangeFilters.push({ key, max: n });
        } else {
          const { min, max } = tolerance(n);
          rangeFilters.push({ key, min, max });
        }
        consumed.push(m[0]);
        break; // one range per spec key
      }
    }
  }

  const inStockOnly = /\bin stock|available|متوفر|متاح\b/i.test(lower);

  // ── leftover tokens for name/SKU matching ──
  let residual = lower;
  for (const c of consumed) residual = residual.replace(c, " ");
  const freeText = residual
    .split(/[\s,;/()]+/)
    .map((w) => w.replace(/[^\w؀-ۿ.-]/g, ""))
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));

  return { text, categoryHints, brandHints, specFilters, rangeFilters, inStockOnly, freeText };
}

function guessKeyForUnit(unit: string): string | null {
  const u = unit.toLowerCase();
  if (u === "kw") return "power_kw";
  if (u === "a" || u === "amp" || u === "amps") return "current";
  if (u === "w") return "power_w";
  if (u === "bar") return "pressure";
  if (u === "mm") return "sensing_range";
  if (u === "rpm") return "speed";
  if (u === "nm") return "torque";
  return null;
}

// Human-readable account of what was understood, so the user can see why they
// got these results and correct the interpretation rather than guess.
export function describeParse(p: ParsedQuery, categoryNames: Record<string, string>): string[] {
  const out: string[] = [];
  if (p.categoryHints.length) {
    out.push(p.categoryHints.map((c) => categoryNames[c] ?? c).join(", "));
  }
  if (p.brandHints.length) out.push(p.brandHints.join(", "));
  for (const s of p.specFilters) out.push(`${s.key.replace(/_/g, " ")}: ${s.value}`);
  for (const r of p.rangeFilters) {
    const label = r.key.replace(/_/g, " ");
    if (r.min !== undefined && r.max !== undefined) out.push(`${label} ${round(r.min)}–${round(r.max)}`);
    else if (r.min !== undefined) out.push(`${label} ≥ ${round(r.min)}`);
    else if (r.max !== undefined) out.push(`${label} ≤ ${round(r.max)}`);
  }
  if (p.inStockOnly) out.push("in stock only");
  return out;
}

const round = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
