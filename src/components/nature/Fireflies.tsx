import { useMemo } from 'react';

interface Firefly {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
}

interface FirefliesProps {
  count?: number;
  className?: string;
}

const Fireflies = ({ count = 12, className = '' }: FirefliesProps) => {
  const fireflies = useMemo<Firefly[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 4 + Math.random() * 4,
      size: 3 + Math.random() * 3,
    }));
  }, [count]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {fireflies.map((firefly) => (
        <div
          key={firefly.id}
          className="absolute animate-firefly rounded-full"
          style={{
            left: `${firefly.x}%`,
            top: `${firefly.y}%`,
            width: `${firefly.size}px`,
            height: `${firefly.size}px`,
            backgroundColor: 'hsl(var(--gold))',
            boxShadow: `0 0 ${firefly.size * 3}px hsl(var(--gold) / 0.8), 0 0 ${firefly.size * 6}px hsl(var(--gold) / 0.4)`,
            ['--firefly-delay' as string]: `${firefly.delay}s`,
            ['--firefly-duration' as string]: `${firefly.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

export default Fireflies;
