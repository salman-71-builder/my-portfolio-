import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const Scene3Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Wipe reveal: frame 0–8 of this scene (global 190–198)
  const wipeProgress = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ChinaCart logo scale-in at scene frame 5 (global 195)
  const logoScale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 10, stiffness: 240, mass: 0.6 },
    durationInFrames: 20,
  });

  // Cyan underline width 0→100% starting scene frame 5
  const underlineWidth = interpolate(frame, [5, 28], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline fade at scene frame 20 (global 210)
  const taglineOpacity = interpolate(frame, [20, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineY = interpolate(frame, [20, 32], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Domain pulse at scene frame 30 (global 220)
  const domainScale = spring({
    frame: frame - 30,
    fps,
    config: { damping: 9, stiffness: 200, mass: 0.7 },
    durationInFrames: 18,
  });
  const domainGlow = 16 + Math.sin(frame * 0.2) * 8;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Hind Siliguri', sans-serif",
      }}
    >
      {/* Horizontal wipe — dark bg slides in from left */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#0A0E1A",
          clipPath: `inset(0 ${(1 - wipeProgress) * 100}% 0 0)`,
          zIndex: 0,
        }}
      />

      {/* Subtle cyan radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 55% 35% at 50% 42%, rgba(0,229,255,0.08) 0%, transparent 70%)",
          opacity: wipeProgress,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* ChinaCart brand */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -60%) scale(${logoScale})`,
          transformOrigin: "center",
          textAlign: "center",
          zIndex: 5,
          opacity: logoScale,
        }}
      >
        <div
          style={{
            color: "#FFFFFF",
            fontSize: 100,
            fontWeight: 900,
            lineHeight: 1.1,
            textShadow: "0 4px 32px rgba(0,229,255,0.25)",
            whiteSpace: "nowrap",
          }}
        >
          🛒 ChinaCart
        </div>

        {/* Animated cyan underline */}
        <div
          style={{
            marginTop: 12,
            height: 5,
            width: `${underlineWidth}%`,
            borderRadius: 4,
            background: "linear-gradient(90deg, #00B4D8, #00E5FF, #90E0EF)",
            boxShadow: "0 0 18px rgba(0,229,255,0.8)",
            transition: "none",
          }}
        />
      </div>

      {/* Tagline */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, 40%) translateY(${taglineY}px)`,
          opacity: taglineOpacity,
          color: "#A0C4FF",
          fontSize: 36,
          fontWeight: 600,
          textAlign: "center",
          whiteSpace: "nowrap",
          zIndex: 5,
          textShadow: "0 2px 16px rgba(0,0,0,0.6)",
        }}
      >
        সৎ দাম। সঠিক সময়। বিশ্বস্ত ডেলিভারি।
      </div>

      {/* Domain URL */}
      {frame >= 30 && (
        <div
          style={{
            position: "absolute",
            bottom: 100,
            left: "50%",
            transform: `translateX(-50%) scale(${domainScale})`,
            color: "#00E5FF",
            fontSize: 42,
            fontWeight: 700,
            letterSpacing: 1,
            textShadow: `0 0 ${domainGlow}px rgba(0,229,255,0.9), 0 0 ${domainGlow * 2}px rgba(0,229,255,0.4)`,
            opacity: domainScale,
            zIndex: 5,
            whiteSpace: "nowrap",
          }}
        >
          chinaCart.com.bd
        </div>
      )}
    </div>
  );
};
