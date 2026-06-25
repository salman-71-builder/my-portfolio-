import { useCurrentFrame } from "remotion";

export const ShipOceanSVG: React.FC<{ width?: number; height?: number }> = ({
  width = 560, height = 340,
}) => {
  const frame = useCurrentFrame();
  const wave1 = Math.sin(frame * 0.08) * 8;
  const shipBob = Math.sin(frame * 0.06) * 4;
  const cloudX1 = (frame * 0.4) % 620 - 60;
  const cloudX2 = ((frame * 0.25) + 200) % 680 - 80;
  const smokePuff = Math.sin(frame * 0.15) * 5;

  return (
    <svg width={width} height={height} viewBox="0 0 560 340" style={{ display: "block" }}>
      <defs>
        <linearGradient id="sunsetSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0a1a3a" />
          <stop offset="40%" stopColor="#1a2a5a" />
          <stop offset="70%" stopColor="#2a1a4a" />
          <stop offset="100%" stopColor="#1a3060" />
        </linearGradient>
        <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0a4a7a" />
          <stop offset="100%" stopColor="#05182a" />
        </linearGradient>
        <linearGradient id="sunGlow" cx="50%" cy="50%" r="50%" gradientUnits="userSpaceOnUse"
          x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF8C00" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FF4500" stopOpacity="0" />
        </linearGradient>
        <filter id="oceanBlur">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      {/* Sky */}
      <rect width="560" height="340" fill="url(#sunsetSky)" rx="12" />

      {/* Setting sun */}
      <circle cx="280" cy="140" r="45" fill="#FF8C00" opacity="0.7" />
      <circle cx="280" cy="140" r="55" fill="#FF4500" opacity="0.2" />
      <circle cx="280" cy="140" r="70" fill="#FF8C00" opacity="0.08" />

      {/* Clouds */}
      <g transform={`translate(${cloudX1}, 60)`} opacity="0.5">
        <ellipse cx="60" cy="0" rx="45" ry="18" fill="#3a4a6a" />
        <ellipse cx="90" cy="-6" rx="32" ry="16" fill="#3a4a6a" />
        <ellipse cx="35" cy="-4" rx="28" ry="14" fill="#3a4a6a" />
      </g>
      <g transform={`translate(${cloudX2}, 90)`} opacity="0.4">
        <ellipse cx="60" cy="0" rx="35" ry="14" fill="#2a3a5a" />
        <ellipse cx="84" cy="-5" rx="25" ry="12" fill="#2a3a5a" />
        <ellipse cx="38" cy="-3" rx="22" ry="11" fill="#2a3a5a" />
      </g>

      {/* Ocean horizon line */}
      <rect x="0" y="200" width="560" height="140" fill="url(#oceanGrad)" />

      {/* Ocean waves */}
      {[0, 1, 2, 3].map(i => {
        const waveY = 205 + i * 30;
        const off = i * 40;
        const amp = 10 - i * 2;
        const freq = 0.08 + i * 0.02;
        const points = Array.from({ length: 57 }, (_, x) =>
          `${x * 10},${waveY + Math.sin((x * freq + frame * 0.06 + off * 0.1)) * amp}`
        ).join(" L ");
        return (
          <path key={i} d={`M0,${waveY} L${points} L560,${waveY} L560,340 L0,340 Z`}
            fill={`rgba(10,${74 - i * 12},${122 - i * 20},${0.4 + i * 0.15})`} />
        );
      })}

      {/* Wave highlights */}
      {[210, 240, 265, 295].map((y, i) => {
        const wOff = i * 50;
        return (
          <path key={i} d={`M${20 + wOff},${y + wave1 * 0.3} Q${60 + wOff},${y + wave1 * 0.3 - 8} ${100 + wOff},${y + wave1 * 0.3}`}
            stroke="rgba(150,220,255,0.25)" strokeWidth="2" fill="none" />
        );
      })}

      {/* Ship */}
      <g transform={`translate(0, ${shipBob})`}>
        {/* Hull */}
        <path d="M60,195 L500,195 L520,225 L40,225 Z" fill="#1a2a4a" />
        <path d="M40,225 L520,225 L500,240 L60,240 Z" fill="#CC0000" />
        {/* Hull stripe */}
        <rect x="42" y="232" width="456" height="5" fill="#FFFFFF" opacity="0.8" />

        {/* Deck */}
        <rect x="80" y="165" width="400" height="32" rx="4" fill="#2a3a5a" />
        <rect x="80" y="165" width="400" height="6" rx="2" fill="#3a4a6a" />

        {/* Container stack 1 */}
        <rect x="100" y="125" width="80" height="42" rx="3" fill="#CC0000" />
        <rect x="100" y="125" width="80" height="14" rx="3" fill="#FF3333" />
        <rect x="104" y="140" width="72" height="3" rx="1" fill="#800000" />
        <rect x="182" y="130" width="4" height="37" rx="1" fill="#1a1a1a" />

        {/* Container stack 2 */}
        <rect x="195" y="120" width="80" height="47" rx="3" fill="#1a6a1a" />
        <rect x="195" y="120" width="80" height="15" rx="3" fill="#2a8a2a" />
        <rect x="199" y="136" width="72" height="3" rx="1" fill="#0a3a0a" />

        {/* Container stack 3 */}
        <rect x="285" y="128" width="80" height="39" rx="3" fill="#1a3a8a" />
        <rect x="285" y="128" width="80" height="14" rx="3" fill="#2a4aaa" />

        {/* Container stack 4 */}
        <rect x="375" y="115" width="80" height="52" rx="3" fill="#8a5a00" />
        <rect x="375" y="115" width="80" height="16" rx="3" fill="#aa7a10" />

        {/* Bridge/cabin */}
        <rect x="205" y="90" width="150" height="75" rx="5" fill="#1e3060" />
        <rect x="218" y="98" width="50" height="38" rx="3" fill="#0a2040" stroke="#00E5FF" strokeWidth="1" opacity="0.8" />
        <rect x="292" y="98" width="50" height="38" rx="3" fill="#0a2040" stroke="#00E5FF" strokeWidth="1" opacity="0.8" />
        {/* Bridge windows — glowing */}
        <rect x="222" y="102" width="42" height="30" rx="2" fill="#FFD700" opacity="0.5" />
        <rect x="296" y="102" width="42" height="30" rx="2" fill="#FFD700" opacity="0.5" />

        {/* Smokestack */}
        <rect x="255" y="55" width="30" height="40" rx="4" fill="#333" />
        <ellipse cx="270" cy="55" rx="16" ry="6" fill="#222" />
        {/* Smoke puffs */}
        {[0, 1, 2].map(i => (
          <circle key={i} cx={265 + Math.sin(frame * 0.08 + i * 1.2) * 8}
            cy={40 - i * 16 + smokePuff * (i + 1) * 0.5}
            r={8 + i * 4}
            fill="#888" opacity={0.3 - i * 0.08} />
        ))}

        {/* Mast / antenna */}
        <line x1="280" y1="18" x2="280" y2="58" stroke="#aaa" strokeWidth="2.5" />
        <line x1="250" y1="30" x2="310" y2="30" stroke="#aaa" strokeWidth="1.5" />
        {/* Flags */}
        <path d="M280,18 L300,22 L280,28 Z" fill="#00E5FF" />

        {/* Wake trail */}
        {[1, 2, 3].map(i => (
          <path key={i}
            d={`M${40 - i * 30},${228 + Math.sin(frame * 0.1 + i) * 3} Q${-i * 15},${235 + Math.sin(frame * 0.08) * 4} ${-i * 45},228`}
            stroke="rgba(150,220,255,0.3)" strokeWidth={4 - i} fill="none" />
        ))}
      </g>

      {/* ChinaCart flag on ship */}
      <g transform={`translate(0, ${shipBob})`}>
        <path d="M280,18 L306,22 L280,30 Z" fill="#FF2D2D" />
        <text x="290" y="27" fontSize="7" fill="white" fontWeight="bold">CC</text>
      </g>
    </svg>
  );
};
