import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C } from "../constants/colors";
import { AiImageCard } from "../components/AiImageCard";
import { ParticleBurst } from "../components/ParticleBurst";
import {
  punchSpring, overshootScale, letterSpacingSnap,
  driftY, textGlow, breatheOp, impactFlash,
} from "../utils/energy";

// 60 gold particles — dense cloud
const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  x: ((i * 397 + 113) % 1820) + 50,
  y: ((i * 271 + 89) % 980) + 50,
  delay: (i * 4) % 45,
  size: 2 + (i % 5),
  speed: 0.08 + (i % 5) * 0.02,
  phase: i * 0.7,
}));

const FakeAdCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = punchSpring(frame, fps, 30);
  const scale = overshootScale(sc);
  const borderAnim = (frame * 4) % 360;
  const pulse = 1 + Math.sin(frame * 0.22) * 0.05;
  const tilt = Math.sin(frame * 0.04) * 2.5;
  const drift = driftY(frame, 10);

  if (frame < 30) return null;

  return (
    <div style={{
      transform: `scale(${scale}) translateY(${drift}px) rotate(${-2.5 + tilt}deg)`,
      transformOrigin: "center",
      opacity: sc,
      position: "relative",
      width: 460,
      flexShrink: 0,
    }}>
      {/* Spinning border glow */}
      <div style={{
        position: "absolute", inset: -4, borderRadius: 24,
        background: `conic-gradient(from ${borderAnim}deg, #FFD700, #FF8C00, #FF4500, #FFD700)`,
        opacity: 0.85,
        filter: "blur(4px)",
        zIndex: 0,
      }} />
      <div style={{
        position: "relative", zIndex: 1,
        background: "linear-gradient(135deg, #1c1400 0%, #2e2000 60%, #1a1000 100%)",
        borderRadius: 22, padding: "32px 36px",
        boxShadow: `0 0 50px rgba(255,215,0,0.3)`,
      }}>
        <div style={{
          color: C.gold, fontSize: 30, fontWeight: 900,
          fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 12,
          textShadow: textGlow(frame, C.gold, 14, 6),
          letterSpacing: letterSpacingSnap(sc),
        }}>
          🚀 মাত্র ১০ দিনে চায়না ডেলিভারি!
        </div>
        <div style={{ color: C.white, fontSize: 20, fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 16, fontWeight: 600 }}>
          অবিশ্বাস্য কম দাম! ১০০% গ্যারান্টি!
        </div>
        <div style={{ fontSize: 26, marginBottom: 22 }}>⭐⭐⭐⭐⭐</div>
        <div style={{
          background: `linear-gradient(90deg, ${C.gold}, #FF8C00)`,
          color: "#000", fontWeight: 900, fontSize: 22,
          padding: "14px 32px", borderRadius: 50, textAlign: "center",
          transform: `scale(${pulse})`,
          boxShadow: `0 0 28px rgba(255,215,0,0.7), 0 0 60px rgba(255,215,0,0.3)`,
          fontFamily: "'Hind Siliguri', sans-serif",
          filter: `drop-shadow(0 0 14px ${C.gold})`,
        }}>
          এখনই অর্ডার করুন!
        </div>
      </div>
    </div>
  );
};

export const Scene1Bait: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Impact flash at frame 0
  const flash = impactFlash(frame, 0);
  // Background breathe
  const bgBreath = breatheOp(frame);

  // Main tagline slam at frame 85
  const tagSc = punchSpring(frame, fps, 85);
  const tagScale = overshootScale(tagSc);

  const fullText = "চায়না থেকে মাত্র ১০ দিনে ডেলিভারি—\nএই ধরনের চটকদার বিজ্ঞাপন দেখে খুব বেশি বিপদে পড়ছেন না তো?";
  const typeProgress = interpolate(frame, [105, 268], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const visibleChars = Math.floor(typeProgress * fullText.length);

  return (
    <div style={{
      width: "100%", height: "100%",
      backgroundColor: C.bgPrimary,
      position: "relative", overflow: "hidden",
      fontFamily: "'Hind Siliguri', sans-serif",
    }}>
      {/* Breathing radial glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 65% 45% at 50% 50%, rgba(255,215,0,${bgBreath}) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Gold particles */}
      {PARTICLES.map((p, i) => {
        const on = interpolate(frame, [p.delay, p.delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const fly = Math.sin(frame * p.speed + p.phase) * 6;
        return (
          <div key={i} style={{
            position: "absolute",
            left: p.x + Math.cos(p.phase) * fly,
            top: p.y + fly,
            width: p.size, height: p.size, borderRadius: "50%",
            backgroundColor: C.gold,
            opacity: on * (0.5 + Math.sin(frame * 0.1 + p.phase) * 0.3),
            boxShadow: `0 0 ${p.size * 3}px ${C.gold}`,
          }} />
        );
      })}

      {/* Particle burst when ad card slams in */}
      <ParticleBurst startFrame={30} x={960} y={480} count={22} colors={[C.gold, "#FF8C00", C.white]} radius={250} />

      {/* Main content row */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 64, padding: "0 80px", paddingBottom: 160,
      }}>
        <FakeAdCard />
        <AiImageCard
          label="AI Image: Excited Bangladeshi businessman amazed at phone, dark blue studio"
          startFrame={75}
          width={480} height={360}
          slideFrom="right"
        />
      </div>

      {/* Tagline slams in */}
      <div style={{
        position: "absolute", bottom: 52, left: 0, right: 0,
        textAlign: "center", padding: "0 100px",
      }}>
        <div style={{
          color: C.white, fontSize: 32, lineHeight: 1.7,
          fontWeight: 900, whiteSpace: "pre-line",
          transform: `scale(${tagScale}) translateY(${driftY(frame, 40)}px)`,
          opacity: tagSc,
          letterSpacing: letterSpacingSnap(tagSc),
          textShadow: "0 2px 16px rgba(0,0,0,0.9)",
          minHeight: 110,
        }}>
          {fullText.slice(0, visibleChars)}
          {typeProgress > 0 && typeProgress < 1 && (
            <span style={{ opacity: Math.floor(frame / 3) % 2 === 0 ? 1 : 0, color: C.gold }}>|</span>
          )}
        </div>
      </div>

      {/* Impact flash overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: `rgba(255,255,255,${flash})`,
        pointerEvents: "none", zIndex: 99,
      }} />
    </div>
  );
};
