/**
 * Procedurally-drawn sunglasses overlays.
 *
 * We draw the glasses as vector shapes on the canvas (transparent, tinted
 * lenses + frame) rather than compositing a product photo, because catalog
 * images aren't background-removed cutouts. Each style is drawn into a unit
 * space centred at (0,0), `width` wide; the caller handles translate/rotate
 * to lock it onto the detected eyes. To use a real transparent PNG instead,
 * add a style whose `draw` blits an Image.
 */

export interface GlassesStyle {
  id: string;
  name: string;
  frame: string;
  lens: string;
}

export const GLASSES_STYLES: GlassesStyle[] = [
  { id: "classic", name: "Classic Black", frame: "#111111", lens: "rgba(20,20,20,0.62)" },
  { id: "aviator", name: "Gold Aviator", frame: "#c9a227", lens: "rgba(90,60,10,0.55)" },
  { id: "round", name: "Retro Round", frame: "#5b3a1a", lens: "rgba(80,40,20,0.5)" },
  { id: "sport", name: "Sport Red", frame: "#c0392b", lens: "rgba(40,10,10,0.6)" },
  { id: "navy", name: "Navy Wayfarer", frame: "#1a2f5e", lens: "rgba(15,25,55,0.6)" },
];

type Ctx = CanvasRenderingContext2D;

function lens(ctx: Ctx, cx: number, r: number, h: number, style: GlassesStyle, round: boolean) {
  ctx.beginPath();
  if (round) {
    ctx.arc(cx, 0, r, 0, Math.PI * 2);
  } else {
    const w = r;
    const rad = h * 0.45;
    // rounded rectangle lens
    ctx.moveTo(cx - w + rad, -h);
    ctx.arcTo(cx + w, -h, cx + w, h, rad);
    ctx.arcTo(cx + w, h, cx - w, h, rad);
    ctx.arcTo(cx - w, h, cx - w, -h, rad);
    ctx.arcTo(cx - w, -h, cx + w, -h, rad);
  }
  ctx.closePath();
  // tinted lens
  ctx.fillStyle = style.lens;
  ctx.fill();
  // subtle glossy highlight
  const g = ctx.createLinearGradient(cx - r, -h, cx + r, h);
  g.addColorStop(0, "rgba(255,255,255,0.28)");
  g.addColorStop(0.4, "rgba(255,255,255,0.05)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fill();
  // frame
  ctx.lineWidth = Math.max(2, r * 0.18);
  ctx.strokeStyle = style.frame;
  ctx.stroke();
}

/**
 * Draw glasses centred at the current canvas origin, oriented along +x.
 * `width` = full glasses width (≈ a bit wider than the eyes span).
 */
export function drawGlasses(ctx: Ctx, style: GlassesStyle, width: number) {
  const half = width / 2;
  const lensR = width * 0.23; // lens radius
  const lensH = width * 0.17;
  const offset = width * 0.27; // distance of each lens centre from middle
  const round = style.id === "round" || style.id === "aviator";

  ctx.save();

  // soft drop shadow under the glasses
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = width * 0.06;
  ctx.shadowOffsetY = width * 0.05;

  // arms
  ctx.lineWidth = Math.max(2, width * 0.03);
  ctx.strokeStyle = style.frame;
  ctx.beginPath();
  ctx.moveTo(-half - lensR, -lensH * 0.2);
  ctx.lineTo(-half + offset - lensR, -lensH * 0.5);
  ctx.moveTo(half + lensR, -lensH * 0.2);
  ctx.lineTo(half - offset + lensR, -lensH * 0.5);
  ctx.stroke();

  // bridge
  ctx.beginPath();
  ctx.moveTo(-offset + lensR * 0.7, -lensH * 0.2);
  ctx.quadraticCurveTo(0, -lensH * 0.7, offset - lensR * 0.7, -lensH * 0.2);
  ctx.stroke();

  // lenses (shadow only on first fill pass)
  lens(ctx, -offset, lensR, lensH, style, round);
  ctx.shadowColor = "transparent";
  lens(ctx, offset, lensR, lensH, style, round);

  ctx.restore();
}
