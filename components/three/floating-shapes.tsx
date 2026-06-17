"use client";

import * as React from "react";
import * as THREE from "three";

/**
 * Lightweight floating geometric shapes used as a hero background.
 * - pauses its render loop when offscreen or the tab is hidden
 * - reacts to pointer movement for a subtle parallax/tilt
 * - reduces work on mobile; renders a single static frame if reduced-motion
 */
export default function FloatingShapes({
  reduced = false,
}: {
  reduced?: boolean;
}) {
  const mountRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    let width = mount.clientWidth;
    let height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 9;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const l1 = new THREE.PointLight(0xffd700, 90, 60);
    l1.position.set(8, 8, 10);
    const l2 = new THREE.PointLight(0xcc0000, 70, 60);
    l2.position.set(-8, -6, 6);
    scene.add(l1, l2);

    const geos = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.TorusGeometry(0.7, 0.28, 16, 40),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.DodecahedronGeometry(0.9, 0),
    ];
    const count = isMobile ? 5 : 8;
    const group = new THREE.Group();
    const spins: { rx: number; ry: number }[] = [];

    for (let i = 0; i < count; i++) {
      const geo = geos[i % geos.length];
      const gold = i % 2 === 0;
      const mat = new THREE.MeshStandardMaterial({
        color: gold ? "#FFD700" : "#CC0000",
        metalness: 0.6,
        roughness: 0.3,
        wireframe: i % 3 === 0,
        transparent: true,
        opacity: i % 3 === 0 ? 0.7 : 0.9,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 9,
        (Math.random() - 0.5) * 6 - 2
      );
      const s = 0.5 + Math.random() * 0.9;
      mesh.scale.setScalar(s);
      mesh.rotation.set(Math.random() * 6, Math.random() * 6, 0);
      spins.push({ rx: 0.001 + Math.random() * 0.003, ry: 0.001 + Math.random() * 0.003 });
      group.add(mesh);
    }
    scene.add(group);

    // Pointer parallax
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // Visibility / offscreen pausing
    let visible = true;
    let hidden = document.hidden;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !hidden && !reduced) loop();
      },
      { threshold: 0.01 }
    );
    io.observe(mount);
    const onVis = () => {
      hidden = document.hidden;
      if (!hidden && visible && !reduced) loop();
    };
    document.addEventListener("visibilitychange", onVis);

    let raf = 0;
    const renderFrame = () => {
      target.x += (pointer.x - target.x) * 0.05;
      target.y += (pointer.y - target.y) * 0.05;
      group.rotation.y = target.x * 0.4;
      group.rotation.x = target.y * 0.3;
      group.children.forEach((m, i) => {
        m.rotation.x += spins[i].rx;
        m.rotation.y += spins[i].ry;
      });
      renderer.render(scene, camera);
    };
    const animate = () => {
      renderFrame();
      raf = requestAnimationFrame(animate);
    };
    const loop = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(animate);
    };

    if (reduced) {
      renderFrame(); // single static frame
    } else {
      loop();
    }

    const onResize = () => {
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderFrame();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      geos.forEach((g) => g.dispose());
      group.children.forEach((m) =>
        ((m as THREE.Mesh).material as THREE.Material).dispose()
      );
      renderer.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
  }, [reduced]);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden />;
}
