"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  X,
  Camera,
  Loader2,
  Download,
  Share2,
  ShoppingCart,
  RefreshCw,
  SwitchCamera,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import { formatBDT, cn } from "@/lib/utils";
import { drawCase } from "@/components/try-case/case-render";
import {
  CASE_DESIGNS,
  CASE_COLORS,
  PHONE_MODELS,
} from "@/components/try-case/phone-case-types";
import type { Product } from "@/data/products";

type Phase = "intro" | "loading" | "scanning" | "ar" | "fallback" | "error";

const INSTRUCTIONS = [
  { en: "Hold your phone facing the camera", bn: "আপনার ফোন ক্যামেরার সামনে ধরুন" },
  { en: "Make sure your phone is well lit", bn: "ফোনে যথেষ্ট আলো আছে কিনা নিশ্চিত করুন" },
  { en: "Keep the phone steady for best results", bn: "ভালো ফলাফলের জন্য ফোন স্থির রাখুন" },
  { en: "Flip the camera to use the back camera", bn: "পেছনের ক্যামেরা ব্যবহারে ক্যামেরা পরিবর্তন করুন" },
];

const LOADING_MSGS = [
  "Preparing your fitting room…",
  "Loading case designs…",
  "Calibrating AR camera…",
];

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Detection {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}
interface ObjectDetector {
  detect: (input: HTMLVideoElement, maxNumBoxes?: number) => Promise<Detection[]>;
}

export default function TryCaseModal({
  product,
  onClose,
}: {
  product?: Product;
  onClose: () => void;
}) {
  const router = useRouter();
  const { addItem } = useCart();

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const rafRef = React.useRef(0);
  const detectingRef = React.useRef(true);
  const modelRef = React.useRef<ObjectDetector | null>(null);
  const targetRef = React.useRef<Box | null>(null);
  const smoothRef = React.useRef<Box | null>(null);
  const facingRef = React.useRef<"user" | "environment">("user");

  const [phase, setPhase] = React.useState<Phase>("intro");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [loadMsg, setLoadMsg] = React.useState(0);
  const [design, setDesign] = React.useState(0);
  const [color, setColor] = React.useState(0);
  const [model, setModel] = React.useState(0);
  const [detected, setDetected] = React.useState(false);
  const [photo, setPhoto] = React.useState<string | null>(null);
  const [recs, setRecs] = React.useState<Product[]>([]);
  const [fallbackAngle, setFallbackAngle] = React.useState<"back" | "front">("back");

  const designRef = React.useRef(design);
  const colorRef = React.useRef(color);
  designRef.current = design;
  colorRef.current = color;

  React.useEffect(() => {
    fetch("/api/products?category=mobile-accessories")
      .then((r) => r.json())
      .then((d) => {
        const list: Product[] = Array.isArray(d.products) ? d.products : [];
        setRecs(list.filter((p) => p.id !== product?.id).slice(0, 6));
      })
      .catch(() => {});
  }, [product?.id]);

  React.useEffect(() => {
    if (phase !== "loading") return;
    const id = setInterval(
      () => setLoadMsg((m) => (m + 1) % LOADING_MSGS.length),
      900
    );
    return () => clearInterval(id);
  }, [phase]);

  const stopCamera = React.useCallback(() => {
    detectingRef.current = false;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  React.useEffect(() => () => stopCamera(), [stopCamera]);
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  async function openStream() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: facingRef.current } },
      audio: false,
    });
    streamRef.current = stream;
    const video = videoRef.current!;
    video.srcObject = stream;
    await video.play();
  }

  async function start() {
    setPhase("loading");
    setErrorMsg("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("no-cam");
      await openStream();

      // load TF.js + COCO-SSD object detector on demand
      const tf = await import("@tensorflow/tfjs");
      await tf.ready();
      const cocoSsd = await import("@tensorflow-models/coco-ssd");
      modelRef.current = await cocoSsd.load({ base: "lite_mobilenet_v2" });

      detectingRef.current = true;
      setPhase("scanning");
      runDetection();
      runRender();
    } catch (err) {
      stopCamera();
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setErrorMsg(
          "Camera permission was denied. You can still preview cases on a phone mockup."
        );
      }
      // graceful fallback to mockup preview
      setPhase("fallback");
    }
  }

  async function runDetection() {
    const loop = async () => {
      const video = videoRef.current;
      const model = modelRef.current;
      if (!detectingRef.current || !video || !model) return;
      try {
        const preds = await model.detect(video, 5);
        const phone = preds
          .filter((p) => p.class === "cell phone")
          .sort((a, b) => b.score - a.score)[0];
        if (phone && phone.score > 0.4) {
          const [x, y, w, h] = phone.bbox;
          targetRef.current = { x, y, w, h };
          if (!detected) {
            setDetected(true);
            setPhase("ar");
          }
        }
      } catch {
        /* keep last box */
      }
      if (detectingRef.current) setTimeout(loop, 90);
    };
    loop();
  }

  function runRender() {
    const render = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const vw = video.videoWidth || 1280;
          const vh = video.videoHeight || 720;
          if (canvas.width !== vw || canvas.height !== vh) {
            canvas.width = vw;
            canvas.height = vh;
          }
          const mirror = facingRef.current === "user";
          ctx.save();
          ctx.clearRect(0, 0, vw, vh);
          if (mirror) {
            ctx.translate(vw, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(video, 0, 0, vw, vh);

          const target = targetRef.current;
          if (target) {
            const s = smoothRef.current ?? target;
            const k = 0.3;
            const sm: Box = {
              x: s.x + (target.x - s.x) * k,
              y: s.y + (target.y - s.y) * k,
              w: s.w + (target.w - s.w) * k,
              h: s.h + (target.h - s.h) * k,
            };
            smoothRef.current = sm;
            drawCase(
              ctx,
              CASE_DESIGNS[designRef.current],
              CASE_COLORS[colorRef.current].hex,
              sm.x + sm.w / 2,
              sm.y + sm.h / 2,
              sm.w * 1.07,
              sm.h * 1.04
            );
          }
          ctx.restore();
        }
      }
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
  }

  async function flipCamera() {
    facingRef.current = facingRef.current === "user" ? "environment" : "user";
    streamRef.current?.getTracks().forEach((t) => t.stop());
    try {
      await openStream();
    } catch {
      /* ignore */
    }
  }

  // mockup fallback rendering (no camera)
  const renderMockup = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = (canvas.width = 720);
    const H = (canvas.height = 1000);
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#12182a";
    ctx.fillRect(0, 0, W, H);

    const aspect = PHONE_MODELS[model].aspect;
    const ph = H * 0.72;
    const pw = ph / aspect;
    const cx = W / 2;
    const cy = H / 2;

    if (fallbackAngle === "front") {
      // phone screen visible (case rim around)
      ctx.save();
      ctx.fillStyle = "#0a0a0f";
      const r = pw * 0.12;
      ctx.beginPath();
      ctx.roundRect(cx - pw / 2, cy - ph / 2, pw, ph, r);
      ctx.fill();
      ctx.fillStyle = "#1b2236";
      ctx.beginPath();
      ctx.roundRect(cx - pw / 2 + 10, cy - ph / 2 + 10, pw - 20, ph - 20, r * 0.8);
      ctx.fill();
      ctx.strokeStyle = CASE_COLORS[color].hex;
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.roundRect(cx - pw / 2, cy - ph / 2, pw, ph, r);
      ctx.stroke();
      ctx.restore();
    } else {
      // back of phone fully cased
      drawCase(ctx, CASE_DESIGNS[design], CASE_COLORS[color].hex, cx, cy, pw, ph);
    }
  }, [model, design, color, fallbackAngle]);

  React.useEffect(() => {
    if (phase === "fallback") renderMockup();
  }, [phase, renderMockup]);

  function takePhoto() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const out = document.createElement("canvas");
    out.width = canvas.width;
    out.height = canvas.height;
    const ctx = out.getContext("2d")!;
    ctx.drawImage(canvas, 0, 0);
    ctx.font = `${Math.round(out.width * 0.04)}px sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.textBaseline = "bottom";
    ctx.fillText("ChinaCart", out.width * 0.04, out.height - out.width * 0.04);
    setPhoto(out.toDataURL("image/png"));
  }

  async function sharePhoto() {
    if (!photo) return;
    const caption = "My new phone case from ChinaCart! 📱";
    try {
      const blob = await (await fetch(photo)).blob();
      const file = new File([blob], "chinacart-case.png", { type: "image/png" });
      const nav = navigator as Navigator & {
        canShare?: (d: { files: File[] }) => boolean;
      };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: "ChinaCart", text: caption });
        return;
      }
    } catch {
      /* fall through */
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, "_blank");
  }
  function downloadPhoto() {
    if (!photo) return;
    const a = document.createElement("a");
    a.href = photo;
    a.download = "chinacart-case.png";
    a.click();
  }
  function buyNow() {
    if (!product) {
      router.push("/products?category=mobile-accessories");
      onClose();
      return;
    }
    addItem(product);
    onClose();
    router.push("/checkout");
  }
  function close() {
    stopCamera();
    onClose();
  }

  const interactive = phase === "ar" || phase === "fallback";
  const showVideo = phase === "ar" || phase === "scanning";

  return (
    <div className="fixed inset-0 z-[150] flex flex-col bg-black text-white">
      <video ref={videoRef} playsInline muted className="hidden" />

      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-gold" />
          <span className="font-bold">Try On Case 📱</span>
        </div>
        <div className="flex items-center gap-2">
          {showVideo && (
            <button
              onClick={flipCamera}
              aria-label="Flip camera"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur hover:bg-white/20"
            >
              <SwitchCamera className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={close}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {(showVideo || phase === "fallback") && (
          <canvas ref={canvasRef} className="h-full w-full object-contain" />
        )}

        {/* Intro */}
        {phase === "intro" && (
          <div className="max-w-sm px-6 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold to-brand text-black">
              <Camera className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-extrabold">Try a case on your phone 📱</h2>
            <p className="mt-2 text-sm text-white/70">
              Hold your phone up to the camera and we&apos;ll fit the case onto it
              live. Nothing is recorded — it all stays on your device.
            </p>
            <div className="mt-4 space-y-1 rounded-xl bg-white/5 p-3 text-left text-xs text-white/70">
              {INSTRUCTIONS.map((i) => (
                <p key={i.en}>
                  • {i.en} <span className="text-white/40">— {i.bn}</span>
                </p>
              ))}
            </div>
            <Button variant="gold" size="lg" className="mt-5 w-full" onClick={start}>
              <Camera className="h-4 w-4" /> Allow Camera &amp; Start
            </Button>
            <button onClick={onClose} className="mt-3 text-sm text-white/50 hover:text-white">
              Maybe later
            </button>
          </div>
        )}

        {/* Loading */}
        {phase === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70">
            <div className="case-spin text-5xl">📱</div>
            <p className="text-sm font-medium text-white/85">{LOADING_MSGS[loadMsg]}</p>
          </div>
        )}

        {/* Scanning */}
        {phase === "scanning" && (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
            <div className="relative h-[52vh] max-h-[460px] w-[60vw] max-w-[260px] animate-pulse rounded-3xl border-4 border-gold/70" />
            <div className="mt-4 flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 backdrop-blur">
              <span className="ar-scan-dot" />
              <span className="ar-scan-dot" style={{ animationDelay: "0.2s" }} />
              <span className="ar-scan-dot" style={{ animationDelay: "0.4s" }} />
              <span className="ml-1 text-sm font-medium">Detecting your phone…</span>
            </div>
          </div>
        )}

        {/* Error (rare; we usually fall back) */}
        {phase === "error" && (
          <div className="max-w-sm px-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-400" />
            <p className="mt-3 text-sm text-white/70">{errorMsg}</p>
            <Button variant="gold" className="mt-5" onClick={start}>
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
          </div>
        )}

        {/* Detected flash */}
        {phase === "ar" && (
          <div className="pointer-events-none absolute left-1/2 top-20 z-20 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-green-500/20 px-4 py-1.5 text-sm font-semibold text-green-300 backdrop-blur">
            <CheckCircle2 className="h-4 w-4" /> Phone detected — perfect fit!
          </div>
        )}

        {/* Fallback notice */}
        {phase === "fallback" && (
          <div className="pointer-events-none absolute left-1/2 top-20 z-20 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur">
            360° preview {errorMsg ? "(camera unavailable)" : "(AR not supported)"}
          </div>
        )}

        {/* Captured photo */}
        {photo && (
          <div className="absolute inset-0 z-30 flex flex-col bg-black/95">
            <div className="flex flex-1 items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="Case preview" className="max-h-full max-w-full rounded-xl object-contain" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 p-4">
              <Button variant="gold" onClick={sharePhoto}>
                <Share2 className="h-4 w-4" /> Share
              </Button>
              <Button
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white hover:text-black"
                onClick={downloadPhoto}
              >
                <Download className="h-4 w-4" /> Save
              </Button>
              <Button onClick={() => setPhoto(null)}>
                <RefreshCw className="h-4 w-4" /> Retake
              </Button>
              <Button variant="gold" onClick={buyNow}>
                <ShoppingCart className="h-4 w-4" /> Buy Now
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {interactive && !photo && (
        <div className="relative z-20 space-y-3 bg-gradient-to-t from-black via-black/90 to-transparent p-4 pb-6">
          {/* fit / model row */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-1 font-semibold text-green-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Drop protection {CASE_DESIGNS[design].protection}/5
            </span>
            <select
              value={model}
              onChange={(e) => {
                setModel(Number(e.target.value));
              }}
              className="rounded-full border border-white/25 bg-black/40 px-3 py-1 text-xs font-medium focus:outline-none"
            >
              {PHONE_MODELS.map((m, i) => (
                <option key={m.id} value={i} className="bg-black">
                  {m.name}
                </option>
              ))}
            </select>
            {phase === "fallback" && (
              <div className="flex gap-1">
                {(["back", "front"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setFallbackAngle(a)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                      fallbackAngle === a ? "bg-gold text-black" : "bg-white/10"
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* design switcher */}
          <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto">
            {CASE_DESIGNS.map((dsn, i) => (
              <button
                key={dsn.id}
                onClick={() => setDesign(i)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  i === design
                    ? "border-gold bg-gold text-black"
                    : "border-white/25 text-white/80 hover:border-white/60"
                )}
              >
                {dsn.name}
              </button>
            ))}
          </div>

          {/* colour dots */}
          <div className="flex justify-center gap-2">
            {CASE_COLORS.map((c, i) => (
              <button
                key={c.hex}
                onClick={() => setColor(i)}
                aria-label={c.name}
                className={cn(
                  "h-7 w-7 rounded-full border-2",
                  i === color ? "border-gold" : "border-white/30"
                )}
                style={{ background: c.hex }}
              />
            ))}
          </div>

          {/* actions */}
          <div className="flex items-center justify-center gap-3">
            <Button variant="gold" size="lg" className="rounded-full px-6" onClick={takePhoto}>
              <Camera className="h-5 w-5" /> Take Photo
            </Button>
            {product && (
              <Button size="lg" className="rounded-full" onClick={buyNow}>
                <ShoppingCart className="h-4 w-4" /> {formatBDT(product.priceMin)}
              </Button>
            )}
          </div>

          {/* recommendations */}
          {recs.length > 0 && (
            <div>
              <p className="mb-1.5 text-center text-[11px] uppercase tracking-wide text-white/50">
                Recommended cases
              </p>
              <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto">
                {recs.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    onClick={close}
                    className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/20"
                  >
                    <Image src={p.images[0]} alt={p.name} fill sizes="48px" className="object-cover" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
