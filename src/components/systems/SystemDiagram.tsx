import type { DiagramLayer } from "@/content/systems";

// Data-driven architecture diagram. Each system supplies its own layers, so the
// drawing genuinely differs per system rather than repeating one stock image.
// Original SVG — no stock-photo licence or attribution to manage.
export default function SystemDiagram({
  layers,
  accent,
  className = "",
}: {
  layers: DiagramLayer[];
  accent: string;
  className?: string;
}) {
  const LAYER_H = 78;
  const GAP = 16;
  const PAD = 20;
  const W = 720;
  const H = PAD * 2 + layers.length * LAYER_H + (layers.length - 1) * GAP;
  const labelW = 108;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label={`System architecture: ${layers.map((l) => l.label).join(", ")}`}
    >
      <defs>
        <marker id="sd-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,1 L6,4 L0,7 z" fill="#94a3b8" />
        </marker>
      </defs>

      <rect x="0" y="0" width={W} height={H} rx="10" fill="#f8fafc" stroke="#e2e8f0" />

      {layers.map((layer, li) => {
        const y = PAD + li * (LAYER_H + GAP);
        const nodeAreaX = PAD + labelW + 12;
        const nodeAreaW = W - nodeAreaX - PAD;
        const n = layer.nodes.length;
        const nodeGap = 10;
        const nodeW = (nodeAreaW - (n - 1) * nodeGap) / n;

        return (
          <g key={layer.label}>
            {/* layer band */}
            <rect
              x={PAD} y={y} width={W - PAD * 2} height={LAYER_H}
              rx="8" fill="#ffffff" stroke="#e2e8f0"
            />

            {/* layer label */}
            <rect x={PAD} y={y} width={labelW} height={LAYER_H} rx="8" fill={accent} opacity="0.09" />
            <text
              x={PAD + labelW / 2} y={y + LAYER_H / 2 + 4}
              textAnchor="middle" fontSize="12" fontWeight="700" fill={accent}
            >
              {layer.label.length > 15 ? layer.label.slice(0, 14) + "…" : layer.label}
            </text>

            {/* nodes */}
            {layer.nodes.map((node, ni) => {
              const nx = nodeAreaX + ni * (nodeW + nodeGap);
              return (
                <g key={node}>
                  <rect
                    x={nx} y={y + 16} width={nodeW} height={LAYER_H - 32}
                    rx="6" fill="#ffffff" stroke={accent} strokeOpacity="0.35" strokeWidth="1.5"
                  />
                  <rect
                    x={nx} y={y + 16} width={nodeW} height="3"
                    rx="1.5" fill={accent} opacity="0.75"
                  />
                  <text
                    x={nx + nodeW / 2} y={y + LAYER_H / 2 + 4}
                    textAnchor="middle" fontSize="11" fill="#334155"
                  >
                    {node.length > 18 ? node.slice(0, 17) + "…" : node}
                  </text>
                </g>
              );
            })}

            {/* connector to the layer below */}
            {li < layers.length - 1 && (
              <line
                x1={W / 2} y1={y + LAYER_H}
                x2={W / 2} y2={y + LAYER_H + GAP - 2}
                stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#sd-arrow)"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
