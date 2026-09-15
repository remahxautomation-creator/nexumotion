/**
 * Hero artwork: a panel populated with real parts from the catalogue.
 *
 * Every component drawn here is an actual product in the database — the brand
 * and part number under each one are real, and each links to nothing because
 * this is decoration, not navigation. The catalogue holds no product
 * photography (it used to carry a competing distributor's photos, which were
 * removed), so the parts are drawn as recognisable silhouettes of their type:
 * a VFD looks like a VFD, a proximity sensor like a barrel sensor, and so on.
 *
 * The point is specificity. A generic control-panel illustration says
 * "industrial"; this says "we stock the Siemens 3LD2203-0TK53", which is what a
 * maintenance engineer scanning the page is actually looking for.
 *
 * Swap PARTS for a photo-based collage the moment real photographs exist. Keep
 * the entries tied to products that are live — a part number on the hero that
 * 404s when searched would be worse than no hero at all.
 *
 * Same 520×360 viewBox as the illustration it replaces, so HeroCollage's layout
 * is untouched.
 */

type Kind = "isolator" | "vfd" | "hmi" | "safety" | "sensor" | "relay" | "switch" | "psu";

/** Real catalogue products. Verified against public/catalog/listing.json. */
const PARTS: Array<{ brand: string; sku: string; kind: Kind }> = [
  { brand: "Siemens", sku: "3LD2203-0TK53", kind: "isolator" },
  { brand: "Eaton", sku: "DC1-345D8NB-A20CE1", kind: "vfd" },
  { brand: "Schneider", sku: "HMIG3XFH", kind: "hmi" },
  { brand: "Pilz", sku: "PNOZ X3 · 774310", kind: "safety" },
  { brand: "SICK", sku: "IME18-08BPSZC0S", kind: "sensor" },
  { brand: "Omron", sku: "PYFZ-14-E", kind: "relay" },
  { brand: "Siemens", sku: "6GK5005-0BA00", kind: "switch" },
  { brand: "Delta", sku: "DRU-24V10ACZ", kind: "psu" },
];

const SLOT_W = 118;
const SLOT_H = 130;
const COLS = 4;
const PAD_X = 24;
const PAD_Y = 22;

function Part({ kind }: { kind: Kind }) {
  // Each drawing is centred in an 80×70 box at origin; the caller positions it.
  switch (kind) {
    case "isolator":
      return (
        <g>
          <rect x="10" y="4" width="60" height="62" rx="4" fill="#334155" stroke="#475569" />
          <circle cx="40" cy="30" r="14" fill="#1e293b" stroke="#64748b" />
          <rect x="37" y="14" width="6" height="22" rx="2" fill="#f59e0b" transform="rotate(-30 40 30)" />
          <rect x="16" y="54" width="48" height="6" rx="1" fill="#0f172a" />
          <text x="40" y="49" fontSize="6" fill="#94a3b8" textAnchor="middle" fontFamily="sans-serif">0 | I</text>
        </g>
      );
    case "vfd":
      return (
        <g>
          <rect x="18" y="0" width="44" height="70" rx="3" fill="#1e293b" stroke="#475569" />
          <rect x="24" y="6" width="32" height="14" rx="1" fill="#0f172a" />
          <text x="40" y="16" fontSize="7" fill="#22d3ee" textAnchor="middle" fontFamily="monospace">50.0</text>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={26 + (i % 2) * 15} y={26 + Math.floor(i / 2) * 11} width="12" height="8" rx="1" fill="#334155" />
          ))}
          <circle cx="40" cy="55" r="5" fill="#0f172a" stroke="#64748b" />
          <rect x="22" y="64" width="36" height="4" fill="#0f172a" />
          <circle cx="56" cy="9" r="1.5" fill="#22c55e" />
        </g>
      );
    case "hmi":
      return (
        <g>
          <rect x="2" y="12" width="76" height="48" rx="3" fill="#0f172a" stroke="#475569" />
          <rect x="8" y="17" width="64" height="36" rx="1" fill="#0e7490" />
          <rect x="12" y="21" width="30" height="3" rx="1" fill="#a5f3fc" opacity="0.8" />
          <rect x="12" y="27" width="20" height="3" rx="1" fill="#67e8f9" opacity="0.6" />
          <rect x="46" y="21" width="22" height="26" rx="1" fill="#155e75" />
          <rect x="12" y="40" width="56" height="9" rx="1" fill="#155e75" />
          <circle cx="72" cy="15" r="1.5" fill="#22c55e" />
        </g>
      );
    case "safety":
      return (
        <g>
          <rect x="24" y="2" width="32" height="66" rx="2" fill="#1e293b" stroke="#475569" />
          <rect x="24" y="2" width="32" height="8" rx="2" fill="#facc15" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x="29" y={16 + i * 8} width="22" height="4" rx="1" fill="#0f172a" />
          ))}
          <circle cx="34" cy="56" r="2" fill="#22c55e" />
          <circle cx="40" cy="56" r="2" fill="#22c55e" />
          <circle cx="46" cy="56" r="2" fill="#ef4444" opacity="0.5" />
        </g>
      );
    case "sensor":
      return (
        <g>
          <rect x="8" y="28" width="54" height="14" rx="2" fill="#94a3b8" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={i} x={12 + i * 7} y="28" width="1.5" height="14" fill="#64748b" opacity="0.6" />
          ))}
          <rect x="62" y="26" width="12" height="18" rx="3" fill="#0ea5e9" />
          <rect x="2" y="31" width="8" height="8" rx="1" fill="#475569" />
          <path d="M 2 35 L -8 35" stroke="#475569" strokeWidth="2" />
          <circle cx="68" cy="35" r="2" fill="#fef08a" />
        </g>
      );
    case "relay":
      return (
        <g>
          <rect x="22" y="6" width="36" height="58" rx="2" fill="#334155" stroke="#475569" />
          <rect x="26" y="10" width="28" height="30" rx="1" fill="#e2e8f0" />
          <rect x="30" y="14" width="20" height="4" fill="#94a3b8" />
          <rect x="30" y="21" width="12" height="3" fill="#94a3b8" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={26 + (i % 3) * 10} y={46 + Math.floor(i / 3) * 8} width="6" height="5" fill="#0f172a" />
          ))}
        </g>
      );
    case "switch":
      return (
        <g>
          <rect x="4" y="16" width="72" height="40" rx="3" fill="#1e293b" stroke="#475569" />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x={10 + i * 13} y="36" width="10" height="12" rx="1" fill="#0f172a" stroke="#475569" strokeWidth="0.5" />
              <circle cx={15 + i * 13} cy="30" r="1.5" fill={i < 3 ? "#22c55e" : "#334155"} />
            </g>
          ))}
          <text x="40" y="24" fontSize="5" fill="#94a3b8" textAnchor="middle" fontFamily="sans-serif">ETHERNET</text>
        </g>
      );
    case "psu":
      return (
        <g>
          <rect x="14" y="2" width="52" height="66" rx="3" fill="#334155" stroke="#475569" />
          <rect x="20" y="8" width="40" height="22" rx="1" fill="#1e293b" />
          <text x="40" y="22" fontSize="7" fill="#e2e8f0" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">24V</text>
          <circle cx="24" cy="38" r="2" fill="#22c55e" />
          <text x="30" y="40" fontSize="4.5" fill="#94a3b8" fontFamily="sans-serif">DC OK</text>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={20 + i * 10} y="52" width="7" height="10" rx="1" fill="#0f172a" stroke="#64748b" strokeWidth="0.5" />
          ))}
        </g>
      );
  }
}

export default function PartsBoardArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 360"
      className={className}
      role="img"
      aria-label="Illustration of a control panel showing real parts from the NexuMotion catalogue, labelled with their manufacturer and part number"
    >
      <defs>
        <linearGradient id="pb-panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* Enclosure */}
      <rect x="0" y="0" width="520" height="360" rx="14" fill="url(#pb-panel)" />
      <rect x="6" y="6" width="508" height="348" rx="10" fill="none" stroke="#334155" />

      {/* Two DIN rails, one per row */}
      {[0, 1].map((row) => (
        <g key={row}>
          <rect x={PAD_X} y={PAD_Y + row * SLOT_H + 78} width={520 - PAD_X * 2} height="8" fill="#475569" />
          <rect x={PAD_X} y={PAD_Y + row * SLOT_H + 80} width={520 - PAD_X * 2} height="2" fill="#64748b" />
        </g>
      ))}

      {PARTS.map((p, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = PAD_X + col * SLOT_W + (SLOT_W - 80) / 2;
        const y = PAD_Y + row * SLOT_H + 10;
        const cx = PAD_X + col * SLOT_W + SLOT_W / 2;
        return (
          <g key={p.sku}>
            <g transform={`translate(${x}, ${y})`}>
              <Part kind={p.kind} />
            </g>
            <text
              x={cx}
              y={y + 92}
              fontSize="9"
              fontWeight="700"
              fill="#e2e8f0"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              {p.brand}
            </text>
            <text
              x={cx}
              y={y + 103}
              fontSize="7.5"
              fill="#7dd3fc"
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
            >
              {p.sku}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
