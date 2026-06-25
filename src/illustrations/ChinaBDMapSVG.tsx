import { useCurrentFrame, interpolate } from "remotion";

export const ChinaBDMapSVG: React.FC<{ width?: number; height?: number; startFrame?: number }> = ({
  width = 560, height = 320, startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - startFrame);
  const pathProgress = interpolate(localFrame, [0, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pathLen = 600;
  const chinaGlow = 0.4 + Math.sin(frame * 0.1) * 0.15;
  const bdGlow = 0.4 + Math.sin(frame * 0.1 + 1.2) * 0.15;
  const packageT = pathProgress;
  // Quadratic bezier: from (120,180) control (280,60) to (420,200)
  const px = 120 * (1 - packageT) ** 2 + 2 * 280 * (1 - packageT) * packageT + 420 * packageT ** 2;
  const py = 180 * (1 - packageT) ** 2 + 2 * 60 * (1 - packageT) * packageT + 200 * packageT ** 2;

  return (
    <svg width={width} height={height} viewBox="0 0 560 320" style={{ display: "block" }}>
      <defs>
        <radialGradient id="mapBg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#0D1E3A" />
          <stop offset="100%" stopColor="#060E1E" />
        </radialGradient>
        <radialGradient id="chinaGlowGrad" cx="30%" cy="55%" r="40%">
          <stop offset="0%" stopColor="#00E5FF" stopOpacity={chinaGlow} />
          <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bdGlowGrad" cx="72%" cy="58%" r="25%">
          <stop offset="0%" stopColor="#00C853" stopOpacity={bdGlow} />
          <stop offset="100%" stopColor="#00C853" stopOpacity="0" />
        </radialGradient>
        <filter id="mapGlow">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background ocean */}
      <rect width="560" height="320" fill="url(#mapBg)" rx="14" />
      {/* Grid lines */}
      {[40, 80, 120, 160, 200, 240, 280].map((y, i) => (
        <line key={i} x1="0" y1={y} x2="560" y2={y} stroke="#1a2a4a" strokeWidth="0.5" opacity="0.4" />
      ))}
      {[56, 112, 168, 224, 280, 336, 392, 448, 504].map((x, i) => (
        <line key={i} x1={x} y1="0" x2={x} y2="320" stroke="#1a2a4a" strokeWidth="0.5" opacity="0.4" />
      ))}

      {/* China landmass silhouette */}
      <path d="M30,80 L55,65 L90,60 L130,55 L160,60 L200,55 L240,68 L260,80 L255,100
               L280,110 L290,130 L270,150 L240,155 L220,175 L200,190 L175,185
               L150,200 L130,195 L110,210 L90,205 L60,195 L40,175 L25,150
               L30,120 Z"
        fill="#00E5FF" opacity="0.18" stroke="#00E5FF" strokeWidth="1.5" />
      <rect width="560" height="320" fill="url(#chinaGlowGrad)" />
      {/* China label */}
      <text x="140" y="138" textAnchor="middle" fontSize="14" fill="#00E5FF" fontWeight="bold" opacity="0.9">中国</text>
      <text x="140" y="158" textAnchor="middle" fontSize="10" fill="#00E5FF" opacity="0.7">চায়না</text>

      {/* Sea between */}
      <path d="M250,100 Q350,80 390,140 Q370,180 340,200" fill="#0a2040" opacity="0.5" />

      {/* India */}
      <path d="M310,160 L340,145 L380,150 L390,170 L385,200 L370,225 L345,240
               L325,235 L305,210 L300,185 Z"
        fill="#A0C4FF" opacity="0.3" stroke="#A0C4FF" strokeWidth="1" />

      {/* Bangladesh — small but highlighted */}
      <path d="M380,168 L400,165 L415,172 L420,188 L415,205 L398,212
               L383,208 L375,195 L376,178 Z"
        fill="#00C853" opacity="0.35" stroke="#00C853" strokeWidth="2" />
      <rect width="560" height="320" fill="url(#bdGlowGrad)" />
      {/* BD label */}
      <text x="397" y="192" textAnchor="middle" fontSize="10" fill="#00C853" fontWeight="bold">BD</text>

      {/* Dotted path background */}
      <path d="M120,180 Q280,60 420,200" fill="none"
        stroke="#00E5FF" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.25" />

      {/* Animated draw path */}
      <path d="M120,180 Q280,60 420,200" fill="none"
        stroke="#00E5FF" strokeWidth="4" strokeLinecap="round"
        strokeDasharray={pathLen} strokeDashoffset={pathLen * (1 - pathProgress)}
        style={{ filter: "drop-shadow(0 0 8px #00E5FF)" }} />

      {/* Package traveller */}
      {pathProgress > 0.02 && (
        <g transform={`translate(${px - 14}, ${py - 14})`}>
          <rect x="0" y="0" width="28" height="28" rx="6" fill="#FFD700"
            style={{ filter: "drop-shadow(0 0 10px #FFD700)" }} />
          <text x="14" y="20" textAnchor="middle" fontSize="16">📦</text>
        </g>
      )}

      {/* China marker */}
      <g filter="url(#mapGlow)">
        <circle cx="120" cy="180" r="12" fill="#00E5FF" opacity="0.85" />
        <circle cx="120" cy="180" r="8" fill="#FFFFFF" />
        <circle cx="120" cy="180" r="4" fill="#0a1a3a" />
        <text x="120" y="163" textAnchor="middle" fontSize="16">🇨🇳</text>
      </g>

      {/* BD marker */}
      <g filter="url(#mapGlow)">
        <circle cx="420" cy="200" r="12" fill="#00C853" opacity="0.85" />
        <circle cx="420" cy="200" r="8" fill="#FFFFFF" />
        <circle cx="420" cy="200" r="4" fill="#0a1a3a" />
        <text x="420" y="183" textAnchor="middle" fontSize="16">🇧🇩</text>
      </g>

      {/* Destination label */}
      {pathProgress > 0.9 && (
        <g>
          <rect x="360" y="215" width="120" height="30" rx="6" fill="#00C853" opacity="0.9" />
          <text x="420" y="235" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">✓ ডেলিভারি!</text>
        </g>
      )}

      {/* ChinaCart text */}
      <text x="280" y="305" textAnchor="middle" fontSize="12" fill="#A0C4FF" opacity="0.5">
        ChinaCart — চায়না থেকে বাংলাদেশ
      </text>
    </svg>
  );
};
