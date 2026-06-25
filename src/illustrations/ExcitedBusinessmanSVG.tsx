import { useCurrentFrame } from "remotion";

export const ExcitedBusinessmanSVG: React.FC<{ width?: number; height?: number }> = ({
  width = 400, height = 500,
}) => {
  const frame = useCurrentFrame();
  const float = Math.sin(frame * 0.07) * 5;
  const phoneGlow = 18 + Math.sin(frame * 0.14) * 8;
  const sparkleA = Math.sin(frame * 0.18) * 0.5 + 0.5;
  const sparkleB = Math.sin(frame * 0.22 + 1.2) * 0.5 + 0.5;
  const sparkleC = Math.sin(frame * 0.15 + 2.4) * 0.5 + 0.5;
  const eyebrowY = -3 + Math.sin(frame * 0.25) * 1.5; // raised eyebrows pulse
  const mouthArc = 275 + Math.sin(frame * 0.1) * 3;

  return (
    <svg width={width} height={height} viewBox="0 0 400 500" style={{ display: "block" }}>
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#1a2a4a" />
          <stop offset="100%" stopColor="#0D1526" />
        </radialGradient>
        <radialGradient id="phoneGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#FF8C00" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="faceGrad" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#d4a574" />
          <stop offset="100%" stopColor="#a0724a" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background */}
      <rect width="400" height="500" fill="url(#bgGrad)" rx="18" />

      {/* Phone glow corona */}
      <circle cx="270" cy={320 + float} r={phoneGlow * 3} fill="url(#phoneGlow)" opacity="0.5" />

      {/* Body / suit */}
      <ellipse cx="200" cy="460" rx="150" ry="90" fill="#1a2a4a" />
      <path d="M120,380 Q160,340 200,350 Q240,340 280,380 L290,480 L110,480 Z" fill="#1e3060" />

      {/* Shirt */}
      <path d="M175,355 L200,360 L225,355 L228,480 L172,480 Z" fill="#f0f0f0" />
      {/* Tie — cyan */}
      <polygon points="196,358 204,358 208,420 200,435 192,420" fill="#00E5FF" />
      <polygon points="196,358 204,358 202,375 198,375" fill="#00B4D8" />

      {/* Neck */}
      <rect x="188" y="295" width="24" height="50" fill="#c8956c" rx="4" />

      {/* Head */}
      <ellipse cx="200" cy="250" rx="75" ry="82" fill="url(#faceGrad)" />

      {/* Hair */}
      <ellipse cx="200" cy="178" rx="76" ry="32" fill="#1a0800" />
      <ellipse cx="140" cy="200" rx="22" ry="45" fill="#1a0800" />
      <ellipse cx="260" cy="200" rx="22" ry="45" fill="#1a0800" />

      {/* Raised eyebrows */}
      <path d={`M170,${220 + eyebrowY} Q185,${214 + eyebrowY} 200,${218 + eyebrowY}`}
        stroke="#1a0800" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d={`M200,${218 + eyebrowY} Q215,${214 + eyebrowY} 230,${220 + eyebrowY}`}
        stroke="#1a0800" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* Wide eyes */}
      <ellipse cx="180" cy="242" rx="14" ry="16" fill="white" />
      <ellipse cx="220" cy="242" rx="14" ry="16" fill="white" />
      <circle cx="183" cy="244" r="8" fill="#1a0800" />
      <circle cx="223" cy="244" r="8" fill="#1a0800" />
      <circle cx="186" cy="240" r="3" fill="white" />
      <circle cx="226" cy="240" r="3" fill="white" />

      {/* Big smile */}
      <path d={`M178,265 Q200,${mouthArc} 222,265`}
        stroke="#8B4513" strokeWidth="3" fill="#FF6B6B" strokeLinecap="round" />
      {/* Teeth */}
      <path d={`M180,265 Q200,${mouthArc - 6} 220,265`}
        stroke="none" fill="white" opacity="0.8" />

      {/* Rosy cheeks */}
      <circle cx="163" cy="262" r="16" fill="#FF9999" opacity="0.35" />
      <circle cx="237" cy="262" r="16" fill="#FF9999" opacity="0.35" />

      {/* Phone in right hand */}
      <g transform={`translate(${float * 0.5}, ${float})`}>
        <rect x="235" y="295" width="55" height="90" rx="8" fill="#222" stroke="#444" strokeWidth="2" />
        <rect x="239" y="300" width="47" height="70" rx="4" fill="#FFD700" opacity="0.95" />
        {/* Fake ad text on phone */}
        <rect x="243" y="306" width="30" height="4" rx="2" fill="#1a0800" opacity="0.7" />
        <rect x="243" y="314" width="38" height="3" rx="1" fill="#1a0800" opacity="0.5" />
        <rect x="243" y="321" width="25" height="3" rx="1" fill="#1a0800" opacity="0.5" />
        <rect x="243" y="334" width="36" height="10" rx="4" fill="#FF4500" />
        <text x="261" y="343" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">ORDER!</text>
      </g>

      {/* Sparkles around phone */}
      <g opacity={sparkleA}>
        <line x1="298" y1="285" x2="298" y2="270" stroke="#FFD700" strokeWidth="2.5" />
        <line x1="290" y1="278" x2="306" y2="278" stroke="#FFD700" strokeWidth="2.5" />
        <line x1="292" y1="283" x2="304" y2="273" stroke="#FFD700" strokeWidth="1.5" />
        <line x1="292" y1="273" x2="304" y2="283" stroke="#FFD700" strokeWidth="1.5" />
      </g>
      <g opacity={sparkleB}>
        <line x1="320" y1="310" x2="320" y2="298" stroke="#FFD700" strokeWidth="2" />
        <line x1="314" y1="304" x2="326" y2="304" stroke="#FFD700" strokeWidth="2" />
      </g>
      <g opacity={sparkleC}>
        <line x1="232" y1="305" x2="232" y2="295" stroke="#FFD700" strokeWidth="2" />
        <line x1="227" y1="300" x2="237" y2="300" stroke="#FFD700" strokeWidth="2" />
      </g>

      {/* Exclamation marks */}
      <text x="80" y="200" fontSize="32" fill="#FFD700" opacity={sparkleA} fontWeight="900">!</text>
      <text x="310" y="190" fontSize="28" fill="#FFD700" opacity={sparkleB} fontWeight="900">!</text>
      <text x="320" y="270" fontSize="22" fill="#00E5FF" opacity={sparkleC} fontWeight="900">?</text>

      {/* Cyan aura glow ring */}
      <ellipse cx="200" cy="250" rx="85" ry="92"
        fill="none" stroke="#00E5FF" strokeWidth="2"
        opacity={0.2 + sparkleA * 0.2}
        style={{ filter: "blur(2px)" }} />
    </svg>
  );
};
