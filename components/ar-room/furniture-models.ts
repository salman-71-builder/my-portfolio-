import * as THREE from "three";
import { FURNITURE_DIMS, type FurnitureType, type Dims } from "@/components/ar-room/furniture-types";

/**
 * Procedural low-poly furniture built from Three.js primitives.
 *
 * Real per-product GLTF models aren't available in the catalog, so we build
 * recognisable furniture in code with sensible real-world dimensions and
 * tintable surfaces (for colour variants). To use a real model instead, load a
 * `.glb` with GLTFLoader and return it from `buildFurniture` for that type.
 *
 * Pure metadata + detection helpers live in `furniture-types.ts` (no Three.js
 * import) so product listings can detect furniture without bundling 3D code.
 */

/* ------------------------------------------------------------------ */

function woodMat(hex: string, tintable = true) {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hex),
    roughness: 0.65,
    metalness: 0.05,
  });
  (m as THREE.Material).userData.tintable = tintable;
  return m;
}
function fabricMat(hex: string, tintable = true) {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hex),
    roughness: 0.95,
    metalness: 0.0,
  });
  (m as THREE.Material).userData.tintable = tintable;
  return m;
}
const legMat = () =>
  new THREE.MeshStandardMaterial({
    color: 0x2b2b2b,
    roughness: 0.4,
    metalness: 0.7,
  });

function box(
  w: number,
  h: number,
  d: number,
  mat: THREE.Material,
  x = 0,
  y = 0,
  z = 0
) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function legsAt(positions: [number, number][], h: number, r = 0.04) {
  const g = new THREE.Group();
  const mat = legMat();
  for (const [x, z] of positions) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 10), mat);
    leg.position.set(x, h / 2, z);
    leg.castShadow = true;
    g.add(leg);
  }
  return g;
}

/** Build furniture; bottom rests on y = 0. */
export function buildFurniture(
  type: FurnitureType,
  hex: string
): { group: THREE.Group; dims: Dims } {
  const g = new THREE.Group();
  const dims = FURNITURE_DIMS[type];
  const fab = fabricMat(hex);
  const wood = woodMat(hex);

  switch (type) {
    case "sofa": {
      const legH = 0.12;
      g.add(box(2.0, 0.25, 0.9, fab, 0, legH + 0.125, 0)); // seat base
      g.add(box(2.0, 0.5, 0.2, fab, 0, legH + 0.35, -0.35)); // backrest
      g.add(box(0.2, 0.45, 0.9, fab, -0.9, legH + 0.32, 0)); // left arm
      g.add(box(0.2, 0.45, 0.9, fab, 0.9, legH + 0.32, 0)); // right arm
      g.add(box(0.8, 0.12, 0.7, fab, -0.45, legH + 0.31, 0.05)); // cushion
      g.add(box(0.8, 0.12, 0.7, fab, 0.45, legH + 0.31, 0.05)); // cushion
      g.add(
        legsAt(
          [
            [-0.9, 0.35],
            [0.9, 0.35],
            [-0.9, -0.35],
            [0.9, -0.35],
          ],
          legH
        )
      );
      break;
    }
    case "table":
    case "desk": {
      const h = dims.h;
      const top = 0.06;
      g.add(box(dims.w, top, dims.d, wood, 0, h - top / 2, 0));
      const ex = dims.w / 2 - 0.08;
      const ez = dims.d / 2 - 0.08;
      g.add(
        legsAt(
          [
            [-ex, ez],
            [ex, ez],
            [-ex, -ez],
            [ex, -ez],
          ],
          h - top
        )
      );
      if (type === "desk")
        g.add(box(dims.w, 0.3, 0.04, wood, 0, h - top - 0.2, -dims.d / 2 + 0.06));
      break;
    }
    case "chair": {
      const seatH = 0.45;
      g.add(box(0.45, 0.06, 0.45, wood, 0, seatH, 0)); // seat
      g.add(box(0.45, 0.45, 0.05, fab, 0, seatH + 0.25, -0.2)); // back
      const ex = 0.18;
      g.add(
        legsAt(
          [
            [-ex, ex],
            [ex, ex],
            [-ex, -ex],
            [ex, -ex],
          ],
          seatH
        )
      );
      break;
    }
    case "bed": {
      g.add(box(2.0, 0.3, 1.6, wood, 0, 0.2, 0)); // frame
      g.add(box(1.9, 0.18, 1.5, fab, 0, 0.44, 0)); // mattress
      g.add(box(2.0, 0.6, 0.1, wood, 0, 0.5, -0.8)); // headboard
      g.add(box(0.6, 0.12, 0.4, fabricMat("#ffffff"), -0.5, 0.56, -0.5)); // pillow
      g.add(box(0.6, 0.12, 0.4, fabricMat("#ffffff"), 0.5, 0.56, -0.5)); // pillow
      break;
    }
    case "wardrobe": {
      g.add(box(1.2, 2.0, 0.6, wood, 0, 1.0, 0));
      g.add(box(0.02, 1.9, 0.62, legMat(), 0, 1.0, 0)); // door split
      g.add(box(0.05, 0.3, 0.05, legMat(), -0.25, 1.0, 0.3)); // handle
      g.add(box(0.05, 0.3, 0.05, legMat(), 0.25, 1.0, 0.3)); // handle
      break;
    }
    case "shelf": {
      const { w, h, d } = dims;
      g.add(box(0.05, h, d, wood, -w / 2, h / 2, 0));
      g.add(box(0.05, h, d, wood, w / 2, h / 2, 0));
      for (let i = 0; i <= 4; i++)
        g.add(box(w, 0.04, d, wood, 0, (h / 4) * i, 0));
      break;
    }
    case "tvunit": {
      g.add(box(1.7, 0.4, 0.4, wood, 0, 0.25, 0));
      g.add(box(0.5, 0.02, 0.38, legMat(), 0, 0.46, 0));
      g.add(legsAt([[-0.75, 0], [0.75, 0]], 0.05));
      break;
    }
    case "lamp": {
      g.add(box(0.3, 0.05, 0.3, legMat(), 0, 0.025, 0)); // base
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 1.2, 10),
        legMat()
      );
      pole.position.y = 0.65;
      g.add(pole);
      const shade = new THREE.Mesh(
        new THREE.ConeGeometry(0.28, 0.35, 24, 1, true),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(hex),
          emissive: new THREE.Color(hex),
          emissiveIntensity: 0.5,
          roughness: 0.6,
          side: THREE.DoubleSide,
        })
      );
      shade.userData.tintable = true;
      shade.material.userData.tintable = true;
      shade.position.y = 1.35;
      g.add(shade);
      break;
    }
    default: {
      g.add(box(dims.w, dims.h, dims.d, wood, 0, dims.h / 2, 0));
    }
  }

  g.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return { group: g, dims };
}

/** Re-tint all tintable materials of a built furniture group. */
export function tintFurniture(group: THREE.Group, hex: string) {
  const c = new THREE.Color(hex);
  group.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      const m = o.material as THREE.MeshStandardMaterial;
      if (m && m.userData?.tintable) {
        m.color.copy(c);
        if (m.emissive) m.emissive.copy(c);
      }
    }
  });
}
