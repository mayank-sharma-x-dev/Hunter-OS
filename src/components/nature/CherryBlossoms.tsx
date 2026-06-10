import { useMemo } from 'react';

interface CherryBlossomsProps {
  count?: number;
  className?: string;
}

const CherryBlossoms = ({ count = 12, className = '' }: CherryBlossomsProps) => {
  const petals = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 10 + Math.random() * 8,
      size: 8 + Math.random() * 10,
      rotation: Math.random() * 360,
      swayAmount: 30 + Math.random() * 40,
      opacity: 0.6 + Math.random() * 0.4,
    }));
  }, [count]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-10 ${className}`}>
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute animate-petal-fall"
          style={{
            left: `${petal.left}%`,
            top: '-20px',
            animationDelay: `${petal.delay}s`,
            animationDuration: `${petal.duration}s`,
            '--sway-amount': `${petal.swayAmount}px`,
          } as React.CSSProperties}
        >
          {/* Cherry blossom petal SVG */}
          <svg
            width={petal.size}
            height={petal.size}
            viewBox="0 0 24 24"
            style={{
              opacity: petal.opacity,
              transform: `rotate(${petal.rotation}deg)`,
              filter: 'drop-shadow(0 2px 4px rgba(236, 72, 153, 0.3))',
            }}
          >
            {/* Petal shape */}
            <ellipse
              cx="12"
              cy="10"
              rx="6"
              ry="9"
              fill="url(#petalGradient)"
              className="animate-petal-flutter"
              style={{
                animationDelay: `${petal.delay * 0.5}s`,
              }}
            />
            {/* Petal center detail */}
            <ellipse
              cx="12"
              cy="14"
              rx="2"
              ry="3"
              fill="hsl(330 70% 75%)"
              opacity="0.6"
            />
            <defs>
              <linearGradient id="petalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(350 80% 88%)" />
                <stop offset="50%" stopColor="hsl(340 75% 80%)" />
                <stop offset="100%" stopColor="hsl(330 70% 75%)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      ))}
    </div>
  );
};

export default CherryBlossoms;
