import { useCurrentFrame } from "remotion";

export const HappyEntrepreneurSVG: React.FC<{ width?: number; height?: number }> = ({
  width = 380, height = 500,
}) => {
  const frame = useCurrentFrame();
  const float = Math.sin(frame * 0.06) * 6;
  const auraScale = 1 + Math.sin(frame * 0.1) * 0.04;
  const auraOp = 0.3 + Math.sin(frame * 0.1) * 0.12;
  const thumbUp = Math.sin(frame * 0.15) * 5;
  const smile = 278 + Math.sin(frame * 0.08) * 2;
  const badgeGlow = 12 + Math.sin(frame * 0.14) * 6;

  return (
    <svg width={width} height={height} viewBox="0 0 380 500" style={{ display: "block" }}>
      <defs>
        <radialGradient id="auraBg" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#00E5FF" stopOpacity={auraOp} />
          <stop offset="60%" stopColor="#0088AA" stopOpacity={auraOp * 0.3} />
          <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="faceG2" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#d4a574" />
          <stop offset="100%" stopColor="#9a7040" />
        </radialGradient>
        <filter id="cyanGlow">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="380" height="500" fill="#0A0E1A" rx="18" />

      {/* Cyan aura rings */}
      {[1, 0.7, 0.4].map((scale, i) => (
        <ellipse key={i} cx="190" cy="220"
          rx={120 * scale * auraScale} ry={140 * scale * auraScale}
          fill="none" stroke="#00E5FF"
          strokeWidth={3 - i}
          opacity={auraOp * (1 - i * 0.25)}
          style={{ filter: "blur(2px)" }} />
      ))}
      <ellipse cx="190" cy="220" rx="130" ry="150" fill="url(#auraBg)" />

      {/* Body */}
      <g transform={`translate(0, ${float})`}>
        {/* Legs */}
        <rect x="155" y="400" width="28" height="80" rx="8" fill="#1e3060" />
        <rect x="197" y="400" width="28" height="80" rx="8" fill="#1e3060" />
        {/* Shoes */}
        <ellipse cx="169" cy="480" rx="22" ry="9" fill="#1a1a2a" />
        <ellipse cx="211" cy="480" rx="22" ry="9" fill="#1a1a2a" />

        {/* Suit body */}
        <path d="M100,310 Q130,295 190,295 Q250,295 280,310 L290,420 L90,420 Z" fill="#1e3060" />
        {/* Jacket lapels */}
        <path d="M190,295 L165,320 L175,380 Z" fill="#162550" />
        <path d="M190,295 L215,320 L205,380 Z" fill="#162550" />
        {/* Shirt */}
        <path d="M175,296 L205,296 L200,420 L180,420 Z" fill="#f8f8f8" />
        {/* Tie — cyan */}
        <polygon points="187,298 203,298 198,380 190,398 182,380" fill="#00E5FF" />
        <polygon points="187,298 203,298 198,314 190,320 182,314" fill="#00B4D8" />

        {/* Arms */}
        {/* Left arm crossed */}
        <path d="M100,320 Q85,350 100,375 Q120,380 150,370" stroke="#1e3060" strokeWidth="28" fill="none" strokeLinecap="round" />
        {/* Right arm raised — thumbs up */}
        <path d="M280,315 Q300,280 295,${250 + thumbUp} Q290,${230 + thumbUp} 275,${240 + thumbUp}"
          stroke="#1e3060" strokeWidth="26" fill="none" strokeLinecap="round" />
        {/* Hand / thumb */}
        <circle cx="278" cy={248 + thumbUp} r="16" fill="#c8956c" />
        {/* Thumb up shape */}
        <path d={`M268,${256 + thumbUp} Q265,${235 + thumbUp} 278,${228 + thumbUp} Q290,${226 + thumbUp} 292,${238 + thumbUp} L290,${256 + thumbUp} Z`}
          fill="#c8956c" />

        {/* Neck */}
        <rect x="178" y="270" width="24" height="30" rx="4" fill="#c8956c" />

        {/* Head */}
        <ellipse cx="190" cy="235" rx="70" ry="76" fill="url(#faceG2)" />

        {/* Hair */}
        <ellipse cx="190" cy="167" rx="71" ry="28" fill="#1a0800" />
        <ellipse cx="128" cy="192" rx="18" ry="38" fill="#1a0800" />
        <ellipse cx="252" cy="192" rx="18" ry="38" fill="#1a0800" />
        {/* Side part */}
        <path d="M170,168 Q185,162 190,168" stroke="#0a0400" strokeWidth="3" fill="none" />

        {/* Confident eyebrows */}
        <path d="M162,210 Q177,204 192,208" stroke="#1a0800" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M188,208 Q203,204 218,210" stroke="#1a0800" strokeWidth="4" fill="none" strokeLinecap="round" />

        {/* Confident eyes */}
        <ellipse cx="174" cy="228" rx="12" ry="13" fill="white" />
        <ellipse cx="206" cy="228" rx="12" ry="13" fill="white" />
        <circle cx="177" cy="230" r="7" fill="#1a0800" />
        <circle cx="209" cy="230" r="7" fill="#1a0800" />
        <circle cx="180" cy="227" r="2.5" fill="white" />
        <circle cx="212" cy="227" r="2.5" fill="white" />

        {/* Big confident smile */}
        <path d={`M172,255 Q190,${smile} 208,255`}
          stroke="#8B4513" strokeWidth="3" fill="#d07050" strokeLinecap="round" />
        <path d={`M174,255 Q190,${smile - 8} 206,255`}
          fill="white" stroke="none" opacity="0.8" />
        {/* Dimples */}
        <circle cx="162" cy="252" r="5" fill="#d4956c" opacity="0.4" />
        <circle cx="218" cy="252" r="5" fill="#d4956c" opacity="0.4" />
      </g>

      {/* ChinaCart badge on chest */}
      <g transform={`translate(0, ${float})`} filter="url(#cyanGlow)">
        <rect x="148" y="330" width="84" height="42" rx="8"
          fill="#0A0E1A" stroke="#00E5FF" strokeWidth="2"
          style={{ filter: `drop-shadow(0 0 ${badgeGlow}px #00E5FF)` }} />
        <text x="190" y="348" textAnchor="middle" fontSize="10" fill="#00E5FF" fontWeight="900">🛒 ChinaCart</text>
        <text x="190" y="362" textAnchor="middle" fontSize="8" fill="#A0C4FF">বিশ্বস্ত পার্টনার</text>
      </g>

      {/* Success stars */}
      {[40, 330, 20, 340, 340, 30].map((coord, i) => {
        const starOp = 0.5 + Math.sin(frame * 0.12 + i * 0.8) * 0.3;
        if (i % 2 !== 0) return null;
        const x = [40, 330, 15, 350, 60, 320][i];
        const y = [80, 70, 200, 180, 350, 360][i / 2];
        return <text key={i} x={x} y={y} fontSize="20" fill="#FFD700" opacity={starOp}>★</text>;
      })}
    </svg>
  );
};
