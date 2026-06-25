import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

const SparkleParticle: React.FC<{ x: number; y: number; delay: number; size: number }> = ({
  x,
  y,
  delay,
  size,
}) => {
  const frame = useCurrentFrame();
  const pulse = Math.sin((frame - delay) * 0.15) * 0.4 + 0.6;
  const opacity = Math.max(0, Math.min(1, (frame - delay) / 10)) * pulse;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "#FFD700",
        opacity,
        boxShadow: `0 0 ${size * 2}px ${size}px rgba(255,215,0,0.4)`,
      }}
    />
  );
};

const PARTICLES = [
  { x: 120, y: 80, delay: 5, size: 5 },
  { x: 300, y: 200, delay: 8, size: 3 },
  { x: 1600, y: 120, delay: 3, size: 6 },
  { x: 1750, y: 300, delay: 10, size: 4 },
  { x: 800, y: 950, delay: 6, size: 5 },
  { x: 1400, y: 900, delay: 2, size: 3 },
  { x: 200, y: 700, delay: 9, size: 4 },
  { x: 1850, y: 600, delay: 4, size: 6 },
  { x: 500, y: 100, delay: 7, size: 3 },
  { x: 1100, y: 980, delay: 1, size: 5 },
  { x: 50, y: 450, delay: 12, size: 4 },
  { x: 1680, y: 750, delay: 0, size: 3 },
];

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main text spring slam
  const mainScale = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 200, mass: 0.8 },
    durationInFrames: 30,
  });

  const mainY = interpolate(mainScale, [0, 1], [120, 0]);

  // Package flies in from right at frame 20
  const packageX = interpolate(
    frame,
    [20, 40],
    [400, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const packageBounce = spring({
    frame: frame - 20,
    fps,
    config: { damping: 7, stiffness: 180, mass: 1 },
    durationInFrames: 25,
  });

  // Golden glow pulse on "১০ দিনে"
  const glowPulse = Math.sin(frame * 0.18) * 0.5 + 0.5;
  const glowSize = 8 + glowPulse * 14;

  // Tagline typewriter at frame 50
  const taglineProgress = interpolate(frame, [50, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineText = "অবিশ্বাস্য দাম! ১০০% নিশ্চিত!";
  const visibleChars = Math.floor(taglineProgress * taglineText.length);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0A0E1A",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Hind Siliguri', sans-serif",
      }}
    >
      {/* Sparkle particles */}
      {PARTICLES.map((p, i) => (
        <SparkleParticle key={i} {...p} />
      ))}

      {/* Subtle radial glow center */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,215,0,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Package emoji */}
      {frame >= 20 && (
        <div
          style={{
            position: "absolute",
            top: 280,
            right: 160 + packageX * (1 - packageBounce),
            fontSize: 90,
            transform: `scale(${packageBounce})`,
            filter: "drop-shadow(0 0 20px rgba(255,215,0,0.5))",
          }}
        >
          📦
        </div>
      )}

      {/* Main headline */}
      <div
        style={{
          transform: `translateY(${mainY}px) scale(${0.4 + mainScale * 0.6})`,
          opacity: mainScale,
          textAlign: "center",
          padding: "0 80px",
          lineHeight: 1.3,
        }}
      >
        <span
          style={{
            color: "#FFFFFF",
            fontSize: 88,
            fontWeight: 900,
            textShadow: "0 4px 24px rgba(0,0,0,0.6)",
          }}
        >
          চায়না থেকে মাত্র{" "}
        </span>
        <span
          style={{
            color: "#FFD700",
            fontSize: 88,
            fontWeight: 900,
            textShadow: `0 0 ${glowSize}px rgba(255,215,0,0.9), 0 0 ${glowSize * 2}px rgba(255,215,0,0.5)`,
          }}
        >
          ১০ দিনে
        </span>
        <span
          style={{
            color: "#FFFFFF",
            fontSize: 88,
            fontWeight: 900,
            textShadow: "0 4px 24px rgba(0,0,0,0.6)",
          }}
        >
          {" "}ডেলিভারি! 🚀
        </span>
      </div>

      {/* Tagline typewriter */}
      <div
        style={{
          marginTop: 48,
          color: "#A0C4FF",
          fontSize: 36,
          fontWeight: 600,
          letterSpacing: 1,
          opacity: taglineProgress,
          minHeight: 44,
          textAlign: "center",
        }}
      >
        {taglineText.slice(0, visibleChars)}
        {taglineProgress > 0 && taglineProgress < 1 && (
          <span style={{ opacity: Math.floor(frame / 3) % 2 === 0 ? 1 : 0 }}>|</span>
        )}
      </div>
    </div>
  );
};
