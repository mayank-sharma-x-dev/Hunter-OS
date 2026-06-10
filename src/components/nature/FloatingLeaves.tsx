import { useMemo } from 'react';

interface Leaf {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  rotation: number;
}

interface FloatingLeavesProps {
  count?: number;
  className?: string;
}

const FloatingLeaves = ({ count = 8, className = '' }: FloatingLeavesProps) => {
  const leaves = useMemo<Leaf[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 12 + Math.random() * 8,
      size: 12 + Math.random() * 10,
      opacity: 0.4 + Math.random() * 0.3,
      rotation: Math.random() * 360,
    }));
  }, [count]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute animate-leaf-float"
          style={{
            left: `${leaf.x}%`,
            bottom: '-5%',
            ['--leaf-delay' as string]: `${leaf.delay}s`,
            ['--leaf-duration' as string]: `${leaf.duration}s`,
          }}
        >
          {/* Leaf SVG */}
          <svg
            width={leaf.size}
            height={leaf.size * 1.3}
            viewBox="0 0 24 32"
            fill="none"
            style={{
              opacity: leaf.opacity,
              transform: `rotate(${leaf.rotation}deg)`,
            }}
          >
            <path
              d="M12 0C12 0 3 8 3 18C3 24 7 30 12 32C17 30 21 24 21 18C21 8 12 0 12 0Z"
              fill="hsl(var(--primary))"
              fillOpacity="0.6"
            />
            <path
              d="M12 4L12 28"
              stroke="hsl(var(--primary))"
              strokeOpacity="0.8"
              strokeWidth="0.5"
            />
            <path
              d="M12 10L7 14M12 16L17 20M12 22L8 25"
              stroke="hsl(var(--primary))"
              strokeOpacity="0.5"
              strokeWidth="0.3"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default FloatingLeaves;
