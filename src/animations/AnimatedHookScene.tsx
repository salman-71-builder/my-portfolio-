import { useCurrentFrame, interpolate } from "remotion";
import { C } from "../constants/colors";

export const AnimatedHookScene: React.FC<{ width?: number; height?: number }> = ({
  width = 520, height = 360,
}) => {
  const frame = useCurrentFrame();

  // Phone screen glow pulse
  const phoneGlow = 18 + Math.sin(frame * 0.16) * 8;
  // Gold particles exploding from phone
  const particleAge = frame % 45;
  // Businessman reaction — lean in
  const leanX = interpolate(frame, [0, 30], [0, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const eyeWide = interpolate(frame, [0, 20], [10, 16], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const float = Math.sin(frame * 0.06) * 4;
  const phoneTilt = Math.sin(frame * 0.08) * 3;

  const PARTICLES = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const r = (particleAge / 45) * 100 * (0.6 + (i % 3) * 0.3);
    const op = Math.max(0, 1 - particleAge / 45);
    return { x: 380 + Math.cos(angle) * r, y: 200 + Math.sin(angle) * r, op };
  });

  return (
    <svg width={width} height={height} viewBox="0 0 520 360" style={{ display: "block" }}>
      <defs>
        <radialGradient id="ahBg" cx="70%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#2a1a00" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0A0E1A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="phoneScreenGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FF8C00" />
        </radialGradient>
        <filter id="ahGlow">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="520" height="360" fill="#0A0E1A" rx="14" />
      <rect width="520" height="360" fill="url(#ahBg)" rx="14" />

      {/* Phone glow corona */}
      <circle cx="380" cy="200" r={phoneGlow * 4} fill="#FFD700" opacity="0.08" />
      <circle cx="380" cy="200" r={phoneGlow * 2.5} fill="#FFD700" opacity="0.12" />

      {/* Exploding particles */}
      {PARTICLES.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3 + (i % 3) * 2}
          fill={i % 2 === 0 ? C.gold : C.white} opacity={p.op * 0.85}
          style={{ filter: `drop-shadow(0 0 4px ${C.gold})` }} />
      ))}

      {/* Businessman */}
      <g transform={`translate(${leanX}, ${float})`}>
        {/* Body */}
        <ellipse cx="180" cy="340" rx="120" ry="60" fill="#1a2a4a" />
        <path d="M80,265 Q120,245 180,250 Q240,245 280,265 L290,360 L70,360 Z" fill="#1e3060" />
        <path d="M180,250 L158,272 L168,320 Z" fill="#162550" />
        <path d="M180,250 L202,272 L192,320 Z" fill="#162550" />
        <path d="M168,251 L192,251 L188,360 L172,360 Z" fill="#f8f8f8" />
        <polygon points="176,253 184,253 180,310 176,310" fill="#00E5FF" />
        {/* Neck */}
        <rect x="170" y="222" width="20" height="30" rx="4" fill="#c8956c" />
        {/* Head */}
        <ellipse cx="180" cy="190" rx="62" ry="68" fill="#c8956c" />
        {/* Hair */}
        <ellipse cx="180" cy="132" rx="63" ry="24" fill="#1a0800" />
        {/* Wide excited eyes */}
        <ellipse cx="162" cy="186" rx={eyeWide * 0.75} ry={eyeWide} fill="white" />
        <ellipse cx="198" cy="186" rx={eyeWide * 0.75} ry={eyeWide} fill="white" />
        <circle cx="165" cy="188" r={eyeWide * 0.5} fill="#1a0800" />
        <circle cx="201" cy="188" r={eyeWide * 0.5} fill="#1a0800" />
        <circle cx="168" cy="184" r={eyeWide * 0.18} fill="white" />
        <circle cx="204" cy="184" r={eyeWide * 0.18} fill="white" />
        {/* Raised eyebrows */}
        <path d="M152,172 Q166,164 180,168" stroke="#1a0800" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M180,168 Q194,164 208,172" stroke="#1a0800" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        {/* "O" mouth — amazed */}
        <ellipse cx="180" cy="215" rx="14" ry="12" fill="#8B4513" />
        <ellipse cx="180" cy="215" rx="10" ry="8" fill="#2a0a0a" />
        {/* Cheeks flush */}
        <circle cx="148" cy="205" r="14" fill="#FF8080" opacity="0.3" />
        <circle cx="212" cy="205" r="14" fill="#FF8080" opacity="0.3" />
        {/* Right arm holding phone */}
        <path d="M260,268 Q290,260 ${310 + phoneTilt},240" stroke="#c8956c" strokeWidth="20" fill="none" strokeLinecap="round" />
      </g>

      {/* Phone */}
      <g transform={`rotate(${phoneTilt}, 380, 200) translate(0, ${float * 0.5})`} filter="url(#ahGlow)">
        <rect x="350" y="140" width="60" height="110" rx="10" fill="#1a1a2a" stroke="#333" strokeWidth="2" />
        <rect x="354" y="146" width="52" height="90" rx="6" fill="url(#phoneScreenGrad)" opacity="0.95" />
        {/* Ad on screen */}
        <text x="380" y="170" textAnchor="middle" fontSize="9" fill="#1a0a00" fontWeight="900">🚀 ১০ দিনে!</text>
        <text x="380" y="184" textAnchor="middle" fontSize="8" fill="#1a0a00">✓ গ্যারান্টি</text>
        <rect x="360" y="196" width="40" height="16" rx="6" fill="#CC0000" />
        <text x="380" y="208" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">ORDER!</text>
        {/* Phone glow border */}
        <rect x="350" y="140" width="60" height="110" rx="10" fill="none"
          stroke="#FFD700" strokeWidth="2" opacity={0.4 + Math.sin(frame * 0.2) * 0.3} />
      </g>

      {/* Gold sparkles */}
      {[40, 130, 220, 310].map((angle, i) => {
        const r2 = 85 + Math.sin(frame * 0.1 + i) * 15;
        const sx = 380 + Math.cos(angle * Math.PI / 180) * r2;
        const sy = 200 + Math.sin(angle * Math.PI / 180) * r2;
        const sop = 0.5 + Math.sin(frame * 0.18 + i * 1.2) * 0.4;
        return (
          <g key={i} opacity={sop}>
            <line x1={sx} y1={sy - 8} x2={sx} y2={sy + 8} stroke="#FFD700" strokeWidth="2.5" />
            <line x1={sx - 8} y1={sy} x2={sx + 8} y2={sy} stroke="#FFD700" strokeWidth="2.5" />
          </g>
        );
      })}

      {/* Exclamation bubbles */}
      <text x="60" y="120" fontSize="28" fill="#FFD700" opacity={0.5 + Math.sin(frame * 0.2) * 0.3} fontWeight="900">!</text>
      <text x="440" y="100" fontSize="22" fill="#00E5FF" opacity={0.5 + Math.sin(frame * 0.15 + 1) * 0.3} fontWeight="900">?</text>
    </svg>
  );
};
