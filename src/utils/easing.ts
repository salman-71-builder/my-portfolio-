// After Effects–style easing functions.
// All take normalized t (0→1) and return eased 0→1 (except overshoot which can exceed 1).

export const easeInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeIn = (t: number): number => t * t * t * t;

export const easeOut = (t: number): number => 1 - Math.pow(1 - t, 4);

// Sine ease-out — gentle, used for morph progress.
export const easeOutSine = (t: number): number => Math.sin((t * Math.PI) / 2);

// Elastic overshoot — springy settle past 1 then back.
export const overshoot = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -8 * t) * Math.sin((t * 8 - 0.75) * c4) + 1;
};

// Back ease-out — slight overshoot then settle (AE "ease out + overshoot").
export const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// Expo ease-out — very snappy arrival.
export const easeOutExpo = (t: number): number =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
