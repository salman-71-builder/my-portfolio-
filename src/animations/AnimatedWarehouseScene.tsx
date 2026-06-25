import { useCurrentFrame, interpolate } from "remotion";
import { C } from "../constants/colors";

export const AnimatedWarehouseScene: React.FC<{ width?: number; height?: number }> = ({
  width = 520, height = 360,
}) => {
  const frame = useCurrentFrame();
  // Conveyor box moves
  const boxX = interpolate(frame % 100, [0, 100], [80, 440], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Belt animation
  const beltAnim = (frame * 2.5) % 40;
  // Worker arm check
  const armSwing = Math.sin(frame * 0.14) * 20;
  // Check stamp
  const checkScale = interpolate(frame % 70, [20, 30, 38], [0, 1.4, 1.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const checkOp = interpolate(frame % 70, [20, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Forklift move
  const forkX = 80 + (frame * 1.2) % 280;

  return (
    <svg width={width} height={height} viewBox="0 0 520 360" style={{ display: "block" }}>
      <defs>
        <linearGradient id="wFloor2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0D1E3A" />
          <stop offset="100%" stopColor="#06101E" />
        </linearGradient>
        <radialGradient id="wLight2" cx="50%" cy="10%" r="50%">
          <stop offset="0%" stopColor={C.cyan} stopOpacity="0.07" />
          <stop offset="100%" stopColor={C.cyan} stopOpacity="0" />
        </radialGradient>
        <filter id="wGlow2">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="520" height="360" fill="#0A1020" rx="12" />
      <rect width="520" height="360" fill="url(#wLight2)" rx="12" />

      {/* Ceiling beams */}
      {[60, 200, 340, 460].map((x, i) => (
        <g key={i}>
          <rect x={x - 4} y="0" width="8" height="80" fill="#1a2a3a" />
          <rect x={x - 30} y="75" width="60" height="6" fill="#1a2a3a" />
          <rect x={x - 2} y="75" width="4" height="30" fill="#FFD700" opacity="0.4" />
        </g>
      ))}

      {/* Back shelving */}
      {[20, 150, 290, 390].map((x, si) => (
        <g key={si}>
          <rect x={x} y="30" width="120" height="220" rx="2" fill="#0a1830" stroke="#1a2a4a" strokeWidth="1.5" />
          {[70, 115, 160, 200].map((y, pi) => (
            <rect key={pi} x={x} y={y} width="120" height="7" fill="#1e2e50" />
          ))}
          {[70, 115, 160].map((y, bi) => (
            <g key={bi}>
              <rect x={x + 6} y={y - 32} width="30" height="28" rx="2" fill={["#c8a060","#8B6914","#d4aa6a"][bi % 3]} />
              <rect x={x + 44} y={y - 26} width="26" height="22" rx="2" fill={["#8B6914","#c8a060","#a07840"][bi % 3]} />
              <rect x={x + 78} y={y - 30} width="30" height="26" rx="2" fill={["#d4aa6a","#8B6914","#c8a060"][bi % 3]} />
            </g>
          ))}
        </g>
      ))}

      {/* Floor */}
      <rect x="0" y="270" width="520" height="90" fill="url(#wFloor2)" />
      <line x1="0" y1="270" x2="520" y2="270" stroke="#FFD700" strokeWidth="2" strokeDasharray="20 10" opacity="0.5" />

      {/* Conveyor belt */}
      <rect x="60" y="248" width="400" height="26" rx="7" fill="#1a1a1a" />
      {Array.from({ length: 15 }, (_, i) => (
        <rect key={i} x={60 + ((i * 28 + beltAnim) % 400)} y="248" width="16" height="26"
          fill="#222" opacity="0.7" rx="1" />
      ))}
      <rect x="60" y="248" width="400" height="26" rx="7" fill="none" stroke="#333" strokeWidth="2" />
      <circle cx="65" cy="261" r="11" fill="#2a2a2a" stroke="#444" strokeWidth="2" />
      <circle cx="455" cy="261" r="11" fill="#2a2a2a" stroke="#444" strokeWidth="2" />

      {/* Moving box */}
      <g transform={`translate(${boxX - 20}, 0)`}>
        <rect x="0" y="226" width="40" height="36" rx="3" fill="#c8a060" />
        <rect x="4" y="230" width="32" height="8" rx="2" fill="#e8d070" opacity="0.7" />
        <text x="20" y="254" textAnchor="middle" fontSize="7" fill="#8B6914">QC</text>
      </g>

      {/* Forklift */}
      <g transform={`translate(${forkX}, 235)`}>
        <rect x="0" y="0" width="55" height="45" rx="4" fill="#FFD700" />
        <rect x="5" y="5" width="24" height="22" rx="3" fill="#1a2000" opacity="0.7" />
        <rect x="-16" y="30" width="14" height="5" rx="2" fill="#888" />
        <rect x="-16" y="38" width="14" height="5" rx="2" fill="#888" />
        <rect x="-3" y="-22" width="7" height="35" rx="2" fill="#aaa" />
        <circle cx="10" cy="47" r="7" fill="#222" stroke="#555" strokeWidth="1.5" />
        <circle cx="45" cy="47" r="7" fill="#222" stroke="#555" strokeWidth="1.5" />
      </g>

      {/* Worker */}
      <g transform="translate(380, 175)">
        <ellipse cx="35" cy="85" rx="28" ry="16" fill="#1a2a4a" />
        <rect x="20" y="50" width="30" height="40" rx="4" fill="#1e4080" />
        <circle cx="35" cy="36" r="18" fill="#c8956c" />
        <ellipse cx="35" cy="24" rx="20" ry="8" fill="#FFD700" />
        <rect x="17" y="20" width="36" height="8" rx="2" fill="#FFD700" />
        {/* Arm with clipboard — swinging */}
        <g transform={`rotate(${armSwing}, 45, 55)`}>
          <rect x="45" y="50" width="8" height="26" rx="4" fill="#c8956c" />
          <rect x="49" y="68" width="32" height="42" rx="4" fill="#f0f0f0" />
          <rect x="53" y="74" width="22" height="3" rx="1" fill="#888" />
          <rect x="53" y="81" width="18" height="3" rx="1" fill="#888" />
          <rect x="53" y="88" width="20" height="3" rx="1" fill="#888" />
        </g>
        {/* Badge */}
        <rect x="22" y="55" width="14" height="10" rx="2" fill={C.cyan} />
        <text x="29" y="63" textAnchor="middle" fontSize="5" fill="#000" fontWeight="bold">QC</text>
      </g>

      {/* Quality CHECK stamp */}
      <g transform={`translate(${boxX - 5}, 210) scale(${checkScale})`}
        opacity={checkOp} style={{ transformOrigin: "20px 20px" }} filter="url(#wGlow2)">
        <circle cx="20" cy="20" r="22" fill="none" stroke={C.green} strokeWidth="3.5" />
        <text x="20" y="16" textAnchor="middle" fontSize="16" fill={C.green} fontWeight="900">✓</text>
        <text x="20" y="30" textAnchor="middle" fontSize="8" fill={C.green} fontWeight="bold">PASSED</text>
      </g>
    </svg>
  );
};
