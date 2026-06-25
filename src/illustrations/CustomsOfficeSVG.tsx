import { useCurrentFrame, interpolate } from "remotion";

export const CustomsOfficeSVG: React.FC<{ width?: number; height?: number }> = ({
  width = 460, height = 360,
}) => {
  const frame = useCurrentFrame();
  const stampY = interpolate(frame % 60, [0, 20, 30, 60], [0, 30, 20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stampOp = interpolate(frame % 60, [25, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const docSlide = interpolate(frame, [0, 40], [-200, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const screenGlow = 0.7 + Math.sin(frame * 0.1) * 0.2;

  return (
    <svg width={width} height={height} viewBox="0 0 460 360" style={{ display: "block" }}>
      <defs>
        <linearGradient id="roomGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a2a3a" />
          <stop offset="100%" stopColor="#0d1826" />
        </linearGradient>
        <linearGradient id="deskGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3a2a1a" />
          <stop offset="100%" stopColor="#2a1a0a" />
        </linearGradient>
        <radialGradient id="lampLight" cx="50%" cy="20%" r="50%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </radialGradient>
        <filter id="stamp">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Room */}
      <rect width="460" height="360" fill="url(#roomGrad)" rx="12" />
      <rect width="460" height="360" fill="url(#lampLight)" rx="12" />

      {/* Back wall panel */}
      <rect x="20" y="20" width="420" height="190" rx="8" fill="#0D1526" stroke="#1a2a3a" strokeWidth="1.5" />

      {/* Bangladesh flag on wall */}
      <g transform="translate(30, 30)">
        <rect x="0" y="0" width="72" height="48" fill="#006633" rx="3" />
        <circle cx="34" cy="24" r="16" fill="#FF2D2D" />
        {/* Wave animation via transform */}
        <rect x="72" y="0" width="6" height="48" fill="#8B6914" />
      </g>

      {/* Bangladesh map silhouette subtle */}
      <path d="M350,30 L370,35 L375,55 L365,70 L355,80 L340,75 L330,60 L335,42 Z"
        fill="#006633" opacity="0.15" />

      {/* Screen / monitor */}
      <rect x="140" y="40" width="180" height="120" rx="6" fill="#0a0a1a" stroke="#1a3060" strokeWidth="2" />
      <rect x="144" y="44" width="172" height="112" rx="4" fill={`rgba(0,40,100,${screenGlow * 0.8})`} />
      {/* Screen content */}
      <text x="230" y="72" textAnchor="middle" fontSize="11" fill="#00E5FF" fontWeight="bold" opacity="0.9">CUSTOMS CLEARANCE</text>
      <text x="230" y="86" textAnchor="middle" fontSize="9" fill="#A0C4FF" opacity="0.7">শিপমেন্ট আইডি: CN-2024-7821</text>
      <rect x="154" y="94" width="152" height="4" rx="2" fill="#00E5FF" opacity="0.25" />
      <rect x="154" y="102" width="120" height="3" rx="1" fill="#A0C4FF" opacity="0.2" />
      <rect x="154" y="109" width="140" height="3" rx="1" fill="#A0C4FF" opacity="0.2" />
      <text x="230" y="135" textAnchor="middle" fontSize="12" fill="#00C853" fontWeight="bold" opacity="0.9">✓ CLEARED</text>
      {/* Monitor stand */}
      <rect x="218" y="160" width="24" height="22" rx="2" fill="#1a2a3a" />
      <rect x="204" y="180" width="52" height="8" rx="4" fill="#1a2a3a" />

      {/* Desk */}
      <rect x="0" y="210" width="460" height="80" fill="url(#deskGrad2)" />
      <rect x="0" y="208" width="460" height="8" rx="0" fill="#4a3a2a" />

      {/* Documents sliding in */}
      <g transform={`translate(${docSlide}, 0)`}>
        {/* Main document */}
        <rect x="60" y="215" width="170" height="70" rx="4" fill="#f5f0e8" />
        <rect x="60" y="215" width="170" height="22" rx="4" fill="#006633" />
        <text x="145" y="231" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">CUSTOMS DECLARATION</text>
        {[44, 55, 66].map((y, i) => (
          <rect key={i} x={72} y={y + 190} width={i % 2 === 0 ? 110 : 85} height="5" rx="2" fill="#334466" opacity="0.3" />
        ))}
        {/* Green cleared stamp on doc */}
        <g opacity={stampOp * 0.8}>
          <circle cx="185" cy="253" r="24" fill="none" stroke="#00C853" strokeWidth="3" />
          <text x="185" y="250" textAnchor="middle" fontSize="9" fill="#00C853" fontWeight="bold">CLEARED</text>
          <text x="185" y="262" textAnchor="middle" fontSize="7" fill="#00C853">✓ PASSED</text>
        </g>
      </g>

      {/* Rubber stamp in officer hand */}
      <g transform={`translate(280, ${180 + stampY})`}>
        <rect x="0" y="0" width="50" height="20" rx="5" fill="#8B4513" />
        <rect x="8" y="14" width="34" height="12" rx="3" fill="#CC0000" />
        <rect x="8" y="14" width="34" height="6" rx="2" fill="#FF2D2D" />
        {/* Handle */}
        <rect x="18" y="-20" width="14" height="25" rx="5" fill="#5a2a10" />
      </g>

      {/* Stamp mark on desk */}
      <g opacity={stampOp} filter="url(#stamp)">
        <circle cx="305" cy="240" r="26" fill="none" stroke="#CC0000" strokeWidth="3.5" />
        <text x="305" y="237" textAnchor="middle" fontSize="9" fill="#CC0000" fontWeight="bold">অনুমোদিত</text>
        <text x="305" y="249" textAnchor="middle" fontSize="8" fill="#CC0000">APPROVED</text>
      </g>

      {/* Officer silhouette */}
      <g transform="translate(340, 80)">
        <circle cx="40" cy="32" r="22" fill="#c8956c" />
        <ellipse cx="40" cy="38" rx="24" ry="6" fill="#1a2a3a" />
        <rect x="18" y="34" width="44" height="50" rx="6" fill="#1e3a6a" />
        <rect x="18" y="34" width="44" height="14" rx="6" fill="#2a4a8a" />
        {/* Uniform details */}
        <rect x="30" y="38" width="20" height="30" rx="2" fill="#2a4a8a" opacity="0.5" />
        {/* Officer cap */}
        <ellipse cx="40" cy="14" rx="25" ry="9" fill="#1e3060" />
        <rect x="17" y="10" width="46" height="8" rx="3" fill="#1e3060" />
        <rect x="25" y="4" width="30" height="10" rx="3" fill="#1a2a5a" />
        {/* Badge */}
        <rect x="25" y="40" width="14" height="10" rx="2" fill="#FFD700" />
        <text x="32" y="48" textAnchor="middle" fontSize="5" fill="#1a1a1a">NBR</text>
      </g>

      {/* Lamp */}
      <g>
        <line x1="400" y1="0" x2="380" y2="60" stroke="#666" strokeWidth="4" />
        <ellipse cx="380" cy="66" rx="30" ry="10" fill="#888" />
        <ellipse cx="380" cy="68" rx="26" ry="8" fill="#FFD700" opacity="0.7" />
      </g>
    </svg>
  );
};
