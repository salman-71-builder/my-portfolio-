import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C } from "../constants/colors";
import { AnimatedConnectionScene } from "../animations/AnimatedConnectionScene";
import { ParticleBurst } from "../components/ParticleBurst";
import { ParticleText } from "../components/ae/ParticleText";
import { BezierTravel } from "../components/ae/BezierTravel";
import { CubicSeg } from "../utils/bezier";
import {
  punchSpring, overshootScale, letterSpacingSnap,
  driftY, textGlow, breatheOp, impactFlash,
} from "../utils/energy";

// China → Bangladesh map arc (quadratic M20,60 Q350,10 680,60 expressed as a cubic).
const MAP_ARC: CubicSeg[] = [
  [{ x: 20, y: 60 }, { x: 240, y: 26.7 }, { x: 460, y: 26.7 }, { x: 680, y: 60 }],
];

const SERVICES_LEFT  = ["প্রোডাক্ট সোর্সিং", "LC প্রসেসিং", "কাস্টমস ক্লিয়ারেন্স"];
const SERVICES_RIGHT = ["কোয়ালিটি কন্ট্রোল", "শিপমেন্ট ট্র্যাকিং", "ওয়্যারহাউস ডেলিভারি"];

const Confetti: React.FC<{ idx: number }> = ({ idx }) => {
  const frame = useCurrentFrame();
  const startF = 540 + (idx * 11) % 60;
  if (frame < startF) return null;
  const elapsed = frame - startF;
  const x = ((idx * 197 + 83) % 1820) + 50;
  const y = -30 + elapsed * (3.5 + (idx % 4) * 0.8);
  if (y > 1120) return null;
  const colors = [C.cyan, C.gold, C.white, "#A0C4FF", C.green];
  return (
    <div style={{
      position: "absolute", left: x, top: y,
      width: 10, height: 10,
      backgroundColor: colors[idx % colors.length],
      transform: `rotate(${elapsed * (6 + idx % 8)}deg)`,
      borderRadius: idx % 2 === 0 ? "50%" : 2,
      opacity: Math.max(0, 1 - elapsed / 90),
      boxShadow: `0 0 6px ${colors[idx % colors.length]}`,
      zIndex: 22,
    }} />
  );
};

export const Scene8GrandClose: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flash = impactFlash(frame, 0);
  const bgBreath = breatheOp(frame, 0.08, 0.05, 0.08);

  // Banner sweep
  const bannerW = interpolate(frame, [2, 20], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bannerTextSc = punchSpring(frame, fps, 18);

  // Map path width
  const pathLen = 700;

  // Services
  const servicesOp = interpolate(frame, [178, 196], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // CTA card SLAMS in
  const ctaSc = punchSpring(frame, fps, 388);
  const ctaScale = overshootScale(ctaSc);
  const ctaPulse = 1 + Math.sin(frame * 0.14) * 0.018;
  const urlGlow = 22 + Math.sin(frame * 0.16) * 10;

  // Thank you
  const thankOp = interpolate(frame, [590, 612], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const thankSc = punchSpring(frame, fps, 590);

  // Fade to black
  const finalFade = interpolate(frame, [642, 690], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      width: "100%", height: "100%",
      backgroundColor: C.bgPrimary,
      position: "relative", overflow: "hidden",
      fontFamily: "'Hind Siliguri', sans-serif",
    }}>
      {/* Breathe glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 60% 45% at 50% 50%, rgba(0,229,255,${bgBreath}) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Top banner sweep */}
      <div style={{
        position: "absolute", top: 0, left: 0, height: 72,
        width: `${bannerW}%`,
        background: `linear-gradient(90deg, #003B6F, ${C.cyan}, #0077B6, ${C.cyan})`,
        backgroundSize: "200% 100%",
        animation: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", zIndex: 5,
        boxShadow: `0 0 24px ${C.cyan}`,
      }}>
        <div style={{
          color: C.white, fontSize: 28, fontWeight: 900,
          whiteSpace: "nowrap",
          transform: `scale(${overshootScale(bannerTextSc)})`,
          opacity: bannerTextSc,
          letterSpacing: letterSpacingSnap(bannerTextSc),
          textShadow: textGlow(frame, C.cyan, 10, 4),
        }}>
          চায়না থেকে বাংলাদেশ — সহজ, নিরাপদ, বিশ্বস্ত
        </div>
      </div>

      {/* Map journey */}
      <div style={{
        position: "absolute", top: 88, left: "50%", transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 0, zIndex: 4,
      }}>
        <span style={{ fontSize: 52, filter: "drop-shadow(0 0 12px rgba(255,200,0,0.6))", transform: `translateY(${driftY(frame, 0)}px)` }}>🇨🇳</span>
        <svg width={pathLen} height={120} viewBox={`0 0 ${pathLen} 120`} style={{ overflow: "visible" }}>
          {/* Faint guide path */}
          <path d={`M 20 60 Q 350 10 680 60`} fill="none" stroke={C.cyan} strokeWidth={2}
            strokeDasharray="10 8" opacity={0.25} />
          {/* Package follows the curve, rotating to face travel direction (AE motion path) */}
          <BezierTravel
            segments={MAP_ARC}
            startFrame={55}
            durationInFrames={120}
            trailColor={C.cyan}
            trailWidth={5}
            emoji="📦"
            emojiSize={36}
          />
        </svg>
        <span style={{ fontSize: 52, filter: "drop-shadow(0 0 12px rgba(0,200,83,0.6))", transform: `translateY(${driftY(frame, 30)}px)` }}>🇧🇩</span>
      </div>

      {/* Services */}
      <div style={{
        position: "absolute", top: 235, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 80, opacity: servicesOp, zIndex: 4,
      }}>
        {[SERVICES_LEFT, SERVICES_RIGHT].map((col, ci) => (
          <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {col.map((item, ii) => {
              const sc = punchSpring(frame, fps, 180 + (ci * 3 + ii) * 14);
              return (
                <div key={ii} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  opacity: sc,
                  transform: `translateX(${interpolate(sc, [0, 1], [ci === 0 ? -100 : 100, 0])}px) scale(${overshootScale(sc)})`,
                  transformOrigin: ci === 0 ? "left center" : "right center",
                }}>
                  <span style={{ color: C.green, fontSize: 28, filter: `drop-shadow(0 0 10px ${C.green})` }}>✅</span>
                  <span style={{ color: C.white, fontSize: 26, fontWeight: 700 }}>{item}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* AI image background */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.15 }}>
        <AnimatedConnectionScene width={1800} height={1000} />
      </div>

      {/* CTA CARD */}
      {frame >= 388 && (
        <div style={{
          position: "absolute", bottom: 105, left: "50%",
          transform: `translateX(-50%) scale(${ctaScale * ctaPulse}) translateY(${driftY(frame, 60)}px)`,
          opacity: ctaSc, zIndex: 20,
          background: "rgba(4,12,30,0.94)",
          border: `2.5px solid ${C.cyan}`,
          borderRadius: 26, padding: "34px 60px",
          textAlign: "center",
          boxShadow: `0 0 ${urlGlow}px rgba(0,229,255,0.55), 0 0 ${urlGlow * 2.5}px rgba(0,229,255,0.22)`,
          backdropFilter: "blur(14px)",
        }}>
          <div style={{
            color: C.white, fontSize: 58, fontWeight: 900, marginBottom: 6,
            textShadow: textGlow(frame, C.cyan, 12, 5),
            letterSpacing: letterSpacingSnap(ctaSc),
          }}>
            🛒 ChinaCart
          </div>
          <div style={{
            color: C.cyan, fontSize: 32, fontWeight: 700, marginBottom: 14,
            filter: `drop-shadow(0 0 12px ${C.cyan})`,
          }}>
            আজই শুরু করুন
          </div>
          <div style={{
            color: C.cyan, fontSize: 46, fontWeight: 900,
            textShadow: `0 0 ${urlGlow}px rgba(0,229,255,1), 0 0 ${urlGlow * 2}px rgba(0,229,255,0.5)`,
            filter: `drop-shadow(0 0 18px ${C.cyan})`,
            marginBottom: 12,
          }}>
            🌐 chinacart.com.bd
          </div>
          <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`, marginBottom: 14 }} />
          <div style={{ color: C.muted, fontSize: 24 }}>বিশ্বস্ত ইমপোর্ট পার্টনার</div>
        </div>
      )}

      {/* MEGA burst on CTA reveal */}
      <ParticleBurst startFrame={388} x={960} y={800} count={28} colors={[C.cyan, C.gold, C.white, C.green]} radius={350} />
      <ParticleBurst startFrame={395} x={960} y={800} count={18} colors={[C.gold, C.white]} radius={200} />

      {/* After the explosion, particles RE-FORM the ChinaCart wordmark above the CTA */}
      <div style={{ position: "absolute", top: 360, left: 0, right: 0, height: 180, zIndex: 19 }}>
        <ParticleText
          text="ChinaCart"
          width={1920}
          height={180}
          startFrame={398}
          formDuration={46}
          holdDuration={150}
          explodeDuration={40}
          fontSize={120}
          colors={[C.cyan, C.gold, C.white]}
          sampleGap={8}
        />
      </div>

      {/* Confetti rain */}
      {Array.from({ length: 70 }, (_, i) => <Confetti key={i} idx={i} />)}

      {/* Thank you */}
      <div style={{
        position: "absolute", top: 28, left: "50%",
        transform: `translateX(-50%) scale(${overshootScale(thankSc)}) translateY(${driftY(frame, 80)}px)`,
        opacity: thankOp,
        zIndex: 25, color: C.white, fontSize: 40, fontWeight: 900,
        whiteSpace: "nowrap",
        textShadow: textGlow(frame, C.gold, 14, 6),
        filter: `drop-shadow(0 0 14px ${C.gold})`,
      }}>
        ধন্যবাদ 🙏 আসসালামু আলাইকুম
      </div>

      {/* Fade to black */}
      <div style={{
        position: "absolute", inset: 0, backgroundColor: "#000",
        opacity: finalFade, zIndex: 30, pointerEvents: "none",
      }} />

      {/* Last glow: URL */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 31,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: Math.max(0, (finalFade - 0.15) / 0.85),
      }}>
        <div style={{
          color: C.cyan, fontSize: 56, fontWeight: 900,
          textShadow: `0 0 40px rgba(0,229,255,1), 0 0 80px rgba(0,229,255,0.5)`,
          filter: `drop-shadow(0 0 24px ${C.cyan})`,
          letterSpacing: "0.04em",
        }}>
          chinacart.com.bd
        </div>
      </div>

      {/* Impact flash */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: `rgba(0,229,255,${flash * 0.4})`,
        pointerEvents: "none", zIndex: 99,
      }} />
    </div>
  );
};
