import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Torus, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const Portal = () => {
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const ringRef3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (ringRef1.current) {
      ringRef1.current.rotation.x = time * 0.5;
      ringRef1.current.rotation.y = time * 0.3;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.x = -time * 0.4;
      ringRef2.current.rotation.z = time * 0.2;
    }
    if (ringRef3.current) {
      ringRef3.current.rotation.y = time * 0.6;
      ringRef3.current.rotation.z = -time * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group>
        <mesh ref={ringRef1}>
          <Torus args={[1.5, 0.05, 16, 100]}>
            <meshStandardMaterial
              color="#8b5cf6"
              emissive="#8b5cf6"
              emissiveIntensity={2}
              metalness={0.9}
              roughness={0.1}
            />
          </Torus>
        </mesh>
        <mesh ref={ringRef2}>
          <Torus args={[1.2, 0.04, 16, 100]}>
            <meshStandardMaterial
              color="#00d4ff"
              emissive="#00d4ff"
              emissiveIntensity={2}
              metalness={0.9}
              roughness={0.1}
            />
          </Torus>
        </mesh>
        <mesh ref={ringRef3}>
          <Torus args={[0.9, 0.03, 16, 100]}>
            <meshStandardMaterial
              color="#22c55e"
              emissive="#22c55e"
              emissiveIntensity={2}
              metalness={0.9}
              roughness={0.1}
            />
          </Torus>
        </mesh>
        <Sparkles
          count={50}
          scale={4}
          size={3}
          speed={0.5}
          color="#ffd700"
        />
      </group>
    </Float>
  );
};

interface MagicPortalProps {
  className?: string;
}

export const MagicPortal = ({ className = '' }: MagicPortalProps) => {
  return (
    <div className={`${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 5]} intensity={2} color="#8b5cf6" />
        <pointLight position={[5, 0, 0]} intensity={1} color="#00d4ff" />
        <pointLight position={[-5, 0, 0]} intensity={1} color="#22c55e" />
        <Portal />
      </Canvas>
    </div>
  );
};
