import type { CaseDesign } from "@/components/try-case/phone-case-types";

type Ctx = CanvasRenderingContext2D;

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Draw a phone case centred at (cx,cy) sized to (w,h) — slightly larger than the
 * detected phone so it "wraps" the edges. Material changes the look.
 */
export function drawCase(
  ctx: Ctx,
  design: CaseDesign,
  color: string,
  cx: number,
  cy: number,
  w: number,
  h: number
) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const r = Math.min(w, h) * 0.16;

  ctx.save();

  // soft shadow / depth
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = w * 0.08;
  ctx.shadowOffsetY = h * 0.02;

  if (design.material === "clear") {
    // transparent case: faint tint + bright edge so the phone shows through
    roundRect(ctx, x, y, w, h, r);
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.lineWidth = Math.max(3, w * 0.035);
    ctx.strokeStyle = "rgba(255,255,255,0.65)";
    ctx.stroke();
  } else {
    roundRect(ctx, x, y, w, h, r);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowColor = "transparent";

    if (design.material === "glossy") {
      const g = ctx.createLinearGradient(x, y, x + w, y + h);
      g.addColorStop(0, "rgba(255,255,255,0.45)");
      g.addColorStop(0.35, "rgba(255,255,255,0.06)");
      g.addColorStop(1, "rgba(0,0,0,0.18)");
      roundRect(ctx, x, y, w, h, r);
      ctx.fillStyle = g;
      ctx.fill();
    } else if (design.material === "silicone") {
      // matte: subtle inner highlight
      const g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, "rgba(255,255,255,0.12)");
      g.addColorStop(1, "rgba(0,0,0,0.12)");
      roundRect(ctx, x, y, w, h, r);
      ctx.fillStyle = g;
      ctx.fill();
    } else if (design.material === "leather") {
      // textured stitching + grain
      ctx.save();
      roundRect(ctx, x, y, w, h, r);
      ctx.clip();
      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      ctx.lineWidth = 1;
      for (let i = 0; i < h; i += 6) {
        ctx.beginPath();
        ctx.moveTo(x, y + i + ((i / 6) % 2));
        ctx.lineTo(x + w, y + i);
        ctx.stroke();
      }
      ctx.restore();
      // stitching border
      ctx.setLineDash([w * 0.04, w * 0.025]);
      ctx.lineWidth = Math.max(1.5, w * 0.012);
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      roundRect(ctx, x + w * 0.05, y + h * 0.03, w * 0.9, h * 0.94, r * 0.7);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (design.material === "rugged") {
      // thick bumper corners
      ctx.lineWidth = Math.max(4, w * 0.07);
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      roundRect(ctx, x, y, w, h, r);
      ctx.stroke();
    }
  }

  // camera module cutout (top-left island)
  const camW = w * 0.34;
  const camH = camW * 0.95;
  const camX = x + w * 0.07;
  const camY = y + h * 0.04;
  roundRect(ctx, camX, camY, camW, camH, camW * 0.28);
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fill();
  // lenses
  const lensR = camW * 0.16;
  ctx.fillStyle = "rgba(20,20,28,0.95)";
  for (const [lx, ly] of [
    [camX + camW * 0.3, camY + camH * 0.32],
    [camX + camW * 0.7, camY + camH * 0.32],
    [camX + camW * 0.3, camY + camH * 0.7],
  ]) {
    ctx.beginPath();
    ctx.arc(lx, ly, lensR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.restore();
}
