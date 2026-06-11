/* eslint-disable react-hooks/purity */
"use client";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function ParticleField() {
  const { mouse } = useThree();

  const { positions, connections } = useMemo(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const count = isMobile ? 30 : 180;
    const pos = new Float32Array(count * 3);
    const nodes: [number, number, number][] = [];

    for (let i = 0; i < count; i++) {
      // eslint-disable-next-line react-hooks/purity
      const x = (Math.random() - 0.5) * 22;
      const y = (Math.random() - 0.5) * 12;
      const z = (Math.random() - 0.5) * 8;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      nodes.push([x, y, z]);
    }

    const connPts: number[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i][0] - nodes[j][0];
        const dy = nodes[i][1] - nodes[j][1];
        const dz = nodes[i][2] - nodes[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 4.5) connPts.push(...nodes[i], ...nodes[j]);
      }
    }

    return { positions: pos, connections: new Float32Array(connPts) };
  }, []);

  const connGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(connections, 3));
    return g;
  }, [connections]);

  return (
    <RotatingGroup positions={positions} connGeom={connGeom} mouse={mouse} />
  );
}

function RotatingGroup({
  positions,
  connGeom,
  mouse,
}: {
  positions: Float32Array;
  connGeom: THREE.BufferGeometry;
  mouse: THREE.Vector2;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsed = useRef(0);

  useFrame((_state, delta) => {
    elapsed.current += delta;
    if (!groupRef.current) return;
    groupRef.current.rotation.y = elapsed.current * 0.04 + mouse.x * 0.3;
    groupRef.current.rotation.x =
      Math.sin(elapsed.current * 0.02) * 0.08 + mouse.y * -0.2;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#d4a017"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      <lineSegments geometry={connGeom}>
        <lineBasicMaterial color="#d4a017" transparent opacity={0.08} />
      </lineSegments>

      {(
        [
          [0, 0, 0],
          [3, 2, -1],
          [-4, -1, 1],
          [2, -3, 2],
          [-2, 3, -2],
        ] as [number, number, number][]
      ).map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#f0c040" />
        </mesh>
      ))}
    </group>
  );
}

function Rings() {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);

  useFrame((_state, delta) => {
    elapsed.current += delta;
    if (ring1.current) ring1.current.rotation.z = elapsed.current * 0.1;
    if (ring2.current) ring2.current.rotation.z = -elapsed.current * 0.07;
  });

  return (
    <>
      <mesh ref={ring1} position={[0, 0, -3]}>
        <torusGeometry args={[8, 0.02, 8, 120]} />
        <meshBasicMaterial color="#d4a017" transparent opacity={0.06} />
      </mesh>
      <mesh ref={ring2} position={[0, 0, -3]}>
        <torusGeometry args={[12, 0.01, 8, 120]} />
        <meshBasicMaterial color="#d4a017" transparent opacity={0.04} />
      </mesh>
    </>
  );
}

export default function HeroScene() {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onVis = () => setIsVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);

    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting && !document.hidden),
      { threshold: 0 }
    );
    if (containerRef.current) obs.observe(containerRef.current);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      obs.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Canvas
        className="absolute inset-0"
        camera={{ position: [0, 0, 10], fov: 55 }}
        style={{ background: "transparent" }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        frameloop={isVisible ? "always" : "never"}
      >
        <ambientLight intensity={0.2} />
        <ParticleField />
        <Rings />
      </Canvas>
    </div>
  );
}
