import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Trail } from '@react-three/drei';
import * as THREE from 'three';

interface OrbProps {
  color?: string;
  scale?: number;
}

const Orb = ({ color = '#00d4ff', scale = 1 }: OrbProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <Float speed={4} rotationIntensity={1} floatIntensity={2}>
      <Trail
        width={2}
        length={4}
        color={color}
        attenuation={(t) => t * t}
      >
        <mesh ref={meshRef} scale={scale}>
          <Sphere args={[1, 64, 64]}>
            <MeshDistortMaterial
              color={color}
              attach="material"
              distort={0.5}
              speed={2}
              roughness={0}
              metalness={1}
              emissive={color}
              emissiveIntensity={0.8}
            />
          </Sphere>
        </mesh>
      </Trail>
    </Float>
  );
};

interface FloatingOrbProps {
  color?: string;
  className?: string;
  scale?: number;
}

export const FloatingOrb = ({ color = '#00d4ff', className = '', scale = 1 }: FloatingOrbProps) => {
  return (
    <div className={`${className}`}>
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} color={color} />
        <spotLight position={[-5, 5, 5]} angle={0.3} penumbra={1} intensity={0.5} color="#ffffff" />
        <Orb color={color} scale={scale} />
      </Canvas>
    </div>
  );
};
