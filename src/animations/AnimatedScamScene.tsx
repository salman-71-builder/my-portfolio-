import { useCurrentFrame, interpolate } from "remotion";
import { C } from "../constants/colors";

export const AnimatedScamScene: React.FC<{ width?: number; height?: number }> = ({
  width = 460, height = 360,
}) => {
  const frame = useCurrentFrame();
  const shake = Math.sin(frame * 0.7) * 5;
  const lidOpen = interpolate(frame, [0, 30], [0, -60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const crack1 = interpolate(frame, [25, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const crack2 = interpolate(frame, [35, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Red cracks appear one by one
  const crackPaths = [
    "M145,245 L158,260 L150,275 L168,290",
    "M235,250 L248,265 L240,280 L258,295",
    "M190,235 L195,252 L188,260",
  ];
  const crackOps = [crack1, crack2, interpolate(frame, [42, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })];
  // Explosion particles
  const xOp = interpolate(frame, [40, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const redGlow = 0.25 + Math.sin(frame * 0.14) * 0.12;

  return (
    <svg width={width} height={height} viewBox="0 0 460 360" style={{ display: "block" }}>
      <defs>
        <radialGradient id="scamBg" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#8B0000" stopOpacity={redGlow} />
          <stop offset="100%" stopColor="#0D1526" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="floorShadow" cx="50%" cy="95%" r="40%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <filter id="scamGlow">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="460" height="360" fill="#0D1526" rx="12" />
      <rect width="460" height="360" fill="url(#scamBg)" rx="12" />

      {/* Floor shadow */}
      <ellipse cx="230" cy="350" rx="140" ry="18" fill="#000" opacity="0.5" />

      {/* Box shaking */}
      <g transform={`translate(${shake}, 0)`}>
        {/* Box body */}
        <rect x="110" y="200" width="240" height="150" rx="6" fill="#c8a060" />
        <rect x="110" y="280" width="240" height="70" rx="0" fill="#a07840" opacity="0.4" />
        {/* Box tape */}
        <rect x="150" y="220" width="160" height="14" rx="3" fill="#e8d070" opacity="0.75" />
        <text x="230" y="232" textAnchor="middle" fontSize="10" fill="#8B6914" fontWeight="bold">FRAGILE ⚠</text>
        {/* Cardboard edge detail */}
        <line x1="230" y1="200" x2="230" y2="350" stroke="#8B6914" strokeWidth="2" opacity="0.3" />

        {/* Crack lines on box */}
        {crackPaths.map((d, i) => (
          <path key={i} d={d} stroke="#5a3200" strokeWidth="3" fill="none"
            opacity={crackOps[i]} strokeLinecap="round" />
        ))}

        {/* Lid opening */}
        <g transform={`rotate(${lidOpen}, 230, 200)`}>
          <rect x="108" y="168" width="244" height="44" rx="5" fill="#d4aa6a" />
          <rect x="148" y="180" width="164" height="12" rx="3" fill="#e8d070" opacity="0.6" />
          <line x1="230" y1="168" x2="230" y2="212" stroke="#8B6914" strokeWidth="2" opacity="0.4" />
        </g>

        {/* Broken items spilling */}
        {/* Cracked phone */}
        <g transform="translate(125, 185) rotate(-12)">
          <rect x="0" y="0" width="42" height="72" rx="5" fill="#2a2a3a" />
          <rect x="3" y="5" width="36" height="54" rx="3" fill="#1a1a2e" />
          <path d="M8,10 L32,40 M6,35 L28,12" stroke={C.red} strokeWidth="2.5" opacity={crack1} />
        </g>
        {/* Wrong package label */}
        <g transform="translate(250, 176) rotate(8)">
          <rect x="0" y="0" width="55" height="42" rx="5" fill="#f5f0e8" />
          <text x="27" y="14" textAnchor="middle" fontSize="8" fill="#333" fontWeight="bold">আদেশ: ৫০ পিস</text>
          <text x="27" y="26" textAnchor="middle" fontSize="9" fill={C.red} fontWeight="bold">পাওয়া: ৩ পিস</text>
          <text x="27" y="38" textAnchor="middle" fontSize="8" fill="#CC0000">ভুল পণ্য! ❌</text>
        </g>
        {/* Broken vase */}
        <g transform="translate(185, 170)">
          <path d="M20,0 Q38,5 40,30 Q40,50 20,55 Q0,50 0,30 Q2,5 20,0 Z" fill="#7a5a2a" />
          <path d="M8,18 L12,48 M28,16 L32,48" stroke="#5a3200" strokeWidth="2.5" opacity={crack2} />
          <path d="M5,32 L35,32" stroke="#5a3200" strokeWidth="2" opacity={crack2} />
        </g>
      </g>

      {/* Big red X */}
      <g opacity={xOp} filter="url(#scamGlow)">
        <line x1="95" y1="145" x2="365" y2="355" stroke={C.red} strokeWidth="20" strokeLinecap="round" />
        <line x1="365" y1="145" x2="95" y2="355" stroke={C.red} strokeWidth="20" strokeLinecap="round" />
        <line x1="95" y1="145" x2="365" y2="355" stroke="#FF8080" strokeWidth="6" strokeLinecap="round" />
        <line x1="365" y1="145" x2="95" y2="355" stroke="#FF8080" strokeWidth="6" strokeLinecap="round" />
      </g>

      {/* Warning badge */}
      <g opacity={xOp}>
        <rect x="155" y="40" width="150" height="58" rx="10" fill="#CC0000" />
        <text x="230" y="64" textAnchor="middle" fontSize="15" fill="white" fontWeight="900">⚠ প্রতারণা!</text>
        <text x="230" y="84" textAnchor="middle" fontSize="10" fill="#FFcccc">ভুল ও ভাঙা ডেলিভারি</text>
      </g>

      {/* Red particles burst */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const dist = (frame / 90) * 80;
        const px = 230 + Math.cos(angle) * dist;
        const py = 250 + Math.sin(angle) * dist;
        return (
          <circle key={i} cx={px} cy={py} r={4 + i % 3}
            fill={i % 2 === 0 ? C.red : "#FF6666"}
            opacity={xOp * Math.max(0, 1 - frame / 90)} />
        );
      })}
    </svg>
  );
};
