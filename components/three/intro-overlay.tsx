"use client";

import * as React from "react";
import * as THREE from "three";

const GOLD = new THREE.Color("#FFD700");
const RED = new THREE.Color("#CC0000");

/**
 * Full-screen 3D intro: a faceted gold gem (the "Import China" box/jewel)
 * that rotates while the camera zooms in, over a drifting red/gold particle
 * field. Calls `onComplete` once the entrance animation finishes.
 *
 * Raw three.js (no R3F/drei) to keep the bundle lean; everything is disposed
 * on unmount to free the GPU.
 */
export default function IntroOverlay({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const [progress, setProgress] = React.useState(0);
  const completed = React.useRef(false);

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // --- Core gem ---------------------------------------------------------
    const group = new THREE.Group();
    const geo = new THREE.IcosahedronGeometry(1.25, 0);
    const core = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        color: GOLD,
        metalness: 0.7,
        roughness: 0.18,
        emissive: new THREE.Color("#3a2a00"),
        flatShading: true,
      })
    );
    const wire = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: RED, wireframe: true })
    );
    wire.scale.setScalar(1.03);
    group.add(core, wire);
    scene.add(group);

    // --- Lights -----------------------------------------------------------
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const key = new THREE.PointLight(0xffd700, 120, 50);
    key.position.set(5, 6, 8);
    const rim = new THREE.PointLight(0xff2d2d, 90, 50);
    rim.position.set(-6, -4, 4);
    scene.add(key, rim);

    // --- Particles --------------------------------------------------------
    const count = isMobile ? 1100 : 2800;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      const c = Math.random() > 0.5 ? GOLD : RED;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        size: 0.035,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    scene.add(particles);

    // --- Animation --------------------------------------------------------
    const DURATION = 2600; // ms entrance
    const start = performance.now();
    let raf = 0;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / DURATION, 1);
      const e = easeOut(t);

      camera.position.z = 7 - e * 3.6; // zoom in 7 -> 3.4
      group.rotation.y = elapsed * 0.0011;
      group.rotation.x = Math.sin(elapsed * 0.0006) * 0.35;
      group.scale.setScalar(0.6 + e * 0.4);
      particles.rotation.y = elapsed * 0.00018;
      particles.rotation.x = elapsed * 0.0001;

      renderer.render(scene, camera);
      setProgress(t);

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!completed.current) {
        completed.current = true;
        // brief hold so the fully-zoomed logo is appreciated
        setTimeout(onComplete, 450);
      }
    };
    raf = requestAnimationFrame(tick);

    // --- Resize -----------------------------------------------------------
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      geo.dispose();
      pGeo.dispose();
      core.material.dispose();
      wire.material.dispose();
      (particles.material as THREE.Material).dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
  }, [onComplete]);

  const pct = Math.round(progress * 100);

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden bg-[#0a0604]">
      {/* radial glow backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(204,0,0,0.25), transparent 55%)",
        }}
      />
      <div ref={mountRef} className="absolute inset-0" />

      {/* Brand + progress overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-[12vh]">
        <h1
          className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl"
          style={{ textShadow: "0 2px 30px rgba(255,215,0,0.45)" }}
        >
          Import<span className="text-gold">China</span>
        </h1>
        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/60 sm:text-sm">
          Sourcing the world, in 3D
        </p>
        <div className="mt-6 h-[3px] w-44 overflow-hidden rounded-full bg-white/15 sm:w-56">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand via-gold to-brand transition-[width] duration-100 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
