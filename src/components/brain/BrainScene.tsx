import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Environment, Html, Lightformer, Sparkles } from "@react-three/drei";
import { useCallback, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { SECTIONS, STRUCTURE_INFO, scrollState, type StructureId } from "@/lib/brain-data";
import { useDeviceCaps } from "@/hooks/use-mobile";

/* ---------- Procedural anatomy helpers ----------
 * The cortex is generated procedurally (ridged wave noise displacing an ellipsoid)
 * so the site works with zero external files.
 */
function makeRng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const WAVES = (() => {
  const r = makeRng(7);
  return Array.from({ length: 14 }, () => {
    const d = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
    return { d, f: 13 + r() * 10, p: r() * 6.28 };
  });
})();

function gyri(p: THREE.Vector3) {
  let s = 0;
  for (const w of WAVES) s += Math.sin(p.dot(w.d) * w.f + w.p);
  s /= Math.sqrt(WAVES.length);
  return 1 - Math.min(1, Math.abs(s)); // ridged: 1 on gyrus crest, 0 in sulcus
}

/* Mobile: use lower tessellation to reduce vertex count */
function useHemisphereGeometry(side: 1 | -1, reduceQuality = false) {
  return useMemo(() => {
    const segs = reduceQuality ? 80 : 160;
    const rings = reduceQuality ? 60 : 120;
    const g = new THREE.SphereGeometry(1, segs, rings);
    const pos = g.attributes["position"] as THREE.BufferAttribute;
    const colors: number[] = [];
    const v = new THREE.Vector3();
    const base = new THREE.Color("#d9a7a0");
    const deep = new THREE.Color("#5a2a33");
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      // Medial face flattening
      const medial = v.x * side < 0;
      if (medial) v.x *= 0.1;
      // Temporal lobe bulge low & forward, occipital taper
      const temporal = Math.max(0, -v.y) * Math.max(0, v.z + 0.3) * 0.25;
      v.x += side * temporal;
      v.y -= Math.max(0, -v.y) * 0.1;
      const ridge = gyri(v);
      const k = 1 + (ridge - 0.5) * (medial ? 0.03 : 0.08);
      v.multiplyScalar(k);
      v.set(v.x * 0.64 + side * 0.09, v.y * 0.82 + 0.15, v.z * 1.18);
      pos.setXYZ(i, v.x, v.y, v.z);
      const c = deep.clone().lerp(base, Math.pow(ridge, 1.6));
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [side, reduceQuality]);
}

function useCerebellumGeometry(reduceQuality = false) {
  return useMemo(() => {
    const segs = reduceQuality ? 60 : 120;
    const rings = reduceQuality ? 45 : 90;
    const g = new THREE.SphereGeometry(1, segs, rings);
    const pos = g.attributes["position"] as THREE.BufferAttribute;
    const colors: number[] = [];
    const v = new THREE.Vector3();
    const a = new THREE.Color("#c98f8a");
    const b = new THREE.Color("#6e3540");
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const folia = 0.5 + 0.5 * Math.sin(v.y * 34 + v.z * 6);
      v.multiplyScalar(1 + folia * 0.035);
      v.set(v.x * 0.82, v.y * 0.36 - 0.62, v.z * 0.5 - 0.82);
      pos.setXYZ(i, v.x, v.y, v.z);
      const c = b.clone().lerp(a, folia);
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [reduceQuality]);
}

function tube(points: [number, number, number][], radius: number, reduceQuality = false) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const tubSegs = reduceQuality ? 32 : 64;
  const radSegs = reduceQuality ? 10 : 20;
  return new THREE.TubeGeometry(curve, tubSegs, radius, radSegs, false);
}

/* ---------- Highlightable structure ---------- */
const ACCENT = new THREE.Color("#5fd4ff");

function useStructureMaterial(color: string, id: StructureId, opaqueWhenCutaway = true) {
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.55,
        clearcoat: 0.4,
        clearcoatRoughness: 0.5,
        sheen: 0.6,
        sheenColor: new THREE.Color("#ffd5d0"),
        emissive: ACCENT,
        emissiveIntensity: 0,
        transparent: true,
      }),
    [color],
  );
  useFrame((state, dt) => {
    const s = scrollState.progress * (SECTIONS.length - 1);
    const sec = SECTIONS[Math.round(s)]!;
    const active = sec.focus === id;
    const anyFocus = sec.focus !== null;
    const pulse = 0.35 + 0.25 * Math.sin(state.clock.elapsedTime * 2.5);
    const targetE = active ? pulse : 0;
    const targetO = !anyFocus || active || !opaqueWhenCutaway ? 1 : 0.35;
    const k = 1 - Math.exp(-6 * dt);
    mat.emissiveIntensity += (targetE - mat.emissiveIntensity) * k;
    mat.opacity += (targetO - mat.opacity) * k;
  });
  return mat;
}

interface PickProps {
  onPick: (id: StructureId) => void;
  reduceQuality?: boolean;
}

function pickHandler(id: StructureId, onPick: (id: StructureId) => void) {
  return (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onPick(id);
  };
}

function Cortex({ onPick, reduceQuality = false }: PickProps) {
  const left = useHemisphereGeometry(-1, reduceQuality);
  const right = useHemisphereGeometry(1, reduceQuality);
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.6,
        clearcoat: 0.5,
        clearcoatRoughness: 0.4,
        sheen: 0.8,
        sheenColor: new THREE.Color("#ffd9d2"),
        emissive: ACCENT,
        emissiveIntensity: 0,
        transparent: true,
        side: THREE.DoubleSide,
      }),
    [],
  );
  useFrame((state, dt) => {
    const s = scrollState.progress * (SECTIONS.length - 1);
    const i = Math.floor(s);
    const t = s - i;
    const a = SECTIONS[i]!;
    const b = SECTIONS[Math.min(i + 1, SECTIONS.length - 1)]!;
    const cut = THREE.MathUtils.lerp(a.cutaway, b.cutaway, t);
    const active = SECTIONS[Math.round(s)]!.focus === "cerebrum";
    const k = 1 - Math.exp(-6 * dt);
    const targetO = 1 - cut * 0.88;
    mat.opacity += (targetO - mat.opacity) * k;
    mat.depthWrite = mat.opacity > 0.95;
    const e = active ? 0.12 + 0.08 * Math.sin(state.clock.elapsedTime * 2.5) : 0;
    mat.emissiveIntensity += (e - mat.emissiveIntensity) * k;
  });
  const h = pickHandler("cerebrum", onPick);
  return (
    <group renderOrder={2}>
      <mesh geometry={left} material={mat} onClick={h} castShadow />
      <mesh geometry={right} material={mat} onClick={h} castShadow />
    </group>
  );
}

function Internal({ onPick, reduceQuality = false }: PickProps) {
  const rq = reduceQuality;
  const corpusGeo = useMemo(
    () => tube([[0, -0.05, 0.55], [0, 0.22, 0.42], [0, 0.32, 0.05], [0, 0.28, -0.35], [0, 0.08, -0.55]], 0.07, rq),
    [rq],
  );
  const hippoL = useMemo(() => tube([[-0.42, -0.3, 0.12], [-0.5, -0.36, -0.12], [-0.45, -0.25, -0.42], [-0.28, -0.05, -0.5]], 0.055, rq), [rq]);
  const hippoR = useMemo(() => tube([[0.42, -0.3, 0.12], [0.5, -0.36, -0.12], [0.45, -0.25, -0.42], [0.28, -0.05, -0.5]], 0.055, rq), [rq]);
  const stemGeo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0.001, -1.55),
      new THREE.Vector2(0.11, -1.5),
      new THREE.Vector2(0.13, -1.1),
      new THREE.Vector2(0.21, -0.85), // pons bulge
      new THREE.Vector2(0.19, -0.65),
      new THREE.Vector2(0.16, -0.4),
      new THREE.Vector2(0.001, -0.3),
    ];
    const latheSegs = rq ? 24 : 48;
    const g = new THREE.LatheGeometry(pts, latheSegs);
    g.rotateX(-0.25);
    g.translate(0, 0, -0.32);
    return g;
  }, [rq]);
  const cereGeo = useCerebellumGeometry(rq);

  const corpus = useStructureMaterial("#f1e4d6", "corpus");
  const thal = useStructureMaterial("#c99aa5", "thalamus");
  const hypo = useStructureMaterial("#d8a07f", "hypothalamus");
  const hippo = useStructureMaterial("#b9a3d8", "hippocampus");
  const amyg = useStructureMaterial("#e0898f", "amygdala");
  const stem = useStructureMaterial("#d1a69c", "brainstem");
  const cere = useStructureMaterial("#ffffff", "cerebellum");
  cere.vertexColors = true;

  const sphereHi: [number, number, number] = rq ? [1, 24, 18] : [1, 40, 30];
  const sphereMd: [number, number, number] = rq ? [1, 20, 14] : [1, 32, 24];
  const sphereLo: [number, number, number] = rq ? [1, 16, 12] : [1, 28, 20];
  const sphereXs: [number, number, number] = rq ? [1, 10, 8] : [1, 16, 12];

  return (
    <group>
      <mesh geometry={corpusGeo} material={corpus} onClick={pickHandler("corpus", onPick)} />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.13, -0.05, -0.1]} scale={[0.11, 0.13, 0.2]} material={thal} onClick={pickHandler("thalamus", onPick)}>
          <sphereGeometry args={sphereHi} />
        </mesh>
      ))}
      <mesh position={[0, -0.3, 0.12]} scale={[0.09, 0.08, 0.11]} material={hypo} onClick={pickHandler("hypothalamus", onPick)}>
        <sphereGeometry args={sphereMd} />
      </mesh>
      <mesh position={[0, -0.42, 0.18]} scale={[0.035, 0.08, 0.035]} material={hypo}>
        <sphereGeometry args={sphereXs} />
      </mesh>
      <mesh geometry={hippoL} material={hippo} onClick={pickHandler("hippocampus", onPick)} />
      <mesh geometry={hippoR} material={hippo} onClick={pickHandler("hippocampus", onPick)} />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.44, -0.33, 0.24]} scale={[0.075, 0.07, 0.085]} material={amyg} onClick={pickHandler("amygdala", onPick)}>
          <sphereGeometry args={sphereLo} />
        </mesh>
      ))}
      <mesh geometry={stemGeo} material={stem} onClick={pickHandler("brainstem", onPick)} castShadow />
      <mesh geometry={cereGeo} material={cere} onClick={pickHandler("cerebellum", onPick)} castShadow />
    </group>
  );
}

const LABEL_POS: Record<StructureId, [number, number, number]> = {
  cerebrum: [0.6, 0.85, 0.3],
  corpus: [0, 0.38, 0.05],
  thalamus: [0.15, 0.08, -0.1],
  hypothalamus: [0, -0.3, 0.2],
  hippocampus: [0.5, -0.33, -0.15],
  amygdala: [0.48, -0.33, 0.3],
  brainstem: [0.18, -0.9, -0.3],
  cerebellum: [0.5, -0.6, -1.0],
};

function ActiveLabel() {
  const ref = useRef<HTMLDivElement>(null);
  const groupRef = useRef<THREE.Group>(null);
  const last = useRef<string>("");
  useFrame(() => {
    const sec = SECTIONS[Math.round(scrollState.progress * (SECTIONS.length - 1))]!;
    if (!groupRef.current || !ref.current) return;
    if (sec.focus) {
      groupRef.current.position.set(...LABEL_POS[sec.focus]);
      if (last.current !== sec.focus) {
        ref.current.querySelector("span")!.textContent = STRUCTURE_INFO[sec.focus].name;
        last.current = sec.focus;
      }
      ref.current.style.opacity = "1";
    } else {
      ref.current.style.opacity = "0";
    }
  });
  return (
    <group ref={groupRef}>
      <Html zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <div ref={ref} className="brain-label">
          <i className="brain-label-dot" />
          <i className="brain-label-line" />
          <span />
        </div>
      </Html>
    </group>
  );
}

/* ---------- Scroll-driven camera ---------- */
const smooth = (t: number) => t * t * (3 - 2 * t);

function CameraRig({
  dragRef,
  brainRef,
  camDistMultiplier = 1,
}: {
  dragRef: React.RefObject<{ yaw: number }>;
  brainRef: React.RefObject<THREE.Group | null>;
  camDistMultiplier?: number;
}) {
  const { camera } = useThree();
  const idleYaw = useRef(0);
  const look = useRef(new THREE.Vector3(0, 0, 0));
  const goalPos = new THREE.Vector3();
  const goalLook = new THREE.Vector3();
  useFrame((_state, raw) => {
    const dt = Math.min(raw, 0.05);
    const s = scrollState.progress * (SECTIONS.length - 1);
    const i = Math.min(Math.floor(s), SECTIONS.length - 2);
    const t = smooth(Math.min(1, s - i));
    const a = SECTIONS[i]!;
    const b = SECTIONS[i + 1]!;
    goalPos.set(...a.cam).lerp(new THREE.Vector3(...b.cam), t);
    goalLook.set(...a.target).lerp(new THREE.Vector3(...b.target), t);

    /* Mobile camera: adjust distance multiplier */
    if (camDistMultiplier !== 1) {
      const dir = goalPos.clone().sub(goalLook).normalize();
      const dist = goalPos.distanceTo(goalLook);
      goalPos.copy(goalLook).addScaledVector(dir, dist * camDistMultiplier);
    }

    // Drag + idle drift rotate the brain itself
    if (brainRef.current) {
      const idleOn = s < 0.5 || s > SECTIONS.length - 1.5;
      if (idleOn) idleYaw.current += dt * 0.15;
      else idleYaw.current += (0 - idleYaw.current) * (1 - Math.exp(-2 * dt));
      const goal = (dragRef.current?.yaw ?? 0) + idleYaw.current;
      brainRef.current.rotation.y += (goal - brainRef.current.rotation.y) * (1 - Math.exp(-5 * dt));
    }
    const k = 1 - Math.exp(-3.5 * dt);
    camera.position.lerp(goalPos, k);
    look.current.lerp(goalLook, k);
    camera.lookAt(look.current);
  });
  return null;
}

function FovAdjuster({ targetFov }: { targetFov: number }) {
  const { camera } = useThree();
  useFrame((_s, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    const k = 1 - Math.exp(-3 * dt);
    cam.fov += (targetFov - cam.fov) * k;
    cam.updateProjectionMatrix();
  });
  return null;
}

function SceneContent({
  onPick,
  reduceQuality,
  dragRef,
  brainRef,
  camDistMultiplier,
  targetFov,
}: {
  onPick: (id: StructureId) => void;
  reduceQuality: boolean;
  dragRef: React.RefObject<{ yaw: number }>;
  brainRef: React.RefObject<THREE.Group | null>;
  camDistMultiplier: number;
  targetFov: number;
}) {
  return (
    <>
      <color attach="background" args={["#05070f"]} />
      <fog attach="fog" args={["#05070f", 5, 14]} />

      <ambientLight intensity={reduceQuality ? 0.35 : 0.25} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={2.2}
        color="#fff1ea"
        castShadow={!reduceQuality}
        shadow-mapSize={reduceQuality ? [256, 256] : [1024, 1024]}
      />
      <pointLight position={[-4, 1, -3]} intensity={reduceQuality ? 10 : 18} color="#6a7cff" />
      {!reduceQuality && (
        <pointLight position={[3, -2, -3]} intensity={12} color="#3fd0ff" />
      )}

      <Environment resolution={reduceQuality ? 64 : 128}>
        <Lightformer intensity={1.6} position={[0, 5, 2]} scale={[8, 8, 1]} color="#ffe8e0" />
        {!reduceQuality && (
          <>
            <Lightformer intensity={1} position={[-5, 0, -2]} rotation-y={Math.PI / 2} scale={[12, 2, 1]} color="#7d8cff" />
            <Lightformer intensity={0.8} position={[5, -1, 0]} rotation-y={-Math.PI / 2} scale={[12, 2, 1]} color="#5fd4ff" />
          </>
        )}
      </Environment>

      <Sparkles
        count={reduceQuality ? 30 : 90}
        scale={[12, 7, 12]}
        size={reduceQuality ? 0.4 : 0.5}
        speed={0.25}
        opacity={0.35}
        color="#8fb7ff"
      />

      <group ref={brainRef}>
        <Internal onPick={onPick} reduceQuality={reduceQuality} />
        <Cortex onPick={onPick} reduceQuality={reduceQuality} />
        <ActiveLabel />
      </group>

      <CameraRig dragRef={dragRef} brainRef={brainRef} camDistMultiplier={camDistMultiplier} />
      <FovAdjuster targetFov={targetFov} />
    </>
  );
}

export default function BrainScene({ onPick }: { onPick: (id: StructureId) => void }) {
  const device = useDeviceCaps();
  const drag = useRef({ yaw: 0, down: false, x: 0 });
  const brainRef = useRef<THREE.Group>(null);

  /* Touch gestures */
  const touchState = useRef({
    touches: [] as { id: number; x: number; y: number }[],
    lastPinchDist: 0,
    isPinching: false,
    lastX: 0,
  });

  const [zoomMultiplier, setZoomMultiplier] = useState(1);

  const camDistMultiplier = useMemo(() => {
    let base = 1;
    if (device.isSmallPhone) base = 1.45;
    else if (device.isMobile) base = 1.3;
    else if (device.isTablet) base = 1.15;
    if ((device.isMobile || device.isTablet) && device.orientation === "portrait") {
      base *= 1.1;
    }
    return base * zoomMultiplier;
  }, [device.isMobile, device.isTablet, device.isSmallPhone, device.orientation, zoomMultiplier]);

  const targetFov = useMemo(() => {
    if (device.isSmallPhone) return 52;
    if (device.isMobile) return 48;
    if (device.isTablet) return 44;
    return 42;
  }, [device.isMobile, device.isTablet, device.isSmallPhone]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const ts = touchState.current;
    ts.touches = Array.from(e.touches).map((t) => ({ id: t.identifier, x: t.clientX, y: t.clientY }));
    if (e.touches.length === 1) {
      ts.lastX = e.touches[0]!.clientX;
      ts.isPinching = false;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0]!.clientX - e.touches[1]!.clientX;
      const dy = e.touches[0]!.clientY - e.touches[1]!.clientY;
      ts.lastPinchDist = Math.hypot(dx, dy);
      ts.isPinching = true;
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const ts = touchState.current;
    if (e.touches.length === 1 && !ts.isPinching) {
      const x = e.touches[0]!.clientX;
      const dx = x - ts.lastX;
      drag.current.yaw += dx * 0.008;
      ts.lastX = x;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0]!.clientX - e.touches[1]!.clientX;
      const dy = e.touches[0]!.clientY - e.touches[1]!.clientY;
      const dist = Math.hypot(dx, dy);
      if (ts.lastPinchDist > 0) {
        const scale = ts.lastPinchDist / dist;
        setZoomMultiplier((prev) => Math.max(0.5, Math.min(2.5, prev * scale)));
      }
      ts.lastPinchDist = dist;
      ts.isPinching = true;
    }
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const ts = touchState.current;
    ts.touches = Array.from(e.touches).map((t) => ({ id: t.identifier, x: t.clientX, y: t.clientY }));
    if (e.touches.length < 2) {
      ts.isPinching = false;
      ts.lastPinchDist = 0;
    }
    if (e.touches.length === 1) {
      ts.lastX = e.touches[0]!.clientX;
    }
  }, []);

  return (
    <Canvas
      className="brain-canvas"
      dpr={device.dpr}
      shadows={!device.reduceQuality}
      camera={{ position: [0, 0.3, 5.2], fov: targetFov, near: 0.05, far: 60 }}
      gl={{
        antialias: !device.reduceQuality,
        toneMapping: THREE.ACESFilmicToneMapping,
        powerPreference: device.reduceQuality ? "low-power" : "high-performance",
      }}
      onPointerDown={(e) => {
        if (device.isTouch) return;
        drag.current.down = true;
        drag.current.x = e.clientX;
      }}
      onPointerUp={() => {
        if (device.isTouch) return;
        drag.current.down = false;
      }}
      onPointerLeave={() => {
        if (device.isTouch) return;
        drag.current.down = false;
      }}
      onPointerMove={(e) => {
        if (device.isTouch) return;
        if (!drag.current.down) return;
        drag.current.yaw += (e.clientX - drag.current.x) * 0.006;
        drag.current.x = e.clientX;
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <SceneContent
        onPick={onPick}
        reduceQuality={device.reduceQuality}
        dragRef={drag}
        brainRef={brainRef}
        camDistMultiplier={camDistMultiplier}
        targetFov={targetFov}
      />
    </Canvas>
  );
}
