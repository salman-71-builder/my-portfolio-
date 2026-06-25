import { interpolate, spring } from "remotion";

// Fast punchy spring — overshoots 1.15 before settling
export const punchSpring = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { stiffness: 260, damping: 11, mass: 0.7 }, durationInFrames: 22 });

// Ultra-fast snap spring
export const snapSpring = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { stiffness: 320, damping: 12, mass: 0.6 }, durationInFrames: 18 });

// Overshoot: peaks at 1.15 then settles to 1.0
export const overshootScale = (sc: number) =>
  interpolate(sc, [0, 0.7, 1], [0, 1.18, 1.0]);

// Letter spacing: wide → snap to 0
export const letterSpacingSnap = (sc: number) =>
  `${interpolate(sc, [0, 1], [0.35, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}em`;

// Continuous drift Y ±3px (momentum feel)
export const driftY = (frame: number, offset = 0) =>
  Math.sin((frame + offset) * 0.06) * 3;

// Glow pulse — loops continuously
export const glowPulse = (frame: number, base: number, range: number, speed = 0.12) =>
  base + Math.sin(frame * speed) * range;

// Radial background breathe opacity
export const breatheOp = (frame: number, base = 0.09, range = 0.04, speed = 0.08) =>
  base + Math.sin(frame * speed) * range;

// Pulsing text glow string
export const textGlow = (frame: number, color: string, baseSize = 18, rangeSize = 8) => {
  const g = glowPulse(frame, baseSize, rangeSize);
  return `0 0 ${g}px ${color}, 0 0 ${g * 1.8}px ${color}66`;
};

// Impact flash: 1 at frame N, 0 by N+2
export const impactFlash = (frame: number, atFrame: number) =>
  interpolate(frame, [atFrame, atFrame + 1, atFrame + 2], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// Slide-in slam from direction
export const slamX = (sc: number, fromRight = true) =>
  interpolate(sc, [0, 1], [fromRight ? 180 : -180, 0]);

export const slamY = (sc: number, fromBottom = true) =>
  interpolate(sc, [0, 1], [fromBottom ? 100 : -100, 0]);
