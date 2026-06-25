import { useCurrentFrame, interpolate } from "remotion";
import { C } from "../constants/colors";

export const AnimatedBankScene: React.FC<{ width?: number; height?: number }> = ({
  width = 500, height = 360,
}) => {
  const frame = useCurrentFrame();
  // Doc slides in from left
  const docX = interpolate(frame, [0, 25], [-250, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Pen writes signature
  const sigProgress = interpolate(frame, [30, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sigLen = sigProgress * 130;
  const penX = 200 + sigProgress * 130;
  const penY = 250 - Math.sin(sigProgress * Math.PI * 5) * 6;
  // Stamp
  const stampY2 = interpolate(frame % 80, [0, 28, 36], [0, 36, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stampInkOp = interpolate(frame % 80, [32, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // LC text typing
  const lcText = "পরিমাণ: ৳৮,৫০,০০০";
  const lcChars = Math.floor(interpolate(frame, [15, 50], [0, lcText.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const deskFloat = Math.sin(frame * 0.05) * 1.5;

  return (
    <svg width={width} height={height} viewBox="0 0 500 360" style={{ display: "block" }}>
      <defs>
        <linearGradient id="bankDesk" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2e2010" />
          <stop offset="100%" stopColor="#1a1008" />
        </linearGradient>
        <radialGradient id="bankLight" cx="50%" cy="20%" r="55%">
          <stop offset="0%" stopColor="#c8a060" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#c8a060" stopOpacity="0" />
        </radialGradient>
        <filter id="bankGlow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Room */}
      <rect width="500" height="360" fill="#0D1526" rx="12" />
      <rect width="500" height="360" fill="url(#bankLight)" rx="12" />

      {/* Bank banner */}
      <rect x="80" y="15" width="340" height="40" rx="6" fill="#1e3060" />
      <text x="250" y="40" textAnchor="middle" fontSize="14" fill={C.cyan} fontWeight="bold">সোনালী ব্যাংক লিমিটেড</text>

      {/* Desk surface */}
      <rect x="0" y="210" width="500" height="150" fill="url(#bankDesk)" />
      <rect x="0" y="208" width="500" height="10" rx="0" fill="#4a3020" />
      <rect width="500" height="360" fill="url(#bankLight)" />

      {/* Main LC document sliding in */}
      <g transform={`translate(${docX}, ${deskFloat})`}>
        <rect x="80" y="215" width="200" height="135" rx="5" fill="#f5f0e8"
          style={{ filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.5))" }} />
        {/* LC header */}
        <rect x="80" y="215" width="200" height="30" rx="5" fill="#1e3060" />
        <text x="180" y="235" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">LETTER OF CREDIT</text>
        {/* LC fields */}
        {[58, 72, 86, 100].map((y, i) => (
          <rect key={i} x={96} y={y + 190} width={i % 2 === 0 ? 140 : 100} height="6" rx="2"
            fill="#334466" opacity="0.3" />
        ))}
        {/* Amount */}
        <text x="180" y="310" textAnchor="middle" fontSize="10" fill={C.cyan} fontWeight="bold">
          {lcText.slice(0, lcChars)}
          {lcChars < lcText.length && <tspan fill={C.cyan} opacity="0.7">|</tspan>}
        </text>
        {/* Signature line */}
        <line x1="96" y1="340" x2="270" y2="340" stroke="#999" strokeWidth="1" />
        <text x="180" y="350" textAnchor="middle" fontSize="8" fill="#666">স্বাক্ষর</text>
      </g>

      {/* Signature being drawn */}
      <path
        d="M200,340 C215,332 225,348 238,340 C250,332 258,344 268,338 C280,330 285,342 330,340"
        stroke="#1a1a8a" strokeWidth="2.5" fill="none" strokeLinecap="round"
        strokeDasharray="130" strokeDashoffset={130 - sigLen}
        transform={`translate(0, ${deskFloat})`} />

      {/* Pen */}
      <g transform={`translate(${penX - 50}, ${penY - 8}) rotate(-38) translate(0, ${deskFloat})`}>
        <rect x="0" y="0" width="75" height="10" rx="4" fill="#2a2020" />
        <rect x="55" y="1" width="20" height="8" rx="2" fill="#c8a060" />
        <polygon points="75,2 75,8 88,5" fill="#c0c0c0" />
        <circle cx="88" cy="5" r="2" fill="#1a1a8a" />
      </g>

      {/* Rubber stamp */}
      <g transform={`translate(320, ${175 + stampY2}) translate(0, ${deskFloat})`}>
        <rect x="0" y="0" width="55" height="22" rx="6" fill="#8B4513" />
        <rect x="8" y="15" width="39" height="14" rx="3" fill="#CC0000" />
        <rect x="21" y="-22" width="13" height="28" rx="5" fill="#5a2a10" />
      </g>

      {/* Stamp ink mark */}
      <g opacity={stampInkOp} transform={`translate(0, ${deskFloat})`} filter="url(#bankGlow)">
        <circle cx="347" cy="230" r="30" fill="none" stroke="#CC0000" strokeWidth="3" />
        <text x="347" y="228" textAnchor="middle" fontSize="10" fill="#CC0000" fontWeight="bold">অনুমোদিত</text>
        <text x="347" y="242" textAnchor="middle" fontSize="9" fill="#CC0000">APPROVED ✓</text>
      </g>

      {/* Secondary document */}
      <g transform={`translate(${docX * 0.7 + 50}, 5) rotate(6, 400, 280) translate(0, ${deskFloat})`}>
        <rect x="320" y="220" width="160" height="120" rx="5" fill="#fff8e8"
          style={{ filter: "drop-shadow(2px 3px 6px rgba(0,0,0,0.4))" }} />
        <rect x="320" y="220" width="160" height="25" rx="5" fill="#006633" />
        <text x="400" y="238" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">PURCHASE ORDER</text>
        {[50, 65, 80, 95].map((y, i) => (
          <rect key={i} x={336} y={y + 194} width={i % 2 === 0 ? 110 : 80} height="5" rx="2" fill="#334466" opacity="0.25" />
        ))}
      </g>

      {/* Bank teller silhouette */}
      <g transform="translate(0, -10)">
        <circle cx="430" cy="105" r="28" fill="#c8956c" />
        <ellipse cx="430" cy="118" rx="24" ry="6" fill="#1a2a3a" />
        <rect x="406" y="112" width="48" height="55" rx="6" fill="#1e3a6a" />
        <rect x="406" y="112" width="48" height="16" rx="6" fill="#2a4a8a" />
        <ellipse cx="430" cy="90" rx="27" ry="11" fill="#1e3060" />
        <rect x="405" y="86" width="50" height="9" rx="3" fill="#1e3060" />
      </g>
    </svg>
  );
};
