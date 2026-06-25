import { useCurrentFrame, interpolate } from "remotion";

export const BrokenDeliverySVG: React.FC<{ width?: number; height?: number }> = ({
  width = 420, height = 400,
}) => {
  const frame = useCurrentFrame();
  const shake = Math.sin(frame * 0.6) * (frame < 30 ? 4 : 1);
  const lidAngle = interpolate(frame, [0, 25], [0, -55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const crackOp1 = interpolate(frame, [20, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const crackOp2 = interpolate(frame, [28, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const xMarkOp = interpolate(frame, [35, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const redGlow = 0.3 + Math.sin(frame * 0.12) * 0.15;

  return (
    <svg width={width} height={height} viewBox="0 0 420 400" style={{ display: "block" }}>
      <defs>
        <radialGradient id="redBg" cx="50%" cy="60%" r="65%">
          <stop offset="0%" stopColor="#8B0000" stopOpacity={redGlow} />
          <stop offset="100%" stopColor="#0D1526" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="floorLight" cx="50%" cy="90%" r="40%">
          <stop offset="0%" stopColor="#FF2D2D" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#FF2D2D" stopOpacity="0" />
        </radialGradient>
        <filter id="redGlowFx">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="420" height="400" fill="#0D1526" rx="14" />
      <rect width="420" height="400" fill="url(#redBg)" rx="14" />
      <rect width="420" height="400" fill="url(#floorLight)" rx="14" />

      {/* Floor */}
      <ellipse cx="210" cy="370" rx="160" ry="22" fill="#1a0000" opacity="0.6" />

      {/* Box shadow */}
      <ellipse cx={210 + shake} cy="342" rx="100" ry="14" fill="#000" opacity="0.5" />

      {/* Main cardboard box body */}
      <g transform={`translate(${shake}, 0)`}>
        {/* Front face */}
        <rect x="110" y="200" width="200" height="140" rx="4" fill="#c8a060" />
        {/* Darker shade bottom */}
        <rect x="110" y="280" width="200" height="60" rx="0" fill="#a07840" opacity="0.5" />
        {/* Cardboard lines */}
        <line x1="210" y1="200" x2="210" y2="340" stroke="#8B6914" strokeWidth="2" opacity="0.4" />
        {/* Tape strip */}
        <rect x="150" y="220" width="120" height="12" rx="2" fill="#e8d070" opacity="0.7" />
        <text x="210" y="231" textAnchor="middle" fontSize="9" fill="#8B6914" fontWeight="bold">FRAGILE</text>

        {/* CRACK lines on box */}
        <g opacity={crackOp1}>
          <path d="M150,250 L165,265 L155,280 L175,295" stroke="#5a3a00" strokeWidth="3" fill="none" />
          <path d="M165,265 L180,260" stroke="#5a3a00" strokeWidth="2" fill="none" />
        </g>
        <g opacity={crackOp2}>
          <path d="M240,270 L255,285 L245,300 L265,315" stroke="#5a3a00" strokeWidth="3" fill="none" />
          <path d="M255,285 L270,280" stroke="#5a3a00" strokeWidth="2" fill="none" />
        </g>

        {/* Lid — opens */}
        <g transform={`rotate(${lidAngle}, 210, 200)`}>
          <rect x="108" y="168" width="204" height="40" rx="4" fill="#d4aa6a" />
          <line x1="210" y1="168" x2="210" y2="208" stroke="#8B6914" strokeWidth="2" opacity="0.5" />
          <rect x="148" y="180" width="124" height="10" rx="2" fill="#e8d070" opacity="0.6" />
        </g>

        {/* Broken items spilling out */}
        {/* Cracked phone screen */}
        <g transform={`translate(130, 185) rotate(-15)`}>
          <rect x="0" y="0" width="40" height="70" rx="5" fill="#333" />
          <rect x="3" y="5" width="34" height="52" rx="3" fill="#1a1a2e" />
          <path d="M10,10 L30,40 M8,35 L25,12" stroke="#FF2D2D" strokeWidth="2" opacity={crackOp1} />
        </g>
        {/* Wrong product label */}
        <g transform={`translate(245, 178) rotate(10)`}>
          <rect x="0" y="0" width="50" height="38" rx="4" fill="#f0f0f0" />
          <text x="25" y="14" textAnchor="middle" fontSize="7" fill="#333">বাংলাদেশ</text>
          <text x="25" y="24" textAnchor="middle" fontSize="6" fill="#CC0000" fontWeight="bold">ভুল পণ্য!</text>
          <text x="25" y="34" textAnchor="middle" fontSize="6" fill="#666">Qty: 0/50</text>
        </g>
        {/* Cracked vase/item */}
        <g transform="translate(185, 172)">
          <ellipse cx="20" cy="35" rx="20" ry="28" fill="#7a5a2a" />
          <path d="M8,20 L12,45 M28,18 L32,45 M5,30 L35,30" stroke="#5a3a00" strokeWidth="2" opacity={crackOp2} />
        </g>
      </g>

      {/* Big red X over box */}
      <g opacity={xMarkOp} filter="url(#redGlowFx)">
        <line x1="100" y1="150" x2="320" y2="360" stroke="#FF2D2D" strokeWidth="18" strokeLinecap="round" />
        <line x1="320" y1="150" x2="100" y2="360" stroke="#FF2D2D" strokeWidth="18" strokeLinecap="round" />
        <line x1="100" y1="150" x2="320" y2="360" stroke="#FF6666" strokeWidth="6" strokeLinecap="round" />
        <line x1="320" y1="150" x2="100" y2="360" stroke="#FF6666" strokeWidth="6" strokeLinecap="round" />
      </g>

      {/* Warning label */}
      <g opacity={xMarkOp}>
        <rect x="130" y="50" width="160" height="50" rx="8" fill="#CC0000" />
        <text x="210" y="72" textAnchor="middle" fontSize="14" fill="white" fontWeight="900">⚠ প্রতারণা!</text>
        <text x="210" y="90" textAnchor="middle" fontSize="10" fill="#FFcccc">ভুল ডেলিভারি</text>
      </g>
    </svg>
  );
};
