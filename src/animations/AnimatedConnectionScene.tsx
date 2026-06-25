import { useCurrentFrame, interpolate } from "remotion";
import { C } from "../constants/colors";

const ChinaSkyline: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      {/* Sky */}
      <rect x="0" y="0" width="280" height="320" fill="#08101e" />
      {/* Stars */}
      {[20, 60, 100, 140, 200, 240].map((x, i) => (
        <circle key={i} cx={x} cy={20 + (i * 13) % 60} r={1 + (i % 2)}
          fill="white" opacity={0.4 + Math.sin(frame * 0.1 + i) * 0.25} />
      ))}
      {/* Moon */}
      <circle cx="230" cy="45" r="24" fill="#2a3a5a" />
      <circle cx="240" cy="38" r="19" fill="#12203a" />
      {/* Pagoda 1 */}
      <path d="M30,180 L60,180 L55,160 L35,160 Z" fill="#1a3060" />
      <path d="M28,162 L62,162 L58,148 L32,148 Z" fill="#1e3a70" />
      <path d="M31,150 L59,150 L56,138 L34,138 Z" fill="#223878" />
      <path d="M34,140 L56,140 L54,130 L36,130 Z" fill="#263e80" />
      <rect x="43" y="118" width="4" height="14" fill="#2a4288" />
      {/* Upturned roof lines */}
      <path d="M26,162 Q20,155 18,152" stroke="#1e3a70" strokeWidth="2" fill="none" />
      <path d="M64,162 Q70,155 72,152" stroke="#1e3a70" strokeWidth="2" fill="none" />
      {/* Pagoda 2 — smaller */}
      <path d="M90,220 L115,220 L111,205 L94,205 Z" fill="#1a3060" />
      <path d="M88,207 L117,207 L114,196 L91,196 Z" fill="#1e3a70" />
      <rect x="100" y="186" width="3" height="12" fill="#2a4288" />
      {/* Modern tower */}
      <rect x="140" y="100" width="40" height="220" rx="4" fill="#0e2040" />
      {/* Windows */}
      {Array.from({ length: 12 }, (_, row) =>
        Array.from({ length: 3 }, (_, col) => (
          <rect key={`${row}-${col}`} x={146 + col * 12} y={108 + row * 16} width="8" height="10" rx="1"
            fill="#FFD700" opacity={0.2 + Math.sin(frame * 0.05 + row * 0.4 + col * 0.8) * 0.3} />
        ))
      ).flat()}
      {/* Tower top */}
      <polygon points="140,100 180,100 166,60 154,60" fill="#122a50" />
      <rect x="158" y="40" width="4" height="22" fill="#00E5FF" opacity="0.7" />
      {/* Red light on top */}
      <circle cx="160" cy="40" r="4" fill="#FF2D2D" opacity={0.6 + Math.sin(frame * 0.2) * 0.3} />
      {/* More buildings */}
      <rect x="195" y="160" width="28" height="160" rx="3" fill="#0c1e38" />
      <rect x="230" y="180" width="22" height="140" rx="2" fill="#0e2040" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={198 + (i % 2) * 12} y={168 + Math.floor(i / 2) * 20} width="8" height="12" rx="1"
          fill="#A0C4FF" opacity={0.15 + Math.sin(frame * 0.06 + i) * 0.1} />
      ))}
      {/* Ground */}
      <rect x="0" y="318" width="280" height="16" fill="#06101e" />
      {/* Ground lights */}
      {[25, 80, 140, 200, 250].map((x, i) => (
        <circle key={i} cx={x} cy="316" r="4" fill="#FFD700" opacity={0.3 + Math.sin(frame * 0.1 + i) * 0.2} />
      ))}
    </g>
  );
};

const DhakaSkyline: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g transform="translate(280, 0)">
      {/* Sky */}
      <rect x="0" y="0" width="280" height="320" fill="#0a1218" />
      {/* Stars */}
      {[30, 70, 120, 180, 230, 260].map((x, i) => (
        <circle key={i} cx={x} cy={25 + (i * 11) % 55} r={1 + (i % 2)}
          fill="white" opacity={0.35 + Math.sin(frame * 0.1 + i * 1.3) * 0.2} />
      ))}
      {/* Moon crescent */}
      <circle cx="60" cy="50" r="22" fill="#1a2a3a" />
      <circle cx="68" cy="44" r="18" fill="#0a1218" />
      {/* Shaheed Minar-inspired monument */}
      <path d="M110,160 L130,160 L128,100 L112,100 Z" fill="#1a3a5a" />
      {/* Arch */}
      <path d="M105,162 Q120,140 135,162" stroke="#1e4a6a" strokeWidth="4" fill="none" />
      <path d="M94,165 L146,165 L144,158 L96,158 Z" fill="#1e4a6a" />
      {/* Steps */}
      <rect x="100" y="162" width="40" height="8" rx="1" fill="#22506e" />
      <rect x="105" y="168" width="30" height="7" rx="1" fill="#1e4a6a" />
      {/* National Mosque dome */}
      <path d="M165,220 Q185,180 205,220 Z" fill="#1a3a5a" />
      <ellipse cx="185" cy="220" rx="22" ry="8" fill="#1e4060" />
      <rect x="175" y="220" width="20" height="50" rx="2" fill="#1a3060" />
      {/* Minarets */}
      {[150, 210].map((x, i) => (
        <g key={i}>
          <rect x={x} y="196" width="8" height="50" rx="2" fill="#22506e" />
          <path d={`M${x - 2},196 Q${x + 4},182 ${x + 10},196 Z`} fill="#264a72" />
        </g>
      ))}
      {/* High-rise */}
      <rect x="228" y="120" width="36" height="200" rx="3" fill="#0e2038" />
      {Array.from({ length: 10 }, (_, r) =>
        Array.from({ length: 2 }, (_, c) => (
          <rect key={`${r}-${c}`} x={232 + c * 16} y={128 + r * 18} width="10" height="12" rx="1"
            fill={C.green} opacity={0.1 + Math.sin(frame * 0.06 + r * 0.5 + c) * 0.12} />
        ))
      ).flat()}
      {/* Rickshaw in street */}
      <g transform={`translate(${20 + (frame * 0.8) % 240}, 310)`}>
        <ellipse cx="12" cy="3" rx="12" ry="6" fill="#FF2D2D" opacity="0.7" />
        <circle cx="4" cy="6" r="4" fill="#222" />
        <circle cx="22" cy="6" r="4" fill="#222" />
      </g>
      {/* Ground */}
      <rect x="0" y="318" width="280" height="16" fill="#040c12" />
      {[30, 90, 150, 220].map((x, i) => (
        <circle key={i} cx={x} cy="316" r="3" fill={C.green} opacity={0.25 + Math.sin(frame * 0.12 + i) * 0.15} />
      ))}
    </g>
  );
};

export const AnimatedConnectionScene: React.FC<{ width?: number; height?: number }> = ({
  width = 560, height = 360,
}) => {
  const frame = useCurrentFrame();
  const pathProgress = interpolate(frame, [0, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pathLen = 480;
  const beamOp = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const connectedGlow = interpolate(frame, [95, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Package along curve
  const t = pathProgress;
  const px = 140 * (1 - t) ** 2 + 2 * 280 * (1 - t) * t + 420 * t ** 2;
  const py = 240 * (1 - t) ** 2 + 2 * 100 * (1 - t) * t + 240 * t ** 2;

  return (
    <svg width={width} height={height} viewBox="0 0 560 360" style={{ display: "block" }}>
      <defs>
        <linearGradient id="connBg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#08101e" />
          <stop offset="50%" stopColor="#0a1220" />
          <stop offset="100%" stopColor="#080e18" />
        </linearGradient>
        <linearGradient id="goldBeam" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#FFD700" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#00C853" stopOpacity="0.9" />
        </linearGradient>
        <filter id="connGlow">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="560" height="360" fill="url(#connBg)" rx="12" />

      {/* Skylines */}
      <ChinaSkyline />
      <DhakaSkyline />

      {/* Center divider — glowing line */}
      <line x1="280" y1="0" x2="280" y2="360" stroke="url(#goldBeam)" strokeWidth="1" opacity="0.3" />

      {/* Labels */}
      <text x="140" y="20" textAnchor="middle" fontSize="13" fill={C.cyan} fontWeight="bold"
        style={{ filter: `drop-shadow(0 0 8px ${C.cyan})` }}>
        🇨🇳 চায়না
      </text>
      <text x="420" y="20" textAnchor="middle" fontSize="13" fill={C.green} fontWeight="bold"
        style={{ filter: `drop-shadow(0 0 8px ${C.green})` }}>
        বাংলাদেশ 🇧🇩
      </text>

      {/* Golden beam */}
      <path d="M140,240 Q280,100 420,240" fill="none"
        stroke="url(#goldBeam)" strokeWidth="12" opacity={beamOp * 0.15}
        style={{ filter: "blur(8px)" }} />

      {/* Dotted path */}
      <path d="M140,240 Q280,100 420,240" fill="none"
        stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="10 8" />

      {/* Animated draw */}
      <path d="M140,240 Q280,100 420,240" fill="none"
        stroke="url(#goldBeam)" strokeWidth="4" strokeLinecap="round"
        strokeDasharray={pathLen} strokeDashoffset={pathLen * (1 - pathProgress)}
        filter="url(#connGlow)" />

      {/* Package traveller */}
      {pathProgress > 0.03 && (
        <g transform={`translate(${px - 16}, ${py - 16})`}>
          <rect x="0" y="0" width="32" height="32" rx="7" fill="#FFD700"
            style={{ filter: "drop-shadow(0 0 12px #FFD700)" }} />
          <text x="16" y="23" textAnchor="middle" fontSize="18">📦</text>
        </g>
      )}

      {/* Flag markers */}
      <g filter="url(#connGlow)">
        <circle cx="140" cy="240" r="14" fill={C.cyan} opacity="0.9" />
        <circle cx="140" cy="240" r="9" fill="white" />
        <circle cx="140" cy="240" r="5" fill="#0a1a3a" />
      </g>
      <g filter="url(#connGlow)">
        <circle cx="420" cy="240" r="14" fill={C.green} opacity="0.9" />
        <circle cx="420" cy="240" r="9" fill="white" />
        <circle cx="420" cy="240" r="5" fill="#0a1a3a" />
      </g>

      {/* Connected celebration */}
      <g opacity={connectedGlow}>
        <rect x="170" y="300" width="220" height="42" rx="10" fill="rgba(0,10,30,0.92)"
          stroke={C.cyan} strokeWidth="2"
          style={{ filter: `drop-shadow(0 0 16px ${C.cyan})` }} />
        <text x="280" y="318" textAnchor="middle" fontSize="12" fill={C.cyan} fontWeight="900">
          🛒 ChinaCart
        </text>
        <text x="280" y="334" textAnchor="middle" fontSize="10" fill={C.gold}>
          চায়না → বাংলাদেশ ✓
        </text>
      </g>
    </svg>
  );
};
