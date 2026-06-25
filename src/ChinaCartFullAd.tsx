import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { Scene1Bait } from "./scenes/Scene1Bait";
import { Scene2RealityCheck } from "./scenes/Scene2RealityCheck";
import { Scene3Warning } from "./scenes/Scene3Warning";
import { Scene4Process } from "./scenes/Scene4Process";
import { Scene5Trust } from "./scenes/Scene5Trust";
import { Scene6Brand } from "./scenes/Scene6Brand";
import { Scene7HowItWorks } from "./scenes/Scene7HowItWorks";
import { Scene8GrandClose } from "./scenes/Scene8GrandClose";

// Segment timing (global frames)
// S1: 0–299     (300f)  THE BAIT
// [black: 300–301]
// S2: 302–841   (540f)  REALITY CHECK
// [black: 842–843]
// S3: 844–1533  (690f)  WARNING
// [black: 1534–1535]
// S4: 1536–2315 (780f)  PROCESS
// [black: 2316–2317]
// S5: 2318–2737 (420f)  TRUST
// [black: 2738–2739]
// S6: 2740–3219 (480f)  BRAND
// [black: 3220–3221]
// S7: 3222–3611 (390f)  HOW IT WORKS
// [black: 3612–3613]
// S8: 3614–4500 (887f)  GRAND CLOSE (padded to hit 4500)

// Impact black frame between scenes
const ImpactBlack: React.FC<{ atFrame: number }> = ({ atFrame }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [atFrame, atFrame + 1, atFrame + 2], [0, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <div style={{
      position: "absolute", inset: 0,
      backgroundColor: "#000",
      opacity, pointerEvents: "none", zIndex: 200,
    }} />
  );
};

export const ChinaCartFullAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0E1A" }}>
      <Sequence from={0}    durationInFrames={300}><Scene1Bait /></Sequence>
      <Sequence from={302}  durationInFrames={540}><Scene2RealityCheck /></Sequence>
      <Sequence from={844}  durationInFrames={690}><Scene3Warning /></Sequence>
      <Sequence from={1536} durationInFrames={780}><Scene4Process /></Sequence>
      <Sequence from={2318} durationInFrames={420}><Scene5Trust /></Sequence>
      <Sequence from={2740} durationInFrames={480}><Scene6Brand /></Sequence>
      <Sequence from={3222} durationInFrames={390}><Scene7HowItWorks /></Sequence>
      <Sequence from={3614} durationInFrames={887}><Scene8GrandClose /></Sequence>

      {/* Cinematic black impact frames at each transition */}
      <ImpactBlack atFrame={299} />
      <ImpactBlack atFrame={841} />
      <ImpactBlack atFrame={1533} />
      <ImpactBlack atFrame={2315} />
      <ImpactBlack atFrame={2737} />
      <ImpactBlack atFrame={3219} />
      <ImpactBlack atFrame={3611} />
    </AbsoluteFill>
  );
};
