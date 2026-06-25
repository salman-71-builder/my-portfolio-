import { useCurrentFrame, interpolate } from "remotion";

export const DocumentDeskSVG: React.FC<{ width?: number; height?: number }> = ({
  width = 500, height = 380,
}) => {
  const frame = useCurrentFrame();
  // Pen writing animation
  const penProgress = interpolate(frame, [0, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stampScale = interpolate(frame, [60, 72, 80], [0, 1.3, 1.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const signatureLen = penProgress * 120;
  const penX = 240 + penProgress * 120;
  const penY = 258 - Math.sin(penProgress * Math.PI * 4) * 8;

  return (
    <svg width={width} height={height} viewBox="0 0 500 380" style={{ display: "block" }}>
      <defs>
        <linearGradient id="deskGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2a1f0e" />
          <stop offset="100%" stopColor="#1a1208" />
        </linearGradient>
        <radialGradient id="deskLight" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#c8a060" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#c8a060" stopOpacity="0" />
        </radialGradient>
        <filter id="docShadow">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Desk surface */}
      <rect width="500" height="380" fill="url(#deskGrad)" rx="12" />
      <rect width="500" height="380" fill="url(#deskLight)" rx="12" />
      {/* Wood grain lines */}
      {[60, 120, 185, 250, 315, 380].map((y, i) => (
        <line key={i} x1="0" y1={y} x2="500" y2={y + 10} stroke="#c8a06022" strokeWidth="1.5" />
      ))}

      {/* Main LC document */}
      <g filter="url(#docShadow)">
        <rect x="100" y="30" width="300" height="200" rx="6" fill="#f5f0e8" />
        {/* Document header */}
        <rect x="100" y="30" width="300" height="36" rx="6" fill="#1e3060" />
        <text x="250" y="54" textAnchor="middle" fontSize="13" fill="white" fontWeight="bold">LETTER OF CREDIT (LC)</text>
        {/* Lines of text */}
        {[85, 100, 115, 130, 145, 160, 175, 190].map((y, i) => (
          <rect key={i} x={120} y={y + 10} width={i % 3 === 0 ? 220 : i % 3 === 1 ? 180 : 260} height="6" rx="2"
            fill="#334466" opacity="0.35" />
        ))}
        {/* Amount box */}
        <rect x="130" y="200" width="120" height="20" rx="3" fill="#00E5FF" opacity="0.18" stroke="#00E5FF" strokeWidth="1" />
        <text x="190" y="215" textAnchor="middle" fontSize="10" fill="#00E5FF" fontWeight="bold">BDT ৳ 5,80,000</text>
        {/* Bank seal placeholder */}
        <circle cx="340" cy="205" r="22" fill="none" stroke="#1e3060" strokeWidth="2" strokeDasharray="4 2" />
        <text x="340" y="202" textAnchor="middle" fontSize="7" fill="#1e3060">SONALI</text>
        <text x="340" y="212" textAnchor="middle" fontSize="7" fill="#1e3060">BANK LTD</text>
      </g>

      {/* Secondary document — angled */}
      <g transform="rotate(-8, 80, 200)" filter="url(#docShadow)">
        <rect x="30" y="160" width="200" height="160" rx="6" fill="#fff8e8" />
        <rect x="30" y="160" width="200" height="26" rx="6" fill="#006633" />
        <text x="130" y="178" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">PURCHASE ORDER</text>
        {[45, 58, 71, 84, 97].map((y, i) => (
          <rect key={i} x={48} y={y + 165} width={i % 2 === 0 ? 130 : 100} height="5" rx="2" fill="#334466" opacity="0.3" />
        ))}
      </g>

      {/* Third document */}
      <g transform="rotate(5, 400, 220)" filter="url(#docShadow)">
        <rect x="310" y="180" width="170" height="160" rx="6" fill="#f0f8ff" />
        <rect x="310" y="180" width="170" height="26" rx="6" fill="#8B0000" />
        <text x="395" y="198" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">INVOICE</text>
        {[40, 54, 68, 82, 96].map((y, i) => (
          <rect key={i} x={326} y={y + 185} width={i % 2 === 0 ? 110 : 80} height="5" rx="2" fill="#334466" opacity="0.3" />
        ))}
      </g>

      {/* Pen */}
      <g transform={`translate(${penX - 60}, ${penY - 10}) rotate(-35)`}>
        <rect x="0" y="0" width="80" height="10" rx="4" fill="#2a2a2a" />
        <rect x="60" y="1" width="20" height="8" rx="2" fill="#c8a060" />
        <polygon points="80,2 80,8 92,5" fill="#c0c0c0" />
        {/* Ink tip */}
        <circle cx="92" cy="5" r="2" fill="#1a1a8a" />
      </g>

      {/* Signature being drawn */}
      <path
        d={`M240,258 C260,250 270,265 285,258 C300,251 308,260 315,255 C325,248 330,258 360,258`}
        stroke="#1a1a8a" strokeWidth="2.5" fill="none" strokeLinecap="round"
        strokeDasharray="120" strokeDashoffset={120 - signatureLen}
      />

      {/* Stamp */}
      {frame >= 60 && (
        <g transform={`translate(320, 110) scale(${stampScale})`} style={{ transformOrigin: "0 0" }}>
          <circle cx="0" cy="0" r="35" fill="none" stroke="#CC0000" strokeWidth="3" />
          <circle cx="0" cy="0" r="28" fill="none" stroke="#CC0000" strokeWidth="1.5" />
          <text textAnchor="middle" y="-8" fontSize="10" fill="#CC0000" fontWeight="bold">APPROVED</text>
          <text textAnchor="middle" y="6" fontSize="8" fill="#CC0000">✓ VERIFIED</text>
          <text textAnchor="middle" y="18" fontSize="7" fill="#CC0000">SONALI BANK</text>
        </g>
      )}

      {/* Ruler */}
      <g transform="translate(80, 310)">
        <rect x="0" y="0" width="340" height="22" rx="3" fill="#f5c842" opacity="0.8" />
        {Array.from({ length: 34 }, (_, i) => (
          <line key={i} x1={i * 10 + 5} y1="0" x2={i * 10 + 5} y2={i % 5 === 0 ? 14 : 8}
            stroke="#8B6914" strokeWidth="1" />
        ))}
      </g>

      {/* Coffee mug */}
      <g transform="translate(420, 50)">
        <rect x="0" y="10" width="50" height="55" rx="6" fill="#8B4513" />
        <rect x="3" y="13" width="44" height="15" rx="3" fill="#c8732a" />
        <path d="M50,25 Q62,25 62,38 Q62,50 50,50" stroke="#8B4513" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* Steam */}
        <path d={`M15,8 Q18,${2 + Math.sin(frame * 0.1) * 4} 15,-2`} stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d={`M25,6 Q28,${-1 + Math.sin(frame * 0.13 + 1) * 4} 25,-6`} stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d={`M35,8 Q38,${2 + Math.sin(frame * 0.11 + 2) * 4} 35,-2`} stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" />
      </g>
    </svg>
  );
};
