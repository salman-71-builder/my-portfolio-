import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C } from "../constants/colors";
import { TimelineNode } from "../components/TimelineNode";
import { AnimatedWarehouseScene } from "../animations/AnimatedWarehouseScene";
import { AnimatedCustomsScene } from "../animations/AnimatedCustomsScene";
import { ParticleBurst } from "../components/ParticleBurst";
import { BezierTravel } from "../components/ae/BezierTravel";
import { CubicSeg } from "../utils/bezier";
import {
  punchSpring, overshootScale, letterSpacingSnap,
  driftY, textGlow, breatheOp, impactFlash,
} from "../utils/energy";

// Curved China → Bangladesh journey arc (two cubic segments).
const JOURNEY: CubicSeg[] = [
  [{ x: 150, y: 110 }, { x: 520, y: -30 }, { x: 800, y: 60 }, { x: 960, y: 95 }],
  [{ x: 960, y: 95 }, { x: 1120, y: 130 }, { x: 1460, y: 0 }, { x: 1770, y: 110 }],
];

const NODES = [
  { icon: "📋", title: "ডকুমেন্টেশন",       frame: 30 },
  { icon: "🛍️", title: "প্রোডাক্ট অর্ডার",   frame: 85 },
  { icon: "🏭", title: "ওয়্যারহাউসে প্রেরণ", frame: 140 },
  { icon: "✅", title: "কোয়ালিটি চেক",       frame: 195 },
  { icon: "🚢", title: "শিপমেন্ট",            frame: 250 },
  { icon: "🛃", title: "কাস্টমস ক্লিয়ারেন্স",frame: 305 },
  { icon: "🎯", title: "আপনার কাছে ডেলিভারি", frame: 360 },
];

export const Scene4Process: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flash = impactFlash(frame, 0);
  const wipe = interpolate(frame, [2, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bgBreath = breatheOp(frame, 0.06, 0.03, 0.07);

  const titleSc = punchSpring(frame, fps, 12);
  const titleScale = overshootScale(titleSc);

  return (
    <div style={{
      width: "100%", height: "100%",
      backgroundColor: C.bgPrimary,
      position: "relative", overflow: "hidden",
      fontFamily: "'Hind Siliguri', sans-serif",
      opacity: wipe,
    }}>
      {/* Blueprint grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Cyan breathe */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 50% 60% at 30% 50%, rgba(0,229,255,${bgBreath}) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Particle burst on entry */}
      <ParticleBurst startFrame={2} x={960} y={540} count={20} colors={[C.cyan, C.white, "#00B4D8"]} radius={300} />

      {/* Package travels a curved bezier path China → Bangladesh (AE motion path) */}
      <svg width="1920" height="170" viewBox="0 0 1920 170"
        style={{ position: "absolute", top: 6, left: 0, zIndex: 3, opacity: 0.9, pointerEvents: "none" }}>
        <text x="150" y="100" textAnchor="middle" fontSize="40">🇨🇳</text>
        <text x="1770" y="100" textAnchor="middle" fontSize="40">🇧🇩</text>
        <BezierTravel
          segments={JOURNEY}
          startFrame={14}
          durationInFrames={340}
          trailColor={C.cyan}
          trailWidth={3}
          emoji="📦"
          emojiSize={42}
        />
      </svg>

      <div style={{
        position: "absolute", inset: 0,
        display: "flex", gap: 50, padding: "44px 70px",
      }}>
        {/* Timeline */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
          <div style={{
            transform: `scale(${titleScale}) translateY(${driftY(frame, 15)}px)`,
            opacity: titleSc, marginBottom: 28, alignSelf: "flex-start",
          }}>
            <div style={{
              color: C.cyan, fontSize: 56, fontWeight: 900,
              letterSpacing: letterSpacingSnap(titleSc),
              textShadow: textGlow(frame, C.cyan, 14, 6),
              filter: `drop-shadow(0 0 18px ${C.cyan})`,
            }}>
              সঠিক ইমপোর্ট প্রক্রিয়া
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {NODES.map((n, i) => (
              <TimelineNode key={i} icon={n.icon} title={n.title} startFrame={n.frame} isLast={i === NODES.length - 1} />
            ))}
          </div>
        </div>

        {/* AI image cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28, paddingTop: 72, flexShrink: 0 }}>
          <AnimatedWarehouseScene width={460} height={280} />
          <AnimatedCustomsScene width={460} height={260} />
        </div>
      </div>

      {/* Burst on final node */}
      <ParticleBurst startFrame={360} x={400} y={820} count={16} colors={[C.cyan, C.green, C.white]} radius={120} />

      {/* Impact flash */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: `rgba(0,229,255,${flash * 0.3})`,
        pointerEvents: "none", zIndex: 99,
      }} />
    </div>
  );
};
