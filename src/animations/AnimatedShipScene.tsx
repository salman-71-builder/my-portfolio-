import { useCurrentFrame, interpolate } from "remotion";

export const AnimatedShipScene: React.FC<{ width?: number; height?: number }> = ({
  width = 560, height = 300,
}) => {
  const frame = useCurrentFrame();
  const shipX = interpolate(frame, [0, 200], [-180, 600], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bob = Math.sin(frame * 0.07) * 5;
  const cloudX1 = (frame * 0.35) % 680 - 80;
  const cloudX2 = ((frame * 0.22) + 250) % 720 - 80;
  const smoke = Math.sin(frame * 0.12) * 4;

  return (
    <svg width={width} height={height} viewBox="0 0 560 300" style={{ display: "block" }}>
      <defs>
        <linearGradient id="sSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#080e1e" />
          <stop offset="50%" stopColor="#0d1e40" />
          <stop offset="100%" stopColor="#0a3060" />
        </linearGradient>
        <linearGradient id="sOcean" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#083060" />
          <stop offset="100%" stopColor="#03101e" />
        </linearGradient>
      </defs>

      <rect width="560" height="300" fill="url(#sSky)" rx="12" />

      {/* Stars */}
      {[30, 80, 150, 220, 300, 380, 450, 520, 100, 200, 350, 480].map((x, i) => (
        <circle key={i} cx={x} cy={20 + (i * 7) % 60} r={1 + (i % 2) * 0.5}
          fill="white" opacity={0.4 + Math.sin(frame * 0.1 + i) * 0.25} />
      ))}

      {/* Moon */}
      <circle cx="480" cy="45" r="28" fill="#2a3a5a" />
      <circle cx="492" cy="38" r="22" fill="#1a2a4a" />
      {/* Moon surface craters */}
      <circle cx="472" cy="55" r="4" fill="#1e2e50" opacity="0.5" />
      <circle cx="488" cy="48" r="3" fill="#1e2e50" opacity="0.4" />

      {/* Clouds */}
      <g transform={`translate(${cloudX1}, 55)`} opacity="0.4">
        <ellipse cx="60" cy="0" rx="42" ry="16" fill="#2a3a5a" />
        <ellipse cx="88" cy="-5" rx="30" ry="14" fill="#2a3a5a" />
        <ellipse cx="34" cy="-4" rx="25" ry="12" fill="#2a3a5a" />
      </g>
      <g transform={`translate(${cloudX2}, 85)`} opacity="0.3">
        <ellipse cx="55" cy="0" rx="35" ry="13" fill="#1e2e4a" />
        <ellipse cx="78" cy="-5" rx="24" ry="11" fill="#1e2e4a" />
      </g>

      {/* Ocean */}
      <rect x="0" y="190" width="560" height="110" fill="url(#sOcean)" />

      {/* Wave layers */}
      {[0, 1, 2].map(layer => {
        const wY = 194 + layer * 26;
        const points = Array.from({ length: 57 }, (_, x) =>
          `${x * 10},${wY + Math.sin(x * (0.08 + layer * 0.02) + frame * 0.07 + layer * 1.2) * (9 - layer * 2)}`
        ).join(" L ");
        return (
          <path key={layer} d={`M0,${wY} L${points} L560,${wY} L560,300 L0,300 Z`}
            fill={`rgba(8,${48 - layer * 12},${96 - layer * 20},${0.5 + layer * 0.2})`} />
        );
      })}

      {/* Wave highlights */}
      {[196, 222, 248].map((y, i) => (
        <path key={i} d={`M${30 + i * 60},${y + Math.sin(frame * 0.07 + i) * 5} Q${90 + i * 60},${y - 7 + Math.sin(frame * 0.07 + i) * 5} ${150 + i * 60},${y + Math.sin(frame * 0.07 + i) * 5}`}
          stroke="rgba(100,180,255,0.2)" strokeWidth="2" fill="none" />
      ))}

      {/* Ship moving */}
      <g transform={`translate(${shipX}, ${bob})`}>
        {/* Hull */}
        <path d="M0,168 L320,168 L336,190 L-16,190 Z" fill="#1a2a4a" />
        <path d="-16,190 L336,190 L316,205 L4,205 Z" fill="#CC0000" />
        <rect x="-14" y="196" width="348" height="4" fill="white" opacity="0.8" />
        {/* Deck */}
        <rect x="20" y="140" width="280" height="30" rx="3" fill="#2a3a5a" />
        {/* Containers */}
        <rect x="35" y="102" width="68" height="40" rx="3" fill="#CC0000" />
        <rect x="35" y="102" width="68" height="14" rx="3" fill="#FF3333" />
        <rect x="111" y="96" width="68" height="46" rx="3" fill="#1a6a1a" />
        <rect x="111" y="96" width="68" height="15" rx="3" fill="#2a8a2a" />
        <rect x="187" y="104" width="68" height="38" rx="3" fill="#1a3a8a" />
        <rect x="187" y="104" width="68" height="14" rx="3" fill="#2a4aaa" />
        <rect x="263" y="94" width="55" height="48" rx="3" fill="#8a5a00" />
        {/* Bridge */}
        <rect x="112" y="62" width="112" height="80" rx="5" fill="#1e3060" />
        <rect x="124" y="70" width="42" height="35" rx="3" fill="#0a2040" stroke="#00E5FF" strokeWidth="1" />
        <rect x="178" y="70" width="34" height="35" rx="3" fill="#FFD700" opacity="0.5" />
        {/* Smokestack */}
        <rect x="155" y="28" width="26" height="38" rx="4" fill="#333" />
        {[0, 1, 2].map(i => (
          <circle key={i}
            cx={163 + Math.sin(frame * 0.08 + i * 1.3) * 6}
            cy={22 - i * 14 + smoke * (i + 1) * 0.4}
            r={7 + i * 3} fill="#888" opacity={0.28 - i * 0.07} />
        ))}
        {/* Mast */}
        <line x1="168" y1="0" x2="168" y2="32" stroke="#aaa" strokeWidth="2.5" />
        <line x1="140" y1="12" x2="196" y2="12" stroke="#aaa" strokeWidth="1.5" />
        <path d="M168,0 L190,5 L168,12 Z" fill="#00E5FF" />
        {/* Wake */}
        {[1, 2, 3].map(i => (
          <path key={i}
            d={`M${-i * 22},${194 + Math.sin(frame * 0.1 + i) * 3} Q${-i * 12},${200} ${-i * 40},194`}
            stroke={`rgba(120,200,255,${0.25 - i * 0.06})`} strokeWidth={3.5 - i} fill="none" />
        ))}
      </g>
    </svg>
  );
};
