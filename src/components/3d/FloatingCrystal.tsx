import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface CrystalProps {
  color?: string;
  scale?: number;
  distort?: number;
  speed?: number;
}

const Crystal = ({ color = '#8b5cf6', scale = 1, distort = 0.4, speed = 2 }: CrystalProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={3}
          roughness={0.1}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
      <Sparkles
        count={20}
        scale={3}
        size={2}
        speed={0.4}
        color={color}
      />
    </Float>
  );
};

interface FloatingCrystalProps {
  color?: string;
  className?: string;
  scale?: number;
}

export const FloatingCrystal = ({ color = '#8b5cf6', className = '', scale = 1 }: FloatingCrystalProps) => {
  return (
    <div className={`${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color={color} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00d4ff" />
        <Crystal color={color} scale={scale} />
      </Canvas>
    </div>
  );
};
