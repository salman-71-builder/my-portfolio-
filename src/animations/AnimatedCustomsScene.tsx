import { useCurrentFrame, interpolate } from "remotion";
import { C } from "../constants/colors";

export const AnimatedCustomsScene: React.FC<{ width?: number; height?: number }> = ({
  width = 460, height = 340,
}) => {
  const frame = useCurrentFrame();
  // Doc slides across desk
  const docX = interpolate(frame % 90, [0, 45], [-180, 180], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Stamp bounce
  const stampBounce = interpolate(frame % 60, [0, 22, 30, 60], [0, 40, 30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stampMark = interpolate(frame % 60, [28, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Gate lift
  const gateY = interpolate(frame, [40, 70], [0, -55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // CLEARED text
  const clearedOp = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const screenGlow2 = 0.6 + Math.sin(frame * 0.12) * 0.2;

  return (
    <svg width={width} height={height} viewBox="0 0 460 340" style={{ display: "block" }}>
      <defs>
        <linearGradient id="custRoom" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a2a3a" />
          <stop offset="100%" stopColor="#0d1826" />
        </linearGradient>
        <filter id="custGlow">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="460" height="340" fill="url(#custRoom)" rx="12" />

      {/* Banner */}
      <rect x="40" y="12" width="380" height="38" rx="6" fill="#1e3060" />
      <text x="230" y="36" textAnchor="middle" fontSize="13" fill={C.cyan} fontWeight="bold">জাতীয় রাজস্ব বোর্ড — কাস্টমস</text>

      {/* Monitor */}
      <rect x="140" y="60" width="180" height="118" rx="6" fill="#0a0a1a" stroke="#1a3060" strokeWidth="2" />
      <rect x="144" y="64" width="172" height="110" rx="4" fill={`rgba(0,30,80,${screenGlow2})`} />
      <text x="230" y="88" textAnchor="middle" fontSize="10" fill={C.cyan} fontWeight="bold">CUSTOMS CLEARANCE</text>
      <rect x="154" y="95" width="152" height="4" rx="2" fill={C.cyan} opacity="0.2" />
      <rect x="154" y="104" width="120" height="3" rx="1" fill="#A0C4FF" opacity="0.18" />
      <rect x="154" y="112" width="140" height="3" rx="1" fill="#A0C4FF" opacity="0.18" />
      <text x="230" y={130} textAnchor="middle" fontSize="9" fill="#A0C4FF" opacity="0.7">শিপমেন্ট: CN-8821-BD</text>
      {/* CLEARED text on screen */}
      <text x="230" y="155" textAnchor="middle" fontSize="13" fill={C.green} fontWeight="bold"
        opacity={clearedOp} style={{ filter: `drop-shadow(0 0 6px ${C.green})` }}>
        ✓ CLEARED
      </text>
      <rect x="215" y="178" width="30" height="6" rx="3" fill="#222" />

      {/* Desk */}
      <rect x="0" y="200" width="460" height="80" fill="#2e2010" />
      <rect x="0" y="198" width="460" height="9" rx="0" fill="#4a3020" />

      {/* Sliding document */}
      <g transform={`translate(${docX}, 0)`}>
        <rect x="60" y="208" width="175" height="65" rx="5" fill="#f5f0e8"
          style={{ filter: "drop-shadow(2px 3px 6px rgba(0,0,0,0.5))" }} />
        <rect x="60" y="208" width="175" height="22" rx="5" fill="#006633" />
        <text x="147" y="224" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">CUSTOMS DECLARATION</text>
        {[38, 50, 62].map((y, i) => (
          <rect key={i} x={76} y={y + 194} width={i % 2 === 0 ? 120 : 90} height="5" rx="2" fill="#334466" opacity="0.28" />
        ))}
        {/* Stamp mark on doc */}
        <g opacity={stampMark * 0.85} filter="url(#custGlow)">
          <circle cx="200" cy="244" r="22" fill="none" stroke="#CC0000" strokeWidth="2.5" />
          <text x="200" y="241" textAnchor="middle" fontSize="8" fill="#CC0000" fontWeight="bold">অনুমোদিত</text>
          <text x="200" y="253" textAnchor="middle" fontSize="7" fill="#CC0000">✓ PASSED</text>
        </g>
      </g>

      {/* Rubber stamp */}
      <g transform={`translate(290, ${168 + stampBounce})`}>
        <rect x="0" y="0" width="52" height="20" rx="6" fill="#8B4513" />
        <rect x="8" y="14" width="36" height="13" rx="3" fill="#CC0000" />
        <rect x="20" y="-22" width="12" height="28" rx="5" fill="#5a2a10" />
      </g>

      {/* Stamp mark on desk */}
      <g opacity={stampMark} style={{ filter: `drop-shadow(0 0 8px #CC0000)` }}>
        <circle cx="316" cy="222" r="24" fill="none" stroke="#CC0000" strokeWidth="3" />
        <text x="316" y="219" textAnchor="middle" fontSize="9" fill="#CC0000" fontWeight="bold">অনুমোদিত</text>
        <text x="316" y="231" textAnchor="middle" fontSize="8" fill="#CC0000">APPROVED</text>
      </g>

      {/* Barrier gate */}
      <g transform={`translate(0, ${gateY})`}>
        <rect x="30" y="252" width="12" height="60" rx="4" fill="#555" />
        <rect x="42" y="262" width="180" height="14" rx="5"
          fill="#FF2D2D" stroke="#FF6666" strokeWidth="1.5" />
        {/* Stripes on gate */}
        {[0, 1, 2, 3, 4].map(i => (
          <rect key={i} x={42 + i * 36} y="262" width="18" height="14" fill="#FFD700" opacity="0.5" rx="0" />
        ))}
        <text x="132" y="273" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">CUSTOMS GATE</text>
      </g>

      {/* CLEARED big banner */}
      <g opacity={clearedOp} filter="url(#custGlow)">
        <rect x="100" y="290" width="260" height="38" rx="8" fill="#00C853" opacity="0.9" />
        <text x="230" y="315" textAnchor="middle" fontSize="16" fill="white" fontWeight="900">✓ কাস্টমস ক্লিয়ার!</text>
      </g>

      {/* Officer */}
      <g transform="translate(360, 95)">
        <circle cx="35" cy="28" r="22" fill="#c8956c" />
        <ellipse cx="35" cy="32" rx="22" ry="5" fill="#1a2a3a" />
        <rect x="15" y="28" width="40" height="48" rx="5" fill="#1e3a6a" />
        <rect x="15" y="28" width="40" height="14" rx="5" fill="#2a4a8a" />
        <ellipse cx="35" cy="12" rx="24" ry="8" fill="#1e3060" />
        <rect x="13" y="9" width="44" height="8" rx="2" fill="#1e3060" />
        <rect x="22" y="33" width="12" height="8" rx="2" fill="#FFD700" />
      </g>
    </svg>
  );
};
