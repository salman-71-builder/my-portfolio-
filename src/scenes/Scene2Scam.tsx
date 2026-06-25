import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

const BULLETS = [
  { text: '১০ দিন? আসলে ৪৫-৬০ দিন লাগে', startFrame: 120 },
  { text: 'পণ্য আসে ভাঙা বা ভুল', startFrame: 140 },
  { text: 'টাকা ফেরত? কোনো সাড়া নেই', startFrame: 160 },
];

const RedCross: React.FC<{ drawFrame: number }> = ({ drawFrame }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [drawFrame, drawFrame + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dashLen = 420;
  const offset = dashLen * (1 - progress);

  return (
    <svg
      width="340"
      height="340"
      viewBox="0 0 340 340"
      style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -65%)", zIndex: 10 }}
    >
      <line
        x1="60" y1="60" x2="280" y2="280"
        stroke="#FF1A1A"
        strokeWidth={22}
        strokeLinecap="round"
        strokeDasharray={dashLen}
        strokeDashoffset={offset}
      />
      <line
        x1="280" y1="60" x2="60" y2="280"
        stroke="#FF1A1A"
        strokeWidth={22}
        strokeLinecap="round"
        strokeDasharray={dashLen}
        strokeDashoffset={offset}
      />
    </svg>
  );
};

const ScamBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scaleIn = spring({ frame: frame - 110, fps, config: { damping: 8, stiffness: 220, mass: 0.7 }, durationInFrames: 20 });
  const pulse = 1 + Math.sin(frame * 0.25) * 0.03;

  if (frame < 110) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        right: 120,
        transform: `scale(${scaleIn * pulse})`,
        transformOrigin: "center",
        zIndex: 20,
      }}
    >
      {/* Octagon via clip-path */}
      <div
        style={{
          width: 200,
          height: 200,
          backgroundColor: "#CC0000",
          clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 40px rgba(255,0,0,0.7), 0 0 80px rgba(255,0,0,0.3)",
        }}
      >
        <span
          style={{
            color: "#FFFFFF",
            fontFamily: "'Hind Siliguri', sans-serif",
            fontWeight: 900,
            fontSize: 40,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          প্রতারণা!
        </span>
      </div>
    </div>
  );
};

export const Scene2Scam: React.FC = () => {
  const frame = useCurrentFrame();

  // local frame relative to scene start (scene starts at global frame 80)
  // but Scene2Scam receives frame already offset — we use frame directly
  // since AbsoluteFill sequences pass the global frame; we offset inside

  const localFrame = frame; // passed as-is from Sequence offset

  // Screen shake: frames 0–10 of scene (global 80–90)
  const shakeX = interpolate(
    localFrame,
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    [0, 8, -8, 6, -6, 7, -7, 4, -4, 2, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Red flash overlay frames 0–10
  const flashOpacity = interpolate(localFrame, [0, 4, 10], [0, 0.45, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Warning stripes position animates
  const stripeOffset = (localFrame * 4) % 80;

  // Red vignette constant
  const vignetteOpacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0A0E1A",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Hind Siliguri', sans-serif",
        transform: `translateX(${shakeX}px)`,
      }}
    >
      {/* Warning stripes background (frame 10+) */}
      {localFrame >= 10 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 30px,
              rgba(180,0,0,0.18) 30px,
              rgba(180,0,0,0.18) 60px
            )`,
            backgroundPosition: `${stripeOffset}px 0`,
            zIndex: 0,
          }}
        />
      )}

      {/* Red vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(180,0,0,0.55) 100%)",
          opacity: vignetteOpacity,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Ghost of Scene1 headline (crossed out) */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -65%)",
          textAlign: "center",
          zIndex: 2,
          opacity: 0.35,
        }}
      >
        <span style={{ color: "#FFFFFF", fontSize: 72, fontWeight: 900 }}>
          চায়না থেকে মাত্র{" "}
        </span>
        <span style={{ color: "#FFD700", fontSize: 72, fontWeight: 900 }}>
          ১০ দিনে
        </span>
        <span style={{ color: "#FFFFFF", fontSize: 72, fontWeight: 900 }}>
          {" "}ডেলিভারি! 🚀
        </span>
      </div>

      {/* Red cross SVG draw-on */}
      {localFrame >= 15 && <RedCross drawFrame={15} />}

      {/* Scam badge */}
      <ScamBadge />

      {/* Bullet points */}
      {BULLETS.map(({ text, startFrame }, i) => {
        const slideProgress = interpolate(
          localFrame,
          [startFrame, startFrame + 18],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const x = interpolate(slideProgress, [0, 1], [-700, 0]);
        const opacity = slideProgress;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: 240 - i * 88,
              left: 120,
              right: 120,
              display: "flex",
              alignItems: "center",
              gap: 24,
              transform: `translateX(${x}px)`,
              opacity,
              zIndex: 15,
            }}
          >
            <span style={{ fontSize: 44, lineHeight: 1 }}>❌</span>
            <span
              style={{
                color: "#FFFFFF",
                fontSize: 32,
                fontWeight: 600,
                textShadow: "0 2px 12px rgba(0,0,0,0.8)",
              }}
            >
              {text}
            </span>
          </div>
        );
      })}

      {/* Red flash overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: `rgba(255,0,0,${flashOpacity})`,
          pointerEvents: "none",
          zIndex: 50,
        }}
      />
    </div>
  );
};
