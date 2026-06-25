import "./index.css";
import { Composition } from "remotion";
import { ChinaCartAd } from "./ChinaCartAd";

// Load Hind Siliguri (Bengali) from Google Fonts
const loadFont = () => {
  if (typeof document !== "undefined") {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700;800;900&display=swap";
    document.head.appendChild(link);
  }
};

loadFont();

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ChinaCartAd"
        component={ChinaCartAd}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
