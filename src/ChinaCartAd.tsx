import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Scam } from "./scenes/Scene2Scam";
import { Scene3Solution } from "./scenes/Scene3Solution";

export const ChinaCartAd: React.FC = () => {
  const frame = useCurrentFrame();
  void frame; // used by child scenes via useCurrentFrame

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0E1A" }}>
      {/* Scene 1: frames 0–79 */}
      <Sequence from={0} durationInFrames={80}>
        <Scene1Hook />
      </Sequence>

      {/* Scene 2: frames 80–189 — component receives frame offset by Sequence */}
      <Sequence from={80} durationInFrames={110}>
        <Scene2Scam />
      </Sequence>

      {/* Scene 3: frames 190–239 */}
      <Sequence from={190} durationInFrames={50}>
        <Scene3Solution />
      </Sequence>
    </AbsoluteFill>
  );
};
