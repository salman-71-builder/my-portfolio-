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
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import { formatBDT } from "@/lib/utils";
import { GLASSES_STYLES, drawGlasses } from "@/components/try-on/glasses-styles";
import type { Product } from "@/data/products";

const MODEL_URL =
  process.env.NEXT_PUBLIC_FACEAPI_MODELS ||
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";

type Phase = "intro" | "loading" | "active" | "error";

interface Transform {
  cx: number;
  cy: number;
  dist: number;
  angle: number;
}

export default function TryOnModal({
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
  const targetRef = React.useRef<Transform | null>(null);
  const smoothRef = React.useRef<Transform | null>(null);

  const [phase, setPhase] = React.useState<Phase>("intro");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [styleIndex, setStyleIndex] = React.useState(0);
  const [sizeScale, setSizeScale] = React.useState(1);
  const [vOffset, setVOffset] = React.useState(0);
  const [photo, setPhoto] = React.useState<string | null>(null);
  const [recs, setRecs] = React.useState<Product[]>([]);

  const styleRef = React.useRef(styleIndex);
  const sizeRef = React.useRef(sizeScale);
  const offRef = React.useRef(vOffset);
  styleRef.current = styleIndex;
  sizeRef.current = sizeScale;
  offRef.current = vOffset;

  // recommended sunglasses
  React.useEffect(() => {
    fetch("/api/products?category=sunglasses")
      .then((r) => r.json())
      .then((d) => {
        const list: Product[] = Array.isArray(d.products) ? d.products : [];
        setRecs(list.filter((p) => p.id !== product?.id).slice(0, 6));
      })
      .catch(() => {});
  }, [product?.id]);

  const stop = React.useCallback(() => {
    detectingRef.current = false;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  React.useEffect(() => () => stop(), [stop]);

  // lock background scroll
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  async function start() {
    setPhase("loading");
    setErrorMsg("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Your browser doesn't support camera access.");
      }
      // 1) camera (front/selfie)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();

      // 2) face-api models (loaded on demand)
      const faceapi = await import("@vladmandic/face-api");
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

      detectingRef.current = true;
      setPhase("active");
      runDetection(faceapi);
      runRender();
    } catch (err) {
      stop();
      const msg =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera permission was denied. Please allow camera access and try again."
          : err instanceof Error
            ? err.message
            : "Could not start the camera.";
      setErrorMsg(msg);
      setPhase("error");
    }
  }

  // detection loop (decoupled from render for smoothness)
  async function runDetection(faceapi: typeof import("@vladmandic/face-api")) {
    const opts = new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,
      scoreThreshold: 0.4,
    });
    const loop = async () => {
      const video = videoRef.current;
      if (!detectingRef.current || !video) return;
      try {
        const res = await faceapi
          .detectSingleFace(video, opts)
          .withFaceLandmarks();
        if (res) {
          const lm = res.landmarks;
          const le = lm.getLeftEye();
          const re = lm.getRightEye();
          const avg = (pts: { x: number; y: number }[]) =>
            pts.reduce(
              (a, p) => ({ x: a.x + p.x / pts.length, y: a.y + p.y / pts.length }),
              { x: 0, y: 0 }
            );
          const l = avg(le);
          const r = avg(re);
          const dx = r.x - l.x;
          const dy = r.y - l.y;
          targetRef.current = {
            cx: (l.x + r.x) / 2,
            cy: (l.y + r.y) / 2,
            dist: Math.hypot(dx, dy),
            angle: Math.atan2(dy, dx),
          };
        }
      } catch {
        /* transient detection error — keep last transform */
      }
      if (detectingRef.current) setTimeout(loop, 60); // ~16 detections/sec
    };
    loop();
  }

  // render loop (smooth 60fps)
  function runRender() {
    const render = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const vw = video.videoWidth || 1280;
      const vh = video.videoHeight || 720;
      if (canvas.width !== vw || canvas.height !== vh) {
        canvas.width = vw;
        canvas.height = vh;
      }

      ctx.save();
      ctx.clearRect(0, 0, vw, vh);
      // mirror (selfie view)
      ctx.translate(vw, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, vw, vh);

      const target = targetRef.current;
      if (target) {
        // smooth toward target to remove jitter
        const s = smoothRef.current ?? target;
        const k = 0.35;
        const sm: Transform = {
          cx: s.cx + (target.cx - s.cx) * k,
          cy: s.cy + (target.cy - s.cy) * k,
          dist: s.dist + (target.dist - s.dist) * k,
          angle: s.angle + (target.angle - s.angle) * k,
        };
        smoothRef.current = sm;

        const width = sm.dist * 2.55 * sizeRef.current;
        ctx.save();
        ctx.translate(sm.cx, sm.cy + sm.dist * 0.1 + offRef.current * sm.dist);
        ctx.rotate(sm.angle);
        drawGlasses(ctx, GLASSES_STYLES[styleRef.current], width);
        ctx.restore();
      }
      ctx.restore();

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
  }

  function takePhoto() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setPhoto(canvas.toDataURL("image/png"));
  }

  async function sharePhoto() {
    if (!photo) return;
    try {
      const blob = await (await fetch(photo)).blob();
      const file = new File([blob], "chinacart-tryon.png", { type: "image/png" });
      const nav = navigator as Navigator & {
        canShare?: (d: { files: File[] }) => boolean;
      };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: "My ChinaCart look 😎" });
        return;
      }
    } catch {
      /* fall through to link sharing */
    }
    const text = encodeURIComponent("Check out my look on ChinaCart! 😎👓");
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function downloadPhoto() {
    if (!photo) return;
    const a = document.createElement("a");
    a.href = photo;
    a.download = "chinacart-tryon.png";
    a.click();
  }

  function buyNow() {
    if (!product) {
      router.push("/products?category=sunglasses");
      onClose();
      return;
    }
    addItem(product);
    onClose();
    router.push("/checkout");
  }

  return (
    <div className="fixed inset-0 z-[150] flex flex-col bg-black text-white">
      {/* hidden source video */}
      <video ref={videoRef} playsInline muted className="hidden" />

      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold" />
          <span className="font-bold">Virtual Try-On</span>
        </div>
        <button
          onClick={() => {
            stop();
            onClose();
          }}
          aria-label="Close try-on"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Stage */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {/* Camera canvas */}
        {(phase === "active" || phase === "loading") && (
          <canvas
            ref={canvasRef}
            className="h-full w-full object-contain"
          />
        )}

        {/* Intro / permission */}
        {phase === "intro" && (
          <div className="max-w-sm px-6 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold to-brand text-black">
              <Camera className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-extrabold">Try these on, live 👓</h2>
            <p className="mt-2 text-sm text-white/70">
              We&apos;ll use your camera to place the sunglasses on your face in
              real time. Nothing is recorded or uploaded — everything stays on
              your device.
            </p>
            <Button variant="gold" size="lg" className="mt-6 w-full" onClick={start}>
              <Camera className="h-4 w-4" /> Allow Camera &amp; Start
            </Button>
            <button
              onClick={onClose}
              className="mt-3 text-sm text-white/50 hover:text-white"
            >
              Maybe later
            </button>
          </div>
        )}

        {phase === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <p className="text-sm text-white/80">Loading face tracking…</p>
          </div>
        )}

        {phase === "error" && (
          <div className="max-w-sm px-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-400" />
            <h2 className="mt-3 text-xl font-bold">Camera unavailable</h2>
            <p className="mt-2 text-sm text-white/70">{errorMsg}</p>
            <Button variant="gold" className="mt-5" onClick={start}>
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
          </div>
        )}

        {/* "You look great" flash */}
        {phase === "active" && !photo && (
          <div className="pointer-events-none absolute bottom-28 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-sm font-semibold text-gold backdrop-blur">
            You look great! ✨
          </div>
        )}

        {/* Captured photo preview */}
        {photo && (
          <div className="absolute inset-0 z-30 flex flex-col bg-black/90">
            <div className="flex flex-1 items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt="Your try-on"
                className="max-h-full max-w-full rounded-xl object-contain"
              />
            </div>
            <p className="text-center text-lg font-bold text-gold">
              You look great! 😎
            </p>
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
      {phase === "active" && !photo && (
        <div className="relative z-20 space-y-3 bg-gradient-to-t from-black via-black/90 to-transparent p-4 pb-6">
          {/* style switcher */}
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {GLASSES_STYLES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStyleIndex(i)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  i === styleIndex
                    ? "border-gold bg-gold text-black"
                    : "border-white/25 text-white/80 hover:border-white/60"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* sliders */}
          <div className="grid grid-cols-2 gap-4">
            <label className="text-xs text-white/70">
              Size
              <input
                type="range"
                min={0.7}
                max={1.4}
                step={0.01}
                value={sizeScale}
                onChange={(e) => setSizeScale(Number(e.target.value))}
                className="mt-1 w-full accent-gold"
              />
            </label>
            <label className="text-xs text-white/70">
              Position
              <input
                type="range"
                min={-0.25}
                max={0.25}
                step={0.01}
                value={vOffset}
                onChange={(e) => setVOffset(Number(e.target.value))}
                className="mt-1 w-full accent-gold"
              />
            </label>
          </div>

          {/* actions */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="gold"
              size="lg"
              className="rounded-full px-6"
              onClick={takePhoto}
            >
              <Camera className="h-5 w-5" /> Take Photo
            </Button>
            {product && (
              <Button
                size="lg"
                className="rounded-full"
                onClick={buyNow}
              >
                <ShoppingCart className="h-4 w-4" /> {formatBDT(product.priceMin)}
              </Button>
            )}
          </div>

          {/* recommendations */}
          {recs.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] uppercase tracking-wide text-white/50">
                Try similar styles
              </p>
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {recs.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    onClick={() => {
                      stop();
                      onClose();
                    }}
                    className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/20"
                  >
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
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
