"use client";

import * as React from "react";
import * as THREE from "three";
import type { Product } from "@/data/products";

const ROOM_W = 18;
const ROOM_D = 12;
const ROOM_H = 5;
const EYE = 1.6;

/**
 * First-person walkable 3D showroom (raw three.js).
 * - desktop: click to look (pointer lock) + WASD/arrows to move
 * - touch: drag to look + on-screen D-pad to move
 * - click/tap a product display to open its details (onSelect)
 * - WebXR "Enter VR" when the device/browser supports immersive-vr
 */
export default function ShowroomScene({
  products,
  accent,
  onSelect,
  onDoor,
  entryFrom = null,
  prevRoomName,
  nextRoomName,
}: {
  products: Product[];
  accent: string;
  onSelect: (id: string) => void;
  onDoor: (dir: "next" | "prev") => void;
  entryFrom?: "left" | "right" | null;
  prevRoomName: string;
  nextRoomName: string;
}) {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const moveRef = React.useRef({ f: false, b: false, l: false, r: false });
  const [vrSupported, setVrSupported] = React.useState(false);
  const enterVrRef = React.useRef<() => void>(() => {});

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    let width = mount.clientWidth;
    let height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1e);
    scene.fog = new THREE.Fog(0x0a0f1e, 10, 30);

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.05, 100);
    const DOOR_HALF = 1.1;
    const DOOR_H = 2.7;
    // spawn at the doorway you came through (continuous feel), else at the front
    const pos = new THREE.Vector3(0, EYE, ROOM_D / 2 - 1.5);
    let yaw = Math.PI; // face into the room (-Z)
    if (entryFrom === "left") {
      pos.set(-ROOM_W / 2 + 1.3, EYE, 0);
      yaw = -Math.PI / 2; // face +X (into room)
    } else if (entryFrom === "right") {
      pos.set(ROOM_W / 2 - 1.3, EYE, 0);
      yaw = Math.PI / 2; // face -X (into room)
    }
    let pitch = 0;
    camera.rotation.order = "YXZ";

    const renderer = new THREE.WebGLRenderer({ antialias: !isTouch });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    renderer.domElement.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;touch-action:none";
    mount.appendChild(renderer.domElement);

    // --- lights ---
    scene.add(new THREE.HemisphereLight(0xffffff, 0x404050, 0.8));
    const accentColor = new THREE.Color(accent);
    for (let i = -1; i <= 1; i++) {
      const lamp = new THREE.PointLight(0xfff0d0, 60, 18);
      lamp.position.set(i * 5, ROOM_H - 0.5, 0);
      scene.add(lamp);
    }
    const glow = new THREE.PointLight(accentColor.getHex(), 30, 22);
    glow.position.set(0, 2, -ROOM_D / 2 + 1);
    scene.add(glow);

    // --- room shell ---
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_W, ROOM_D),
      new THREE.MeshStandardMaterial({ color: 0x14182a, roughness: 0.5, metalness: 0.2 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_W, ROOM_D),
      new THREE.MeshStandardMaterial({ color: 0x0c1020 })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = ROOM_H;
    scene.add(ceiling);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1b2138, roughness: 0.9 });
    const accentMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: accentColor.clone().multiplyScalar(0.25),
      roughness: 0.6,
    });
    const mkWall = (w: number, h: number, mat: THREE.Material) =>
      new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);

    const back = mkWall(ROOM_W, ROOM_H, accentMat);
    back.position.set(0, ROOM_H / 2, -ROOM_D / 2);
    const front = mkWall(ROOM_W, ROOM_H, wallMat);
    front.position.set(0, ROOM_H / 2, ROOM_D / 2);
    front.rotation.y = Math.PI;
    scene.add(back, front);

    // text label sprite (for doorways)
    const makeLabel = (text: string) => {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 128;
      const cx = c.getContext("2d")!;
      cx.font = "bold 52px sans-serif";
      cx.textAlign = "center";
      cx.textBaseline = "middle";
      cx.fillStyle = "#ffffff";
      cx.fillText(text, 256, 64);
      const tx = new THREE.CanvasTexture(c);
      tx.colorSpace = THREE.SRGBColorSpace;
      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false })
      );
      sp.scale.set(3, 0.75, 1);
      return sp;
    };

    // Side walls with a centred doorway opening (left = prev room, right = next)
    const buildSideWall = (side: "left" | "right", label: string) => {
      const x = side === "left" ? -ROOM_W / 2 : ROOM_W / 2;
      const ry = side === "left" ? Math.PI / 2 : -Math.PI / 2;
      const segW = ROOM_D / 2 - DOOR_HALF;
      const segMag = (ROOM_D / 2 + DOOR_HALF) / 2;
      [-1, 1].forEach((s) => {
        const seg = new THREE.Mesh(new THREE.PlaneGeometry(segW, ROOM_H), wallMat);
        seg.position.set(x, ROOM_H / 2, s * segMag);
        seg.rotation.y = ry;
        scene.add(seg);
      });
      // lintel above the door
      const lintel = new THREE.Mesh(
        new THREE.PlaneGeometry(DOOR_HALF * 2, ROOM_H - DOOR_H),
        wallMat
      );
      lintel.position.set(x, (DOOR_H + ROOM_H) / 2, 0);
      lintel.rotation.y = ry;
      scene.add(lintel);
      // glowing portal in the opening
      const portal = new THREE.Mesh(
        new THREE.PlaneGeometry(DOOR_HALF * 2 - 0.1, DOOR_H - 0.05),
        new THREE.MeshBasicMaterial({
          color: accentColor,
          transparent: true,
          opacity: 0.22,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      portal.position.set(x, DOOR_H / 2, 0);
      portal.rotation.y = ry;
      scene.add(portal);
      // doorframe glow strips
      const frameG = new THREE.MeshBasicMaterial({ color: accentColor });
      [-DOOR_HALF, DOOR_HALF].forEach((dz) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, DOOR_H, 0.12), frameG);
        post.position.set(x, DOOR_H / 2, dz);
        scene.add(post);
      });
      // label above the door
      const lab = makeLabel(label);
      lab.position.set(x + (side === "left" ? 0.1 : -0.1), DOOR_H + 0.55, 0);
      scene.add(lab);
    };
    buildSideWall("left", `← ${prevRoomName}`);
    buildSideWall("right", `${nextRoomName} →`);

    // --- product displays ---
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const displays: THREE.Mesh[] = [];
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0b0e18, metalness: 0.6, roughness: 0.4 });

    // positions along side walls (clear of the centred doorways) + back wall
    const slots: { x: number; z: number; ry: number }[] = [];
    [0.24, 0.76].forEach((t) => {
      const z = (t - 0.5) * (ROOM_D - 1.5);
      slots.push({ x: -ROOM_W / 2 + 0.15, z, ry: Math.PI / 2 }); // left
      slots.push({ x: ROOM_W / 2 - 0.15, z, ry: -Math.PI / 2 }); // right
    });
    [0.2, 0.5, 0.8].forEach((t) => {
      slots.push({ x: (t - 0.5) * (ROOM_W - 3), z: -ROOM_D / 2 + 0.15, ry: 0 }); // back
    });

    products.slice(0, slots.length).forEach((p, i) => {
      const s = slots[i];
      const group = new THREE.Group();
      group.position.set(s.x, 1.7, s.z);
      group.rotation.y = s.ry;

      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.7, 0.08), frameMat);
      group.add(frame);

      const mat = new THREE.MeshStandardMaterial({ color: 0x222633, roughness: 0.5 });
      const tex = loader.load(
        p.images[0],
        (tx) => {
          tx.colorSpace = THREE.SRGBColorSpace;
          mat.map = tx;
          mat.color.set(0xffffff);
          mat.needsUpdate = true;
        },
        undefined,
        () => {}
      );
      void tex;
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 1.45), mat);
      panel.position.z = 0.05;
      panel.userData.productId = p.id;
      displays.push(panel);
      group.add(panel);

      // spotlight strip below
      const strip = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 0.06),
        new THREE.MeshBasicMaterial({ color: accentColor })
      );
      strip.position.set(0, -0.95, 0.06);
      group.add(strip);

      scene.add(group);
    });

    // --- simulated shopper avatars ---
    const avatarColors = [0xffd700, 0xcc0000, 0x4aa3ff, 0x42d77d, 0xb07cff];
    const avatars: { mesh: THREE.Group; phase: number; radius: number; speed: number }[] = [];
    const avatarCount = isTouch ? 3 : 5;
    for (let i = 0; i < avatarCount; i++) {
      const g = new THREE.Group();
      const color = avatarColors[i % avatarColors.length];
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.28, 0.7, 4, 8),
        new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
      );
      body.position.y = 0.75;
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xf1c9a5, roughness: 0.8 })
      );
      head.position.y = 1.4;
      g.add(body, head);
      const radius = 2 + Math.random() * 4;
      g.position.set((Math.random() - 0.5) * 8, 0, (Math.random() - 0.5) * 6);
      scene.add(g);
      avatars.push({ mesh: g, phase: Math.random() * Math.PI * 2, radius, speed: 0.2 + Math.random() * 0.3 });
    }

    // --- ambient audio (synthesized — no copyrighted asset) ---
    let audioCtx: AudioContext | null = null;
    let masterGain: GainNode | null = null;
    const startAudio = () => {
      if (audioCtx) {
        masterGain!.gain.value = 0.06;
        return;
      }
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      audioCtx = new Ctx();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.06;
      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 700;
      filter.connect(masterGain);
      masterGain.connect(audioCtx.destination);
      [110, 164.81, 220].forEach((f, i) => {
        const osc = audioCtx!.createOscillator();
        osc.type = i === 2 ? "triangle" : "sine";
        osc.frequency.value = f;
        osc.detune.value = (i - 1) * 6;
        osc.connect(filter);
        osc.start();
      });
    };
    const stopAudio = () => {
      if (masterGain) masterGain.gain.value = 0;
    };
    (mount as HTMLElement & { __audio?: { start: () => void; stop: () => void } }).__audio = {
      start: startAudio,
      stop: stopAudio,
    };

    // --- look controls ---
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== renderer.domElement) return;
      yaw -= e.movementX * 0.0022;
      pitch -= e.movementY * 0.0022;
      pitch = Math.max(-1.2, Math.min(1.2, pitch));
    };
    document.addEventListener("mousemove", onMouseMove);

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let downX = 0;
    let downY = 0;
    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = downX = e.clientX;
      lastY = downY = e.clientY;
      if (!isTouch && document.pointerLockElement !== renderer.domElement) {
        renderer.domElement.requestPointerLock?.();
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging || !isTouch) return;
      yaw -= (e.clientX - lastX) * 0.005;
      pitch -= (e.clientY - lastY) * 0.005;
      pitch = Math.max(-1.2, Math.min(1.2, pitch));
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const raycaster = new THREE.Raycaster();
    const tryPick = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const locked = document.pointerLockElement === renderer.domElement;
      const ndc = locked
        ? new THREE.Vector2(0, 0)
        : new THREE.Vector2(
            ((clientX - rect.left) / rect.width) * 2 - 1,
            -((clientY - rect.top) / rect.height) * 2 + 1
          );
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(displays, false);
      const id = hits[0]?.object?.userData?.productId;
      if (id) onSelect(id as string);
    };
    const onPointerUp = (e: PointerEvent) => {
      dragging = false;
      const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (moved < 6) tryPick(e.clientX, e.clientY);
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      const m = moveRef.current;
      if (e.code === "KeyW" || e.code === "ArrowUp") m.f = down;
      if (e.code === "KeyS" || e.code === "ArrowDown") m.b = down;
      if (e.code === "KeyA" || e.code === "ArrowLeft") m.l = down;
      if (e.code === "KeyD" || e.code === "ArrowRight") m.r = down;
    };
    const kd = onKey(true);
    const ku = onKey(false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);

    // --- VR ---
    if (navigator.xr?.isSessionSupported) {
      navigator.xr.isSessionSupported("immersive-vr").then((ok) => setVrSupported(ok)).catch(() => {});
    }
    enterVrRef.current = async () => {
      try {
        const session = await navigator.xr?.requestSession("immersive-vr", {
          optionalFeatures: ["local-floor"],
        });
        if (session) await renderer.xr.setSession(session as XRSession);
      } catch {
        /* ignore */
      }
    };

    // --- render loop ---
    let doorTriggered = false;
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      if (!renderer.xr.isPresenting) {
        const m = moveRef.current;
        const mz = (m.f ? 1 : 0) - (m.b ? 1 : 0);
        const mx = (m.r ? 1 : 0) - (m.l ? 1 : 0);
        const speed = 3.2 * dt;
        const fwd = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
        const rgt = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
        pos.addScaledVector(fwd, mz * speed);
        pos.addScaledVector(rgt, mx * speed);
        const margin = 0.6;
        const inDoor = Math.abs(pos.z) < DOOR_HALF;
        // left / right walls: walk through the doorway gap to change room
        if (pos.x < -ROOM_W / 2 + margin) {
          if (inDoor && !doorTriggered) {
            doorTriggered = true;
            onDoor("prev");
          } else if (!inDoor) {
            pos.x = -ROOM_W / 2 + margin;
          }
        } else if (pos.x > ROOM_W / 2 - margin) {
          if (inDoor && !doorTriggered) {
            doorTriggered = true;
            onDoor("next");
          } else if (!inDoor) {
            pos.x = ROOM_W / 2 - margin;
          }
        }
        pos.z = Math.max(-ROOM_D / 2 + margin, Math.min(ROOM_D / 2 - margin, pos.z));
        camera.position.copy(pos);
        camera.rotation.y = yaw;
        camera.rotation.x = pitch;
      }

      for (const a of avatars) {
        a.phase += a.speed * dt;
        a.mesh.position.x = Math.cos(a.phase) * a.radius;
        a.mesh.position.z = Math.sin(a.phase) * a.radius * 0.7;
        a.mesh.rotation.y = -a.phase + Math.PI / 2;
        a.mesh.position.y = Math.abs(Math.sin(t * 4 + a.phase)) * 0.04;
      }

      renderer.render(scene, camera);
    });

    const onResize = () => {
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      renderer.setAnimationLoop(null);
      document.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("resize", onResize);
      try {
        audioCtx?.close();
      } catch {
        /* ignore */
      }
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry?.dispose?.();
          const mm = o.material;
          if (Array.isArray(mm)) mm.forEach((x) => x.dispose());
          else mm?.dispose?.();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [products, accent, onSelect, onDoor, entryFrom, prevRoomName, nextRoomName]);

  return (
    <div ref={mountRef} className="absolute inset-0">
      {/* on-screen movement D-pad (all devices, esp. touch) */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-20 grid grid-cols-3 grid-rows-2 gap-1.5">
        <DPadButton dir="f" label="▲" moveRef={moveRef} className="col-start-2 row-start-1" />
        <DPadButton dir="l" label="◀" moveRef={moveRef} className="col-start-1 row-start-2" />
        <DPadButton dir="b" label="▼" moveRef={moveRef} className="col-start-2 row-start-2" />
        <DPadButton dir="r" label="▶" moveRef={moveRef} className="col-start-3 row-start-2" />
      </div>

      {vrSupported && (
        <button
          onClick={() => enterVrRef.current()}
          className="absolute right-4 top-20 z-20 rounded-lg bg-white/15 px-3 py-2 text-xs font-bold text-white backdrop-blur hover:bg-white/25"
        >
          🥽 Enter VR
        </button>
      )}
    </div>
  );
}

function DPadButton({
  dir,
  label,
  moveRef,
  className,
}: {
  dir: "f" | "b" | "l" | "r";
  label: string;
  moveRef: React.MutableRefObject<{ f: boolean; b: boolean; l: boolean; r: boolean }>;
  className?: string;
}) {
  const set = (v: boolean) => {
    moveRef.current[dir] = v;
  };
  return (
    <button
      aria-label={`move ${dir}`}
      onPointerDown={(e) => {
        e.preventDefault();
        set(true);
      }}
      onPointerUp={() => set(false)}
      onPointerLeave={() => set(false)}
      className={`pointer-events-auto flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur active:bg-white/35 ${className ?? ""}`}
    >
      {label}
    </button>
  );
}
