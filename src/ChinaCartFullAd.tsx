import { AbsoluteFill, Sequence } from "remotion";
import { Scene1Bait } from "./scenes/Scene1Bait";
import { Scene2RealityCheck } from "./scenes/Scene2RealityCheck";
import { Scene3Warning } from "./scenes/Scene3Warning";
import { Scene4Process } from "./scenes/Scene4Process";
import { Scene5Trust } from "./scenes/Scene5Trust";
import { Scene6Brand } from "./scenes/Scene6Brand";
import { Scene7HowItWorks } from "./scenes/Scene7HowItWorks";
import { Scene8GrandClose } from "./scenes/Scene8GrandClose";

// Segment timing (frames)
// S1: 0–300     (300f / 10s)  THE BAIT
// S2: 330–870   (540f / 18s)  REALITY CHECK
// S3: 900–1590  (690f / 23s)  WARNING
// S4: 1620–2400 (780f / 26s)  PROCESS
// S5: 2430–2850 (420f / 14s)  TRUST
// S6: 2880–3360 (480f / 16s)  BRAND
// S7: 3390–3780 (390f / 13s)  HOW IT WORKS
// S8: 3810–4500 (690f / 23s)  GRAND CLOSE

export const ChinaCartFullAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0E1A" }}>
      <Sequence from={0}    durationInFrames={300}><Scene1Bait /></Sequence>
      <Sequence from={330}  durationInFrames={540}><Scene2RealityCheck /></Sequence>
      <Sequence from={900}  durationInFrames={690}><Scene3Warning /></Sequence>
      <Sequence from={1620} durationInFrames={780}><Scene4Process /></Sequence>
      <Sequence from={2430} durationInFrames={420}><Scene5Trust /></Sequence>
      <Sequence from={2880} durationInFrames={480}><Scene6Brand /></Sequence>
      <Sequence from={3390} durationInFrames={390}><Scene7HowItWorks /></Sequence>
      <Sequence from={3810} durationInFrames={690}><Scene8GrandClose /></Sequence>
    </AbsoluteFill>
  );
};
