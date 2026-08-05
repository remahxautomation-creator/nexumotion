// Original SVG artwork — an abstract DIN-rail control panel. Drawn rather than
// photographed so there is no stock-image licence or attribution to manage.
// Swap for a real photo of your own warehouse/panel work when you have one.
export default function ControlPanelArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 360"
      className={className}
      role="img"
      aria-label="Illustration of an industrial control panel with PLC, drive and terminal blocks"
    >
      <defs>
        <linearGradient id="cp-panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="cp-drive" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="cp-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A6286" />
          <stop offset="100%" stopColor="#084A66" />
        </linearGradient>
      </defs>

      {/* enclosure */}
      <rect x="14" y="14" width="492" height="332" rx="10" fill="url(#cp-panel)" />
      <rect x="14" y="14" width="492" height="332" rx="10" fill="none" stroke="#475569" strokeWidth="2" />

      {/* DIN rails */}
      {[92, 186, 280].map((y) => (
        <rect key={y} x="38" y={y} width="444" height="6" rx="2" fill="#64748b" opacity="0.55" />
      ))}

      {/* HMI panel */}
      <rect x="40" y="34" width="132" height="50" rx="4" fill="url(#cp-screen)" />
      <rect x="48" y="42" width="60" height="5" rx="2.5" fill="#ffffff" opacity="0.85" />
      <rect x="48" y="53" width="96" height="4" rx="2" fill="#ffffff" opacity="0.45" />
      <rect x="48" y="62" width="78" height="4" rx="2" fill="#ffffff" opacity="0.3" />
      <circle cx="158" cy="70" r="4" fill="#36B37E" />

      {/* PLC + I/O modules on rail 1 */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${186 + i * 60}, 40)`}>
          <rect width="50" height="52" rx="3" fill="#334155" stroke="#475569" />
          <rect x="7" y="8" width="36" height="3" rx="1.5" fill="#94a3b8" opacity="0.7" />
          {[0, 1, 2, 3].map((r) => (
            <circle key={r} cx={12 + (r % 2) * 26} cy={22 + Math.floor(r / 2) * 12} r="3"
              fill={r === 0 ? "#36B37E" : r === 1 ? "#FFAB00" : "#475569"} />
          ))}
          <rect x="7" y="44" width="36" height="3" rx="1.5" fill="#0f172a" />
        </g>
      ))}

      {/* VFD drive */}
      <g transform="translate(40, 128)">
        <rect width="116" height="58" rx="4" fill="url(#cp-drive)" stroke="#475569" />
        <rect x="12" y="10" width="52" height="20" rx="2" fill="#0f172a" />
        <rect x="17" y="16" width="30" height="4" rx="2" fill="#07C89B" />
        <rect x="17" y="23" width="20" height="3" rx="1.5" fill="#07C89B" opacity="0.6" />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={84 + i * 12} cy="20" r="4" fill="#475569" />
        ))}
        <rect x="12" y="38" width="92" height="10" rx="2" fill="#0f172a" opacity="0.7" />
      </g>

      {/* Contactors */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${172 + i * 76}, 128)`}>
          <rect width="64" height="58" rx="3" fill="#334155" stroke="#475569" />
          <rect x="10" y="9" width="44" height="14" rx="2" fill="#0f172a" opacity="0.6" />
          {[0, 1, 2, 3].map((c) => (
            <rect key={c} x={9 + c * 13} y="30" width="8" height="18" rx="1.5" fill="#1e293b" stroke="#64748b" strokeWidth="0.8" />
          ))}
        </g>
      ))}

      {/* Power supply */}
      <g transform="translate(404, 128)">
        <rect width="78" height="58" rx="3" fill="#334155" stroke="#475569" />
        <rect x="10" y="10" width="58" height="4" rx="2" fill="#94a3b8" opacity="0.6" />
        <circle cx="20" cy="30" r="5" fill="#36B37E" />
        <rect x="32" y="26" width="36" height="8" rx="2" fill="#0f172a" />
        <rect x="10" y="44" width="58" height="6" rx="2" fill="#0f172a" opacity="0.7" />
      </g>

      {/* Terminal blocks on rail 3 */}
      {Array.from({ length: 26 }).map((_, i) => (
        <g key={i} transform={`translate(${40 + i * 17}, 222)`}>
          <rect width="13" height="52" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />
          <rect x="3" y="8" width="7" height="7" rx="1" fill="#94a3b8" opacity="0.55" />
          <rect x="3" y="38" width="7" height="7" rx="1" fill="#94a3b8" opacity="0.35" />
        </g>
      ))}

      {/* wiring ducts */}
      <rect x="38" y="300" width="444" height="26" rx="3" fill="#0f172a" stroke="#475569" />
      {Array.from({ length: 18 }).map((_, i) => (
        <rect key={i} x={46 + i * 24} y="300" width="10" height="26" fill="#1e293b" />
      ))}
    </svg>
  );
}
