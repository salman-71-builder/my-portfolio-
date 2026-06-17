"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import {
  X,
  Camera,
  Loader2,
  Download,
  Share2,
  ShoppingCart,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Move,
  AlertTriangle,
  Ruler,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import { formatBDT } from "@/lib/utils";
import { buildFurniture, tintFurniture } from "@/components/ar-room/furniture-models";
import {
  detectFurnitureType,
  COLOR_VARIANTS,
  type Dims,
} from "@/components/ar-room/furniture-types";
import type { Product } from "@/data/products";

type Phase = "intro" | "loading" | "scanning" | "ar" | "viewer" | "error";

const TIPS = [
  "Point your camera at a flat floor 📷",
  "Make sure the room is well lit 💡",
  "Move the camera slowly for best results 🐢",
  "Drag to move • pinch to resize • twist to rotate",
];

export default function ArRoomModal({
  product,
  onClose,
}: {
  product?: Product;
  onClose: () => void;
}) {
  const router = useRouter();
  const { addItem } = useCart();

  const wrapRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const mountRef = React.useRef<HTMLDivElement>(null);

  // three refs
  const rendererRef = React.useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = React.useRef<THREE.Scene | null>(null);
  const camRef = React.useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = React.useRef<THREE.Group | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const rafRef = React.useRef(0);
  const modeRef = React.useRef<"ar" | "viewer">("ar");

  // interaction state (refs so the render loop reads latest without re-binding)
  const posRef = React.useRef(new THREE.Vector3(0, 0, 0));
  const rotRef = React.useRef(0);
  const scaleRef = React.useRef(1);
  const draggingRef = React.useRef(false);

  const [phase, setPhase] = React.useState<Phase>("intro");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [progress, setProgress] = React.useState(0);
  const [tip, setTip] = React.useState(0);
  const [variant, setVariant] = React.useState(0);
  const [scale, setScale] = React.useState(1);
  const [photo, setPhoto] = React.useState<string | null>(null);
  const [recs, setRecs] = React.useState<Product[]>([]);
  const dimsRef = React.useRef<Dims>({ w: 1, h: 1, d: 1 });

  const ftype = React.useMemo(
    () =>
      detectFurnitureType({
        name: product?.name ?? "sofa",
        category: product?.category,
        tags: product?.tags,
      }),
    [product]
  );

  // recommendations
  React.useEffect(() => {
    fetch("/api/products?category=furniture")
      .then((r) => r.json())
      .then((d) => {
        const list: Product[] = Array.isArray(d.products) ? d.products : [];
        setRecs(list.filter((p) => p.id !== product?.id).slice(0, 6));
      })
      .catch(() => {});
  }, [product?.id]);

  // cycle tips while loading/scanning
  React.useEffect(() => {
    if (phase !== "loading" && phase !== "scanning") return;
    const id = setInterval(() => setTip((t) => (t + 1) % TIPS.length), 2200);
    return () => clearInterval(id);
  }, [phase]);

  const cleanup = React.useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const r = rendererRef.current;
    if (r) {
      r.dispose();
      r.domElement.remove();
    }
    rendererRef.current = null;
  }, []);

  React.useEffect(() => cleanup, [cleanup]);

  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* ----------------------------- scene ----------------------------- */
  function setupScene(mode: "ar" | "viewer") {
    const mount = mountRef.current!;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.01, 100);
    camera.position.set(0, 1.5, 3.2);
    camera.lookAt(0, 0.45, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: mode === "ar",
      antialias: true,
      preserveDrawingBuffer: true, // needed for screenshots
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (mode === "ar") renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;touch-action:none;";
    mount.appendChild(renderer.domElement);

    // lights
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.9));
    const amb = new THREE.AmbientLight(0xffffff, 0.4);
    const dir = new THREE.DirectionalLight(0xffffff, 1.1);
    dir.position.set(3, 6, 4);
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 30;
    scene.add(amb, dir);

    // 360 backdrop
    if (mode === "viewer") {
      scene.background = new THREE.Color(0x12182a);
      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(6, 48),
        new THREE.MeshStandardMaterial({ color: 0x1b2236, roughness: 1 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);
    } else {
      // shadow catcher only (transparent over the camera feed)
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(12, 12),
        new THREE.ShadowMaterial({ opacity: 0.32 })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.receiveShadow = true;
      scene.add(shadow);
    }

    // furniture
    const { group, dims } = buildFurniture(ftype, COLOR_VARIANTS[0].hex);
    dimsRef.current = dims;
    scene.add(group);

    rendererRef.current = renderer;
    sceneRef.current = scene;
    camRef.current = camera;
    groupRef.current = group;
    modeRef.current = mode;
  }

  function renderLoop() {
    const render = () => {
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = camRef.current;
      const group = groupRef.current;
      if (renderer && scene && camera && group) {
        if (modeRef.current === "viewer" && !draggingRef.current)
          rotRef.current += 0.006;
        group.position.set(posRef.current.x, 0, posRef.current.z);
        group.rotation.y = rotRef.current;
        group.scale.setScalar(scaleRef.current);
        renderer.render(scene, camera);
      }
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
  }

  /* --------------------------- pointers ---------------------------- */
  const groundPlane = React.useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycaster = React.useRef(new THREE.Raycaster());
  const pointers = React.useRef(new Map<number, { x: number; y: number }>());
  const gesture = React.useRef<{ dist: number; angle: number } | null>(null);

  function pointerToGround(clientX: number, clientY: number) {
    const renderer = rendererRef.current!;
    const camera = camRef.current!;
    const rect = renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.current.setFromCamera(ndc, camera);
    const hit = new THREE.Vector3();
    raycaster.current.ray.intersectPlane(groundPlane.current, hit);
    return hit;
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    draggingRef.current = true;
    gesture.current = null;
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = Array.from(pointers.current.values());

    if (pts.length >= 2) {
      const [a, b] = pts;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const angle = Math.atan2(b.y - a.y, b.x - a.x);
      if (gesture.current) {
        scaleRef.current = THREE.MathUtils.clamp(
          scaleRef.current * (dist / gesture.current.dist),
          0.4,
          2.2
        );
        rotRef.current += angle - gesture.current.angle;
        setScale(Number(scaleRef.current.toFixed(2)));
      }
      gesture.current = { dist, angle };
      return;
    }

    // single pointer
    if (modeRef.current === "ar") {
      const hit = pointerToGround(e.clientX, e.clientY);
      if (hit) {
        posRef.current.x = THREE.MathUtils.clamp(hit.x, -4, 4);
        posRef.current.z = THREE.MathUtils.clamp(hit.z, -4, 2);
      }
    } else {
      rotRef.current += e.movementX * 0.01;
    }
  }
  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    gesture.current = null;
    if (pointers.current.size === 0) draggingRef.current = false;
  }
  function onWheel(e: React.WheelEvent) {
    scaleRef.current = THREE.MathUtils.clamp(
      scaleRef.current * (e.deltaY > 0 ? 0.95 : 1.05),
      0.4,
      2.2
    );
    setScale(Number(scaleRef.current.toFixed(2)));
  }

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") rotRef.current -= 0.1;
      if (e.key === "ArrowRight") rotRef.current += 0.1;
      if (e.key === "ArrowUp") posRef.current.z -= 0.1;
      if (e.key === "ArrowDown") posRef.current.z += 0.1;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ----------------------------- start ----------------------------- */
  async function start() {
    setPhase("loading");
    setProgress(0);
    // simulate progressive load of the 3D scene
    const progTimer = setInterval(
      () => setProgress((p) => Math.min(p + 8, 95)),
      120
    );

    let mode: "ar" | "viewer" = "ar";
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("no-cam");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
    } catch {
      mode = "viewer"; // no camera / denied → 360 fallback
    }

    // build scene on next frame so the mount has size
    requestAnimationFrame(() => {
      try {
        setupScene(mode);
        renderLoop();
        clearInterval(progTimer);
        setProgress(100);
        if (mode === "ar") {
          setPhase("scanning");
          setTimeout(() => setPhase("ar"), 2600); // scan → detected
        } else {
          setPhase("viewer");
        }
      } catch (err) {
        clearInterval(progTimer);
        setErrorMsg(
          err instanceof Error ? err.message : "Could not start the 3D view."
        );
        setPhase("error");
      }
    });
  }

  function changeVariant(i: number) {
    setVariant(i);
    if (groupRef.current) tintFurniture(groupRef.current, COLOR_VARIANTS[i].hex);
  }
  function nudgeRotate(dir: number) {
    rotRef.current += dir * 0.26;
  }
  function setUserScale(v: number) {
    scaleRef.current = v;
    setScale(v);
  }

  /* --------------------------- capture ----------------------------- */
  function takePhoto() {
    const renderer = rendererRef.current;
    if (!renderer) return;
    const out = document.createElement("canvas");
    const W = (out.width = renderer.domElement.width);
    const H = (out.height = renderer.domElement.height);
    const ctx = out.getContext("2d")!;
    const video = videoRef.current;
    if (modeRef.current === "ar" && video && video.videoWidth) {
      // cover-fit the video frame
      const vr = video.videoWidth / video.videoHeight;
      const cr = W / H;
      let dw = W,
        dh = H,
        dx = 0,
        dy = 0;
      if (vr > cr) {
        dh = H;
        dw = H * vr;
        dx = (W - dw) / 2;
      } else {
        dw = W;
        dh = W / vr;
        dy = (H - dh) / 2;
      }
      ctx.drawImage(video, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = "#12182a";
      ctx.fillRect(0, 0, W, H);
    }
    // force a fresh render then composite the 3D layer
    renderer.render(sceneRef.current!, camRef.current!);
    ctx.drawImage(renderer.domElement, 0, 0, W, H);
    // watermark
    ctx.font = `${Math.round(W * 0.028)}px sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.textBaseline = "bottom";
    ctx.fillText("I found this on ChinaCart! 🛋️", W * 0.04, H - W * 0.04);
    setPhoto(out.toDataURL("image/png"));
  }

  async function sharePhoto() {
    if (!photo) return;
    try {
      const blob = await (await fetch(photo)).blob();
      const file = new File([blob], "chinacart-room.png", { type: "image/png" });
      const nav = navigator as Navigator & {
        canShare?: (d: { files: File[] }) => boolean;
      };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: "My room with ChinaCart 🛋️" });
        return;
      }
    } catch {
      /* fall through */
    }
    window.open(
      `https://wa.me/?text=${encodeURIComponent("Check out this furniture in my room — ChinaCart! 🛋️")}`,
      "_blank"
    );
  }
  function downloadPhoto() {
    if (!photo) return;
    const a = document.createElement("a");
    a.href = photo;
    a.download = "chinacart-room.png";
    a.click();
  }
  function buyNow() {
    if (!product) {
      router.push("/products?category=furniture");
      onClose();
      return;
    }
    addItem(product);
    onClose();
    router.push("/checkout");
  }
  function close() {
    cleanup();
    onClose();
  }

  const d = dimsRef.current;
  const cm = (m: number) => Math.round(m * 100 * scale);
  const interactive = phase === "ar" || phase === "viewer";

  return (
    <div ref={wrapRef} className="fixed inset-0 z-[150] flex flex-col bg-black text-white">
      {/* camera feed */}
      <video
        ref={videoRef}
        playsInline
        muted
        className={`absolute inset-0 h-full w-full object-cover ${
          phase === "ar" || phase === "scanning" ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* three.js canvas mounts here */}
      <div
        ref={mountRef}
        className="absolute inset-0"
        onPointerDown={interactive ? onPointerDown : undefined}
        onPointerMove={interactive ? onPointerMove : undefined}
        onPointerUp={interactive ? onPointerUp : undefined}
        onPointerCancel={interactive ? onPointerUp : undefined}
        onWheel={interactive ? onWheel : undefined}
      />

      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center gap-2">
          <Move className="h-5 w-5 text-gold" />
          <span className="font-bold">View In My Room</span>
        </div>
        <button
          onClick={close}
          aria-label="Close"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Intro */}
      {phase === "intro" && (
        <div className="relative z-20 m-auto max-w-sm px-6 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold to-brand text-black">
            <Camera className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-extrabold">See it in your room 🛋️</h2>
          <p className="mt-2 text-sm text-white/70">
            We&apos;ll use your camera to place this furniture in your space.
            Nothing is recorded or uploaded — it all stays on your device. No
            camera? You&apos;ll get a 360° view instead.
          </p>
          <Button variant="gold" size="lg" className="mt-6 w-full" onClick={start}>
            <Camera className="h-4 w-4" /> Allow Camera &amp; Start
          </Button>
          <button onClick={onClose} className="mt-3 text-sm text-white/50 hover:text-white">
            Maybe later
          </button>
        </div>
      )}

      {/* Loading */}
      {phase === "loading" && (
        <div className="relative z-20 m-auto max-w-xs px-6 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-gold" />
          <p className="mt-4 font-semibold">Loading 3D model… {progress}%</p>
          <div className="mx-auto mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full bg-gradient-to-r from-brand to-gold transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-4 text-sm text-white/70">{TIPS[tip]}</p>
        </div>
      )}

      {/* Scanning */}
      {phase === "scanning" && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center">
          <div className="ar-scan-grid" />
          <div className="mt-4 flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 backdrop-blur">
            <span className="ar-scan-dot" />
            <span className="ar-scan-dot" style={{ animationDelay: "0.2s" }} />
            <span className="ar-scan-dot" style={{ animationDelay: "0.4s" }} />
            <span className="ml-1 text-sm font-medium">
              Detecting floor… point camera down
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {phase === "error" && (
        <div className="relative z-20 m-auto max-w-sm px-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-400" />
          <h2 className="mt-3 text-xl font-bold">Couldn&apos;t start AR</h2>
          <p className="mt-2 text-sm text-white/70">{errorMsg}</p>
          <Button variant="gold" className="mt-5" onClick={start}>
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      )}

      {/* Floor detected flash */}
      {phase === "ar" && (
        <div className="pointer-events-none absolute left-1/2 top-20 z-20 -translate-x-1/2 animate-fade-in rounded-full bg-green-500/20 px-4 py-1.5 text-sm font-semibold text-green-300 backdrop-blur">
          ✓ Floor detected — drag to place
        </div>
      )}

      {/* Dimensions badge */}
      {interactive && (
        <div className="pointer-events-none absolute right-4 top-20 z-20 rounded-lg bg-black/50 px-3 py-1.5 text-xs font-medium backdrop-blur">
          <span className="flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5 text-gold" />
            {cm(d.w)} × {cm(d.h)} × {cm(d.d)} cm
          </span>
        </div>
      )}

      {/* Captured photo */}
      {photo && (
        <div className="absolute inset-0 z-30 flex flex-col bg-black/95">
          <div className="flex flex-1 items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="Your room" className="max-h-full max-w-full rounded-xl object-contain" />
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

      {/* Controls */}
      {interactive && !photo && (
        <div className="absolute bottom-0 left-0 right-0 z-20 space-y-3 bg-gradient-to-t from-black via-black/90 to-transparent p-4 pb-6">
          {/* colour variants */}
          <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto">
            {COLOR_VARIANTS.map((c, i) => (
              <button
                key={c.hex}
                onClick={() => changeVariant(i)}
                aria-label={c.name}
                className={`h-8 w-8 shrink-0 rounded-full border-2 ${
                  i === variant ? "border-gold" : "border-white/30"
                }`}
                style={{ background: c.hex }}
              />
            ))}
          </div>

          {/* rotate + resize */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => nudgeRotate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              aria-label="Rotate left"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <input
              type="range"
              min={0.5}
              max={1.8}
              step={0.01}
              value={scale}
              onChange={(e) => setUserScale(Number(e.target.value))}
              className="w-40 accent-gold"
              aria-label="Resize"
            />
            <button
              onClick={() => nudgeRotate(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              aria-label="Rotate right"
            >
              <RotateCw className="h-5 w-5" />
            </button>
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

          {/* matching pieces */}
          {recs.length > 0 && (
            <div>
              <p className="mb-1.5 text-center text-[11px] uppercase tracking-wide text-white/50">
                Matching furniture
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
