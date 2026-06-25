import { useCurrentFrame } from "remotion";
import { C } from "../constants/colors";

export const AnimatedCustomerScene: React.FC<{ width?: number; height?: number }> = ({
  width = 520, height = 360,
}) => {
  const frame = useCurrentFrame();
  const float = Math.sin(frame * 0.06) * 5;
  const thumbUp = Math.sin(frame * 0.14) * 8;
  const confettiAge = frame % 80;
  const auraScale = 1 + Math.sin(frame * 0.08) * 0.05;
  const logoGlow = 14 + Math.sin(frame * 0.12) * 6;
  const smile2 = 270 + Math.sin(frame * 0.09) * 3;

  const CONFETTI = Array.from({ length: 20 }, (_, i) => ({
    x: (i * 83 + 40) % 480 + 20,
    y: -20 + ((confettiAge * (3 + i % 4)) % 360),
    color: [C.cyan, C.gold, "#ffffff", C.green, "#A0C4FF"][i % 5],
    rot: confettiAge * (4 + i % 6),
  }));

  return (
    <svg width={width} height={height} viewBox="0 0 520 360" style={{ display: "block" }}>
      <defs>
        <radialGradient id="custBg2" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.07 + Math.sin(frame * 0.08) * 0.03} />
          <stop offset="100%" stopColor="#0A0E1A" stopOpacity="0" />
        </radialGradient>
        <filter id="custGlow2">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="520" height="360" fill="#0A0E1A" rx="12" />
      <rect width="520" height="360" fill="url(#custBg2)" rx="12" />

      {/* Confetti */}
      {CONFETTI.map((c, i) => (
        <rect key={i} x={c.x} y={c.y % 380} width={8} height={8}
          fill={c.color} opacity={0.7}
          transform={`rotate(${c.rot}, ${c.x + 4}, ${c.y % 380 + 4})`}
          rx={i % 2 === 0 ? "50%" : "1"} />
      ))}

      {/* Aura rings */}
      {[1, 0.7, 0.45].map((s, i) => (
        <ellipse key={i} cx="260" cy="195" rx={110 * s * auraScale} ry={130 * s * auraScale}
          fill="none" stroke={C.cyan} strokeWidth={3 - i}
          opacity={0.18 - i * 0.04} style={{ filter: "blur(3px)" }} />
      ))}

      {/* Person */}
      <g transform={`translate(0, ${float})`}>
        {/* Legs */}
        <rect x="232" y="308" width="25" height="52" rx="7" fill="#1e3060" />
        <rect x="265" y="308" width="25" height="52" rx="7" fill="#1e3060" />
        <ellipse cx="244" cy="360" rx="20" ry="8" fill="#1a1a2a" />
        <ellipse cx="278" cy="360" rx="20" ry="8" fill="#1a1a2a" />

        {/* Body */}
        <path d="M178,260 Q210,244 260,248 Q310,244 342,260 L350,340 L170,340 Z" fill="#1e3060" />
        <path d="M260,248 L238,270 L248,320 Z" fill="#162550" />
        <path d="M260,248 L282,270 L272,320 Z" fill="#162550" />
        <path d="M248,249 L272,249 L268,340 L252,340 Z" fill="#f8f8f8" />
        <polygon points="256,251 264,251 260,308 256,308" fill={C.cyan} />

        {/* Arms — crossed + thumbs up */}
        <path d="M178,268 Q160,300 175,325 Q192,332 220,322" stroke="#1e3060" strokeWidth="26" fill="none" strokeLinecap="round" />
        <path d="M342,262 Q368,240 365,${220 + thumbUp} Q360,${200 + thumbUp} 345,${210 + thumbUp}"
          stroke="#1e3060" strokeWidth="24" fill="none" strokeLinecap="round" />
        {/* Hand */}
        <circle cx="348" cy={218 + thumbUp} r="14" fill="#c8956c" />
        <path d={`M339,${226 + thumbUp} Q336,${206 + thumbUp} 348,${199 + thumbUp} Q360,${197 + thumbUp} 362,${208 + thumbUp} L360,${226 + thumbUp} Z`}
          fill="#c8956c" />

        {/* Neck */}
        <rect x="249" y="224" width="22" height="28" rx="4" fill="#c8956c" />

        {/* Head */}
        <ellipse cx="260" cy="192" rx="65" ry="72" fill="#c8956c" />
        <ellipse cx="260" cy="130" rx="66" ry="26" fill="#1a0800" />
        <ellipse cx="200" cy="158" rx="17" ry="36" fill="#1a0800" />
        <ellipse cx="320" cy="158" rx="17" ry="36" fill="#1a0800" />

        {/* Confident brows */}
        <path d="M235,176 Q248,170 262,174" stroke="#1a0800" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M258,174 Q272,170 285,176" stroke="#1a0800" strokeWidth="4" fill="none" strokeLinecap="round" />

        {/* Eyes */}
        <ellipse cx="245" cy="194" rx="11" ry="12" fill="white" />
        <ellipse cx="275" cy="194" rx="11" ry="12" fill="white" />
        <circle cx="248" cy="196" r="7" fill="#1a0800" />
        <circle cx="278" cy="196" r="7" fill="#1a0800" />
        <circle cx="251" cy="193" r="2.5" fill="white" />
        <circle cx="281" cy="193" r="2.5" fill="white" />

        {/* Big smile */}
        <path d={`M242,222 Q260,${smile2} 278,222`}
          stroke="#8B4513" strokeWidth="3" fill="#d07050" strokeLinecap="round" />
        <path d={`M244,222 Q260,${smile2 - 7} 276,222`} fill="white" opacity="0.8" />
        <circle cx="232" cy="218" r="5" fill="#d4956c" opacity="0.35" />
        <circle cx="288" cy="218" r="5" fill="#d4956c" opacity="0.35" />
      </g>

      {/* ChinaCart badge */}
      <g transform={`translate(0, ${float})`} filter="url(#custGlow2)">
        <rect x="210" y="284" width="100" height="44" rx="9"
          fill="#0A0E1A" stroke={C.cyan} strokeWidth="2.5"
          style={{ filter: `drop-shadow(0 0 ${logoGlow}px ${C.cyan})` }} />
        <text x="260" y="302" textAnchor="middle" fontSize="11" fill={C.cyan} fontWeight="900">🛒 ChinaCart</text>
        <text x="260" y="318" textAnchor="middle" fontSize="9" fill="#A0C4FF">chinacart.com.bd</text>
      </g>

      {/* Stars */}
      {[50, 440, 70, 420, 80, 400].map((v, i) => {
        if (i % 2 !== 0) return null;
        const sop = 0.5 + Math.sin(frame * 0.1 + i * 0.7) * 0.3;
        const x = [50, 440, 30, 460][i / 2] || 60;
        const y = [60, 55, 200, 190][i / 2] || 60;
        return <text key={i} x={x} y={y} fontSize="22" fill={C.gold} opacity={sop}>★</text>;
      })}
    </svg>
  );
};
