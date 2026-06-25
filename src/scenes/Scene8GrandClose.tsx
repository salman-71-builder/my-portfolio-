import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C } from "../constants/colors";
import { AiImageCard } from "../components/AiImageCard";

const SERVICES_LEFT = ["প্রোডাক্ট সোর্সিং", "LC প্রসেসিং", "কাস্টমস ক্লিয়ারেন্স"];
const SERVICES_RIGHT = ["কোয়ালিটি কন্ট্রোল", "শিপমেন্ট ট্র্যাকিং", "ওয়্যারহাউস ডেলিভারি"];

// Simple confetti particle
const Confetti: React.FC<{ idx: number }> = ({ idx }) => {
  const frame = useCurrentFrame();
  const startF = 540 + (idx * 11) % 60;
  if (frame < startF) return null;
  const elapsed = frame - startF;
  const x = ((idx * 197 + 83) % 1820) + 50;
  const y = -30 + elapsed * (3 + (idx % 4));
  const rot = elapsed * (5 + (idx % 8));
  const colors = [C.cyan, C.gold, C.white, "#A0C4FF", C.green];
  const color = colors[idx % colors.length];
  if (y > 1120) return null;
  return (
    <div style={{
      position: "absolute", left: x, top: y,
      width: 10, height: 10,
      backgroundColor: color,
      transform: `rotate(${rot}deg)`,
      borderRadius: idx % 2 === 0 ? "50%" : 2,
      opacity: Math.max(0, 1 - elapsed / 100),
    }} />
  );
};

export const Scene8GrandClose: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Banner sweep
  const bannerW = interpolate(frame, [0, 25], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Map path
  const pathProgress = interpolate(frame, [60, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pathLen = 700;

  // Services
  const servicesOp = interpolate(frame, [180, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // CTA card
  const ctaSc = spring({ frame: frame - 390, fps, config: { damping: 9, stiffness: 200, mass: 0.8 }, durationInFrames: 25 });
  const ctaGlow = 20 + Math.sin(frame * 0.15) * 8;
  const ctaPulse = 1 + Math.sin(frame * 0.12) * 0.015;

  // Thank you
  const thankOp = interpolate(frame, [590, 615], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Final fade to black
  const finalFade = interpolate(frame, [640, 690], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // URL glow last
  const urlGlow = ctaGlow;

  return (
    <div style={{
      width: "100%", height: "100%",
      backgroundColor: C.bgPrimary,
      position: "relative", overflow: "hidden",
      fontFamily: "'Hind Siliguri', sans-serif",
    }}>
      {/* Top banner */}
      <div style={{
        position: "absolute", top: 0, left: 0, height: 72,
        width: `${bannerW}%`,
        background: `linear-gradient(90deg, #003B6F, ${C.cyan}, #0077B6)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
        zIndex: 5,
      }}>
        <div style={{ color: C.white, fontSize: 28, fontWeight: 700, whiteSpace: "nowrap" }}>
          চায়না থেকে বাংলাদেশ — সহজ, নিরাপদ, বিশ্বস্ত
        </div>
      </div>

      {/* Map journey */}
      <div style={{
        position: "absolute", top: 90, left: "50%", transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 0, zIndex: 4,
      }}>
        <span style={{ fontSize: 52 }}>🇨🇳</span>
        <svg width={pathLen} height={120} viewBox={`0 0 ${pathLen} 120`} style={{ overflow: "visible" }}>
          <path
            d={`M 20 60 Q 350 10 680 60`}
            fill="none"
            stroke={C.cyan}
            strokeWidth={3}
            strokeDasharray="12 8"
            strokeDashoffset={0}
            opacity={0.6}
          />
          <path
            d={`M 20 60 Q 350 10 680 60`}
            fill="none"
            stroke={C.cyan}
            strokeWidth={4}
            strokeDasharray={pathLen}
            strokeDashoffset={pathLen * (1 - pathProgress)}
            strokeLinecap="round"
          />
          {/* Package traveller */}
          {pathProgress > 0 && (() => {
            // Approximate position along quadratic bezier
            const t = pathProgress;
            const px = 20 * (1 - t) * (1 - t) + 2 * 350 * (1 - t) * t + 680 * t * t;
            const py = 60 * (1 - t) * (1 - t) + 2 * 10 * (1 - t) * t + 60 * t * t;
            return (
              <text x={px - 16} y={py + 12} fontSize={32} style={{ userSelect: "none" }}>📦</text>
            );
          })()}
        </svg>
        <span style={{ fontSize: 52 }}>🇧🇩</span>
      </div>

      {/* Services columns */}
      <div style={{
        position: "absolute", top: 240, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 80, opacity: servicesOp, zIndex: 4,
      }}>
        {[SERVICES_LEFT, SERVICES_RIGHT].map((col, ci) => (
          <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {col.map((item, ii) => {
              const rowOp = interpolate(frame, [180 + (ci * 3 + ii) * 15, 195 + (ci * 3 + ii) * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={ii} style={{ display: "flex", alignItems: "center", gap: 14, opacity: rowOp }}>
                  <span style={{ color: C.green, fontSize: 28 }}>✅</span>
                  <span style={{ color: C.white, fontSize: 26, fontWeight: 500 }}>{item}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* AI image background */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.18 }}>
        <AiImageCard
          label="China Bangladesh skyline split, golden light beam cinematic"
          startFrame={340}
          width={1800}
          height={1000}
          slideFrom="bottom"
        />
      </div>

      {/* CTA card */}
      {frame >= 390 && (
        <div style={{
          position: "absolute", bottom: 120, left: "50%",
          transform: `translateX(-50%) scale(${ctaSc * ctaPulse})`,
          opacity: ctaSc, zIndex: 20,
          background: "rgba(5,15,35,0.92)",
          border: `2px solid ${C.cyan}`,
          borderRadius: 24, padding: "36px 64px",
          textAlign: "center",
          boxShadow: `0 0 ${ctaGlow}px rgba(0,229,255,0.5), 0 0 ${ctaGlow * 2}px rgba(0,229,255,0.2)`,
          backdropFilter: "blur(12px)",
        }}>
          <div style={{ color: C.white, fontSize: 56, fontWeight: 900, marginBottom: 8 }}>🛒 ChinaCart</div>
          <div style={{ color: C.cyan, fontSize: 30, fontWeight: 700, marginBottom: 16 }}>আজই শুরু করুন</div>
          <div style={{
            color: C.cyan, fontSize: 44, fontWeight: 900,
            textShadow: `0 0 ${urlGlow}px rgba(0,229,255,0.9)`,
            marginBottom: 12,
          }}>
            🌐 chinacart.com.bd
          </div>
          <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`, marginBottom: 16 }} />
          <div style={{ color: C.muted, fontSize: 24 }}>বিশ্বস্ত ইমপোর্ট পার্টনার</div>
        </div>
      )}

      {/* Confetti */}
      {Array.from({ length: 60 }, (_, i) => <Confetti key={i} idx={i} />)}

      {/* Thank you */}
      <div style={{
        position: "absolute", top: 30, left: "50%", transform: "translateX(-50%)",
        opacity: thankOp, zIndex: 25,
        color: C.white, fontSize: 38, fontWeight: 600, whiteSpace: "nowrap",
        textShadow: "0 2px 12px rgba(0,0,0,0.8)",
      }}>
        ধন্যবাদ 🙏 আসসালামু আলাইকুম
      </div>

      {/* Fade to black */}
      <div style={{
        position: "absolute", inset: 0, backgroundColor: "#000",
        opacity: finalFade, zIndex: 30, pointerEvents: "none",
      }} />

      {/* Last visible: URL */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 31,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: Math.max(0, finalFade - 0.1),
      }}>
        <div style={{
          color: C.cyan, fontSize: 52, fontWeight: 900,
          textShadow: `0 0 30px rgba(0,229,255,0.9)`,
        }}>
          chinacart.com.bd
        </div>
      </div>
    </div>
  );
};
