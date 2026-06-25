import { useCurrentFrame, interpolate } from "remotion";

export const WarehouseSVG: React.FC<{ width?: number; height?: number }> = ({
  width = 560, height = 380,
}) => {
  const frame = useCurrentFrame();
  // Conveyor belt animation
  const beltOffset = (frame * 2) % 40;
  // Worker arm wave
  const armAngle = Math.sin(frame * 0.12) * 15;
  // Forklift position
  const forkX = interpolate(frame % 120, [0, 60, 120], [80, 360, 80], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Check stamp bounce
  const stampY = interpolate(frame, [60, 68, 75], [0, 20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <svg width={width} height={height} viewBox="0 0 560 380" style={{ display: "block" }}>
      <defs>
        <linearGradient id="whFloor" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0D1E3A" />
          <stop offset="100%" stopColor="#07111F" />
        </linearGradient>
        <linearGradient id="whWall" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0D1E3A" />
          <stop offset="100%" stopColor="#1a2e4a" />
        </linearGradient>
        <linearGradient id="skylight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
        </linearGradient>
        <filter id="whGlow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background walls */}
      <rect width="560" height="380" fill="url(#whWall)" rx="12" />

      {/* Ceiling skylights */}
      {[80, 200, 340, 460].map((x, i) => (
        <g key={i}>
          <rect x={x - 25} y="0" width="50" height="40" fill="url(#skylight)" />
          <line x1={x - 25} y1="0" x2={x + 25} y2="0" stroke="#00E5FF" strokeWidth="2" opacity="0.4" />
        </g>
      ))}

      {/* Floor */}
      <rect x="0" y="300" width="560" height="80" fill="url(#whFloor)" />
      {/* Floor lines */}
      {[80, 200, 340, 460].map((x, i) => (
        <line key={i} x1={x} y1="300" x2={x} y2="380" stroke="#1a3060" strokeWidth="1" />
      ))}
      {/* Yellow safety lines */}
      <line x1="0" y1="300" x2="560" y2="300" stroke="#FFD700" strokeWidth="2" strokeDasharray="20 10" opacity="0.6" />

      {/* Back shelving units */}
      {[30, 150, 270, 390].map((x, si) => (
        <g key={si}>
          <rect x={x} y="50" width="110" height="240" rx="2" fill="#0a1830" stroke="#1a3060" strokeWidth="1.5" />
          {/* Shelf planks */}
          {[90, 140, 190, 240].map((y, pi) => (
            <rect key={pi} x={x} y={y} width="110" height="8" fill="#1e2e50" />
          ))}
          {/* Boxes on shelves */}
          {[90, 140, 190].map((y, bi) => (
            <g key={bi}>
              <rect x={x + 8} y={y - 35} width="28" height="30" rx="2" fill={["#c8a060", "#8B6914", "#d4aa6a"][bi % 3]} />
              <rect x={x + 44} y={y - 28} width="24" height="23" rx="2" fill={["#8B6914", "#c8a060", "#a07840"][bi % 3]} />
              <rect x={x + 76} y={y - 32} width="26" height="27" rx="2" fill={["#d4aa6a", "#8B6914", "#c8a060"][bi % 3]} />
            </g>
          ))}
        </g>
      ))}

      {/* Conveyor belt */}
      <g>
        <rect x="120" y="270" width="320" height="28" rx="6" fill="#1a1a1a" />
        {/* Belt stripes animated */}
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={120 + ((i * 30 + beltOffset) % 320)} y="270" width="18" height="28"
            rx="0" fill="#222" opacity="0.8" />
        ))}
        <rect x="120" y="270" width="320" height="28" rx="6" fill="none" stroke="#333" strokeWidth="2" />
        {/* Belt rollers */}
        <circle cx="125" cy="284" r="10" fill="#2a2a2a" stroke="#444" strokeWidth="2" />
        <circle cx="435" cy="284" r="10" fill="#2a2a2a" stroke="#444" strokeWidth="2" />
        {/* Box on belt */}
        <rect x="240" y="248" width="40" height="36" rx="3" fill="#c8a060" />
        <rect x="244" y="252" width="32" height="8" rx="2" fill="#e8d070" opacity="0.7" />
      </g>

      {/* Forklift */}
      <g transform={`translate(${forkX}, 230)`}>
        {/* Body */}
        <rect x="0" y="0" width="60" height="50" rx="4" fill="#FFD700" />
        <rect x="5" y="5" width="28" height="25" rx="3" fill="#1a2a00" opacity="0.7" />
        {/* Forks */}
        <rect x="-20" y="35" width="18" height="5" rx="2" fill="#888" />
        <rect x="-20" y="44" width="18" height="5" rx="2" fill="#888" />
        {/* Mast */}
        <rect x="-5" y="-30" width="8" height="40" rx="2" fill="#aaa" />
        {/* Wheels */}
        <circle cx="12" cy="52" r="8" fill="#222" stroke="#555" strokeWidth="2" />
        <circle cx="48" cy="52" r="8" fill="#222" stroke="#555" strokeWidth="2" />
      </g>

      {/* Worker silhouette */}
      <g transform="translate(470, 200)">
        {/* Body */}
        <ellipse cx="30" cy="90" rx="28" ry="18" fill="#1a3060" />
        <rect x="16" y="55" width="28" height="45" rx="4" fill="#1e4080" />
        {/* Head */}
        <circle cx="30" cy="42" r="18" fill="#c8956c" />
        {/* Hard hat */}
        <ellipse cx="30" cy="28" rx="22" ry="10" fill="#FFD700" />
        <rect x="10" y="24" width="40" height="8" rx="2" fill="#FFD700" />
        {/* Arm with clipboard */}
        <g transform={`rotate(${armAngle}, 30, 60)`}>
          <rect x="42" y="55" width="8" height="30" rx="4" fill="#c8956c" />
          <rect x="46" y="75" width="28" height="38" rx="4" fill="#f0f0f0" />
          <rect x="50" y="80" width="20" height="3" rx="1" fill="#888" />
          <rect x="50" y="87" width="16" height="3" rx="1" fill="#888" />
          <rect x="50" y="94" width="18" height="3" rx="1" fill="#888" />
          <rect x="50" y="101" width="14" height="3" rx="1" fill="#888" />
        </g>
      </g>

      {/* Quality CHECK stamp */}
      <g transform={`translate(350, ${220 + stampY})`} filter="url(#whGlow)">
        <circle cx="40" cy="40" r="38" fill="none" stroke="#00C853" strokeWidth="4" />
        <text x="40" y="36" textAnchor="middle" fontSize="18" fill="#00C853" fontWeight="900">✓</text>
        <text x="40" y="52" textAnchor="middle" fontSize="10" fill="#00C853" fontWeight="bold">PASSED</text>
      </g>

      {/* Light beam from above */}
      <path d="M280,0 L240,300 L320,300 Z" fill="#00E5FF" opacity="0.03" />
    </svg>
  );
};
