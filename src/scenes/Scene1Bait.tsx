import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C } from "../constants/colors";
import { AiImageCard } from "../components/AiImageCard";

// 50 stable random particles
const PARTICLES = Array.from({ length: 50 }, (_, i) => ({
  x: ((i * 397 + 113) % 1820) + 50,
  y: ((i * 271 + 89) % 980) + 50,
  delay: (i * 7) % 50,
  size: 3 + (i % 4),
}));

const FakeAdCard: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = spring({ frame: frame - startFrame, fps, config: { damping: 7, stiffness: 180, mass: 0.9 }, durationInFrames: 30 });
  const borderAnim = (frame * 3) % 360;
  const pulse = 1 + Math.sin(frame * 0.18) * 0.04;

  if (frame < startFrame) return null;

  return (
    <div style={{
      opacity: sc,
      transform: `scale(${sc})`,
      background: "linear-gradient(135deg, #1a1205 0%, #2a1f00 100%)",
      border: "3px solid transparent",
      borderRadius: 20,
      padding: 32,
      width: 480,
      backgroundClip: "padding-box",
      position: "relative",
      boxShadow: `0 0 40px rgba(255,215,0,0.25), 0 0 0 3px rgba(255,180,0,0.7)`,
    }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: 20,
        background: `conic-gradient(from ${borderAnim}deg, #FFD700, #FF8C00, #FFD700)`,
        zIndex: -1, margin: -3,
        opacity: 0.8,
      }} />
      <div style={{ color: C.gold, fontSize: 28, fontWeight: 900, fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 10 }}>
        🚀 মাত্র ১০ দিনে চায়না ডেলিভারি!
      </div>
      <div style={{ color: C.white, fontSize: 20, fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 14 }}>
        অবিশ্বাস্য কম দাম! ১০০% গ্যারান্টি!
      </div>
      <div style={{ fontSize: 24, marginBottom: 20 }}>⭐⭐⭐⭐⭐</div>
      <div style={{
        background: C.gold,
        color: "#000",
        fontWeight: 900,
        fontSize: 22,
        padding: "12px 32px",
        borderRadius: 50,
        textAlign: "center",
        transform: `scale(${pulse})`,
        boxShadow: "0 0 20px rgba(255,215,0,0.6)",
        fontFamily: "'Hind Siliguri', sans-serif",
      }}>
        ORDER NOW
      </div>
    </div>
  );
};

export const Scene1Bait: React.FC = () => {
  const frame = useCurrentFrame();

  const fullText = "চায়না থেকে মাত্র ১০ দিনে ডেলিভারি—\nএই ধরনের চটকদার বিজ্ঞাপন দেখে খুব বেশি বিপদে পড়ছেন না তো?";
  const typeProgress = interpolate(frame, [100, 280], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const visibleChars = Math.floor(typeProgress * fullText.length);

  return (
    <div style={{
      width: "100%", height: "100%",
      backgroundColor: C.bgPrimary,
      position: "relative", overflow: "hidden",
      fontFamily: "'Hind Siliguri', sans-serif",
    }}>
      {/* Particles */}
      {PARTICLES.map((p, i) => {
        const op = interpolate(frame, [p.delay, p.delay + 20], [0, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          * (0.6 + Math.sin(frame * 0.1 + i) * 0.2);
        return (
          <div key={i} style={{
            position: "absolute", left: p.x, top: p.y,
            width: p.size, height: p.size, borderRadius: "50%",
            backgroundColor: C.gold, opacity: op,
            boxShadow: `0 0 ${p.size * 2}px ${C.gold}`,
          }} />
        );
      })}

      {/* Main layout */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 60, padding: "0 80px",
      }}>
        {/* Left: ad card */}
        <FakeAdCard startFrame={30} />

        {/* Right: AI image */}
        <AiImageCard
          label="AI Image: Excited Bangladeshi businessman amazed at phone, dark blue studio"
          startFrame={80}
          width={480}
          height={360}
          slideFrom="right"
        />
      </div>

      {/* Typewriter text */}
      <div style={{
        position: "absolute", bottom: 80, left: 0, right: 0,
        textAlign: "center", padding: "0 120px",
      }}>
        <div style={{
          color: C.white, fontSize: 34, lineHeight: 1.6,
          whiteSpace: "pre-line",
          textShadow: "0 2px 12px rgba(0,0,0,0.8)",
          minHeight: 110,
        }}>
          {fullText.slice(0, visibleChars)}
          {typeProgress > 0 && typeProgress < 1 && (
            <span style={{ opacity: Math.floor(frame / 4) % 2 === 0 ? 1 : 0 }}>|</span>
          )}
        </div>
      </div>
    </div>
  );
};
