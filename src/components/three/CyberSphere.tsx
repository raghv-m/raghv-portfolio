"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function DistortSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.12;
    meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.07) * 0.15;
  });

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.8, 64, 64]} />
        <MeshDistortMaterial
          color="#d4a017"
          transparent
          opacity={0.08}
          distort={0.35}
          speed={2}
          wireframe
        />
      </mesh>
    </Float>
  );
}

function OrbitRing({ radius, speed, tilt }: { radius: number; speed: number; tilt: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.getElapsedTime() * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.008, 8, 100]} />
      <meshBasicMaterial color="#d4a017" transparent opacity={0.15} />
    </mesh>
  );
}

export default function CyberSphere() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ background: "transparent" }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.3} />
      <Stars radius={60} depth={30} count={1500} factor={2} saturation={0} fade speed={0.3} />
      <DistortSphere />
      <OrbitRing radius={2.6} speed={0.15} tilt={Math.PI / 6} />
      <OrbitRing radius={3.2} speed={-0.1} tilt={Math.PI / 3} />
      <OrbitRing radius={3.8} speed={0.08} tilt={Math.PI / 2} />
    </Canvas>
  );
}
