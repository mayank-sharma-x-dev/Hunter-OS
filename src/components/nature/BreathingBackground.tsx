interface BreathingBackgroundProps {
  className?: string;
  variant?: 'default' | 'subtle' | 'mist';
}

const BreathingBackground = ({ className = '', variant = 'default' }: BreathingBackgroundProps) => {
  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      {/* Main breathing gradient */}
      <div 
        className={`absolute inset-0 ${variant === 'subtle' ? 'animate-breathe-slow' : 'animate-breathe'}`}
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, hsl(var(--primary) / 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, hsl(var(--secondary) / 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, hsl(var(--accent) / 0.04) 0%, transparent 60%)
          `,
        }}
      />
      
      {/* Soft mist layer */}
      {(variant === 'mist' || variant === 'default') && (
        <div 
          className="absolute inset-0 animate-morning-mist"
          style={{
            background: `
              radial-gradient(ellipse at 20% 70%, hsl(var(--muted) / 0.15) 0%, transparent 40%),
              radial-gradient(ellipse at 80% 30%, hsl(var(--muted) / 0.12) 0%, transparent 45%)
            `,
          }}
        />
      )}

      {/* Gentle water-like ripple overlay */}
      <div 
        className="absolute inset-0 animate-water-ripple opacity-30"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.05) 0%, transparent 70%)
          `,
        }}
      />
    </div>
  );
};

export default BreathingBackground;
