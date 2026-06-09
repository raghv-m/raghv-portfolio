"use client";
import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";
import * as THREE from "three";

function buildParticleData(count: number) {
  const pos = new Float32Array(count * 3);
  const nodes: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 22;
    const y = (Math.random() - 0.5) * 12;
    const z = (Math.random() - 0.5) * 8;
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    nodes.push([x, y, z]);
  }
  const connPts: number[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i][0] - nodes[j][0], dy = nodes[i][1] - nodes[j][1], dz = nodes[i][2] - nodes[j][2];
      if (Math.sqrt(dx*dx + dy*dy + dz*dz) < 4.5) connPts.push(...nodes[i], ...nodes[j]);
    }
  }
  const connGeom = new THREE.BufferGeometry();
  connGeom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(connPts), 3));
  return { positions: pos, connGeom };
}

const DESKTOP_PARTICLES = buildParticleData(180);
const MOBILE_PARTICLES  = buildParticleData(30);

function ParticleField() {
  const { mouse } = useThree();
  const { positions, connGeom } = typeof window !== "undefined" && window.innerWidth < 768
    ? MOBILE_PARTICLES
    : DESKTOP_PARTICLES;

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
  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 0, 10], fov: 55 }}
      style={{ background: "transparent" }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.2} />
      <Stars radius={80} depth={60} count={3000} factor={3} saturation={0} fade speed={0.5} />
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
        <Rings />
      </Float>
      <ParticleField />
    </Canvas>
  );
}
