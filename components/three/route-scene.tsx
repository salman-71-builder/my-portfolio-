"use client";

import * as React from "react";
import * as THREE from "three";
import { gsap } from "gsap";

/* ------------------------------------------------------------------ */
/* Flag textures (drawn procedurally — no external assets)            */
/* ------------------------------------------------------------------ */

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  rotation = -Math.PI / 2
) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a1 = rotation + (i * 2 * Math.PI) / 5;
    const a2 = a1 + Math.PI / 5;
    ctx.lineTo(cx + Math.cos(a1) * outer, cy + Math.sin(a1) * outer);
    ctx.lineTo(cx + Math.cos(a2) * inner, cy + Math.sin(a2) * inner);
  }
  ctx.closePath();
  ctx.fill();
}

function flagTexture(kind: "china" | "bangladesh"): THREE.CanvasTexture {
  const w = 320;
  const h = 200;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  if (kind === "bangladesh") {
    ctx.fillStyle = "#006a4e";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#f42a41";
    ctx.beginPath();
    ctx.arc(w * 0.45, h * 0.5, h * 0.3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#de2910";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ffde00";
    drawStar(ctx, w * 0.16, h * 0.28, 26, 11);
    const smalls: [number, number, number][] = [
      [w * 0.3, h * 0.12, -1.0],
      [w * 0.36, h * 0.26, -0.6],
      [w * 0.36, h * 0.44, -0.2],
      [w * 0.3, h * 0.58, 0.2],
    ];
    for (const [x, y, rot] of smalls) drawStar(ctx, x, y, 10, 4, rot);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/* ------------------------------------------------------------------ */
/* Waving flag (segmented plane, CPU vertex displacement + pole)      */
/* ------------------------------------------------------------------ */

interface Flag {
  group: THREE.Group;
  mesh: THREE.Mesh;
  base: Float32Array;
  geo: THREE.PlaneGeometry;
}

function makeFlag(kind: "china" | "bangladesh", glow: string): Flag {
  const W = 2.4;
  const H = 1.5;
  const geo = new THREE.PlaneGeometry(W, H, 24, 16);
  const base = Float32Array.from(geo.attributes.position.array);
  const mat = new THREE.MeshStandardMaterial({
    map: flagTexture(kind),
    side: THREE.DoubleSide,
    roughness: 0.85,
    metalness: 0.05,
    emissive: new THREE.Color(glow),
    emissiveIntensity: 0.18,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.x = W / 2; // pivot at the pole (left edge)

  // soft glow halo behind the cloth
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(W * 1.25, H * 1.3),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(glow),
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  halo.position.set(W / 2, 0, -0.05);

  // gold pole
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, H * 1.5, 8),
    new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.3,
      emissive: 0x5a4500,
    })
  );
  pole.position.set(0, -H * 0.1, 0);

  const group = new THREE.Group();
  group.add(pole, halo, mesh);
  return { group, mesh, base, geo };
}

function waveFlag(flag: Flag, t: number) {
  const pos = flag.geo.attributes.position;
  const base = flag.base;
  const W = 2.4;
  for (let i = 0; i < pos.count; i++) {
    const x = base[i * 3];
    const y = base[i * 3 + 1];
    const nx = (x + W / 2) / W; // 0 at pole, 1 at free edge
    const z =
      Math.sin(nx * Math.PI * 1.6 + t * 3.0) * 0.22 * nx +
      Math.sin(y * 2.4 + t * 2.0) * 0.06 * nx;
    pos.setZ(i, z);
  }
  pos.needsUpdate = true;
}

/* ------------------------------------------------------------------ */
/* Airplane built from primitives                                      */
/* ------------------------------------------------------------------ */

function makeAirplane() {
  const group = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({
    color: 0xf3f4f6,
    metalness: 0.7,
    roughness: 0.3,
  });
  const accent = new THREE.MeshStandardMaterial({
    color: 0xc0392b,
    metalness: 0.5,
    roughness: 0.4,
  });

  // fuselage along Z (nose toward -Z)
  const fuselage = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.13, 1.5, 16),
    body
  );
  fuselage.rotation.x = Math.PI / 2;
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.4, 16), accent);
  nose.rotation.x = -Math.PI / 2;
  nose.position.z = -0.95;
  const tailCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.13, 0.35, 16),
    body
  );
  tailCone.rotation.x = Math.PI / 2;
  tailCone.position.z = 0.9;

  // wings (along X)
  const wing = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 0.45), body);
  // tailplane
  const tailWing = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.04, 0.25),
    body
  );
  tailWing.position.z = 0.85;
  // vertical fin
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.4, 0.35), accent);
  fin.position.set(0, 0.2, 0.85);

  group.add(fuselage, nose, tailCone, wing, tailWing, fin);

  // blinking nav lights (self-illuminated)
  const redLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff2200 })
  );
  redLight.position.set(-1.1, 0, 0);
  const whiteLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  whiteLight.position.set(1.1, 0, 0);
  const strobe = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  strobe.position.set(0, 0.4, 0.85);
  group.add(redLight, whiteLight, strobe);

  group.scale.setScalar(0.5);
  return { group, redLight, whiteLight, strobe };
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export default function RouteScene({ reduced = false }: { reduced?: boolean }) {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const chinaLabelRef = React.useRef<HTMLSpanElement>(null);
  const bdLabelRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    let width = mount.clientWidth;
    let height = mount.clientHeight;

    // tighter framing + 3D angle; pull elements inward a touch on mobile
    const spread = isMobile ? 0.78 : 1;
    const camRadius = isMobile ? 10.5 : 8.6;
    const camTarget = new THREE.Vector3(0, 0.1, 0.4);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      isMobile ? 54 : 47,
      width / height,
      0.1,
      100
    );
    camera.position.set(0, 2.2, camRadius);
    camera.lookAt(camTarget);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(3, 5, 6);
    const goldFill = new THREE.PointLight(0xffd700, 40, 40);
    goldFill.position.set(0, 3, 5);
    scene.add(key, goldFill);

    // starfield
    const starCount = isMobile ? 600 : 1400;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 40;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 24;
      starPos[i * 3 + 2] = -6 - Math.random() * 18;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.06,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      })
    );
    scene.add(stars);

    // flags
    const chinaFlag = makeFlag("china", "#de2910");
    chinaFlag.group.position.set(-4.0 * spread, 1.2, -0.3);
    chinaFlag.group.rotation.y = 0.32;
    const bdFlag = makeFlag("bangladesh", "#00b36a");
    bdFlag.group.position.set(1.6 * spread, 1.2, -0.3);
    bdFlag.group.rotation.y = -0.32;
    scene.add(chinaFlag.group, bdFlag.group);
    // cloth centres (pole + W/2) — used to anchor the DOM country labels
    const chinaFlagWorld = new THREE.Vector3(-2.8 * spread, 0.5, -0.3);
    const bdFlagWorld = new THREE.Vector3(2.8 * spread, 0.5, -0.3);

    // route curve + nodes
    const left = new THREE.Vector3(-3.6 * spread, -1.5, 0.3);
    const right = new THREE.Vector3(3.6 * spread, -1.5, 0.3);
    const control = new THREE.Vector3(0, 1.5, 2.6);
    const curve = new THREE.QuadraticBezierCurve3(left, control, right);

    // pins at both ends
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0x6a5200,
      metalness: 0.8,
      roughness: 0.3,
    });
    for (const p of [left, right]) {
      const pin = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), pinMat);
      pin.position.copy(p);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.03, 8, 32),
        new THREE.MeshBasicMaterial({
          color: 0xffd700,
          transparent: true,
          opacity: 0.5,
        })
      );
      ring.position.copy(p);
      ring.rotation.x = Math.PI / 2.2;
      scene.add(pin, ring);
    }

    // glowing dashed golden route line
    const routePts = curve.getPoints(140);
    const routeGeo = new THREE.BufferGeometry().setFromPoints(routePts);
    const routeMat = new THREE.LineDashedMaterial({
      color: 0xffd700,
      dashSize: 0.28,
      gapSize: 0.2,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const routeLine = new THREE.Line(routeGeo, routeMat);
    routeLine.computeLineDistances();
    routeLine.geometry.setDrawRange(0, 0);
    scene.add(routeLine);

    // flowing gold arrow chevrons that travel China -> Bangladesh
    const CHEV = isMobile ? 4 : 6;
    const chevMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const chevrons: THREE.Group[] = [];
    for (let i = 0; i < CHEV; i++) {
      const g = new THREE.Group();
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.13, 0.4, 14),
        chevMat
      );
      cone.rotation.x = -Math.PI / 2; // apex -> group -Z (travel direction)
      g.add(cone);
      g.visible = false;
      scene.add(g);
      chevrons.push(g);
    }

    // destination arrowhead at Bangladesh
    const destArrow = new THREE.Group();
    const destCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.28, 0.7, 18),
      new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0x6a5200,
        metalness: 0.7,
        roughness: 0.3,
      })
    );
    destCone.rotation.x = -Math.PI / 2;
    destArrow.add(destCone);
    {
      const endTan = curve.getTangentAt(0.999).normalize();
      destArrow.position.copy(right);
      destArrow.lookAt(right.clone().add(endTan));
    }
    destArrow.visible = false;
    scene.add(destArrow);

    // airplane + trail
    const plane = makeAirplane();
    scene.add(plane.group);

    const TRAIL = isMobile ? 36 : 64;
    const trailPos = new Float32Array(TRAIL * 3);
    const trailCol = new Float32Array(TRAIL * 3);
    for (let i = 0; i < TRAIL; i++) {
      const f = 1 - i / TRAIL; // newest = white, oldest = black (fades w/ additive)
      trailCol[i * 3] = f;
      trailCol[i * 3 + 1] = f;
      trailCol[i * 3 + 2] = f;
    }
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
    trailGeo.setAttribute("color", new THREE.BufferAttribute(trailCol, 3));
    const trail = new THREE.Points(
      trailGeo,
      new THREE.PointsMaterial({
        size: 0.16,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    scene.add(trail);
    const trailHistory: THREE.Vector3[] = Array.from(
      { length: TRAIL },
      () => left.clone()
    );

    // GSAP-driven animation state
    const state = { draw: 0, fly: 0 };
    let prevFly = 0;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
    tl.fromTo(
      state,
      { draw: 0 },
      { draw: 1, duration: 1.6, ease: "power2.inOut" }
    )
      .fromTo(
        state,
        { fly: 0 },
        { fly: 1, duration: 5, ease: "power1.inOut" },
        ">-0.2"
      )
      .to({}, { duration: 0.6 }); // brief hold before looping

    function resetTrail(at: THREE.Vector3) {
      for (const v of trailHistory) v.copy(at);
    }

    function placePlane(t: number) {
      const pos = curve.getPointAt(THREE.MathUtils.clamp(t, 0, 1));
      const tan = curve
        .getTangentAt(THREE.MathUtils.clamp(t, 0.001, 0.999))
        .normalize();
      plane.group.position.copy(pos);
      plane.group.lookAt(pos.clone().add(tan)); // nose (-Z) follows tangent
      plane.group.rotateZ(Math.sin(t * Math.PI) * 0.4); // bank into the arc
    }

    function updateLabel(
      el: HTMLSpanElement | null,
      world: THREE.Vector3
    ) {
      if (!el) return;
      const v = world.clone().project(camera);
      const x = (v.x * 0.5 + 0.5) * width;
      const y = (-v.y * 0.5 + 0.5) * height;
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, 8px)`;
      el.style.opacity = v.z < 1 ? "1" : "0";
    }

    const clock = new THREE.Clock();

    function renderFrame() {
      const t = clock.getElapsedTime();

      // gentle 3D orbit + bob for depth
      const orbit = Math.sin(t * 0.28) * 0.22;
      camera.position.x = Math.sin(orbit) * camRadius;
      camera.position.z = Math.cos(orbit) * camRadius;
      camera.position.y = 2.2 + Math.sin(t * 0.4) * 0.3;
      camera.lookAt(camTarget);

      waveFlag(chinaFlag, t);
      waveFlag(bdFlag, t);
      stars.rotation.y = t * 0.01;

      // route draw-in
      routeLine.geometry.setDrawRange(
        0,
        Math.floor(state.draw * routePts.length)
      );

      // plane along curve
      placePlane(state.fly);

      // trail (only while flying)
      if (state.fly < prevFly - 0.2) resetTrail(plane.group.position);
      prevFly = state.fly;
      trailHistory.pop();
      trailHistory.unshift(plane.group.position.clone());
      for (let i = 0; i < TRAIL; i++) {
        trailPos[i * 3] = trailHistory[i].x;
        trailPos[i * 3 + 1] = trailHistory[i].y;
        trailPos[i * 3 + 2] = trailHistory[i].z;
      }
      trailGeo.attributes.position.needsUpdate = true;

      // blinking lights
      const blink = Math.sin(t * 6) > 0;
      plane.redLight.visible = blink;
      plane.whiteLight.visible = !blink;
      plane.strobe.visible = Math.sin(t * 16) > 0.6;

      // flowing arrow chevrons toward Bangladesh (appear as the line draws)
      for (let i = 0; i < CHEV; i++) {
        const ct = ((t * 0.12 + i / CHEV) % 1 + 1) % 1;
        const show = ct <= state.draw + 0.02;
        chevrons[i].visible = show;
        if (show) {
          const cp = curve.getPointAt(ct);
          const ctan = curve
            .getTangentAt(THREE.MathUtils.clamp(ct, 0.001, 0.999))
            .normalize();
          chevrons[i].position.copy(cp);
          chevrons[i].lookAt(cp.clone().add(ctan));
        }
      }
      destArrow.visible = state.draw > 0.98;

      updateLabel(chinaLabelRef.current, chinaFlagWorld);
      updateLabel(bdLabelRef.current, bdFlagWorld);

      renderer.render(scene, camera);
    }

    // run loop with offscreen / hidden pausing
    let raf = 0;
    let visible = true;
    let hidden = document.hidden;
    const animate = () => {
      renderFrame();
      raf = requestAnimationFrame(animate);
    };
    const start = () => {
      if (reduced) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(animate);
      tl.play();
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      tl.pause();
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !hidden) start();
        else stop();
      },
      { threshold: 0.05 }
    );
    io.observe(mount);
    const onVis = () => {
      hidden = document.hidden;
      if (!hidden && visible) start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVis);

    if (reduced) {
      // static, representative frame
      state.draw = 1;
      state.fly = 0.5;
      tl.pause();
      renderFrame();
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
      tl.kill();
      io.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line) {
          obj.geometry?.dispose?.();
          const m = (obj as THREE.Mesh).material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose?.();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
  }, [reduced]);

  return (
    <div ref={mountRef} className="absolute inset-0">
      <span ref={chinaLabelRef} className="route-country-label">
        CHINA
      </span>
      <span ref={bdLabelRef} className="route-country-label">
        BANGLADESH
      </span>
    </div>
  );
}
