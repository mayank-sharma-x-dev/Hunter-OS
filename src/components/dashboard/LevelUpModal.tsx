import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Star, Zap, TrendingUp, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { soundManager } from "@/lib/sounds";

interface LevelUpModalProps {
  open: boolean;
  onClose: () => void;
  level: number;
  previousLevel?: number;
}

const getLevelMilestone = (level: number) => {
  if (level === 100) return { type: 'legendary', message: 'SHADOW MONARCH UNLOCKED!', color: 'accent' };
  if (level === 50) return { type: 'epic', message: 'GUILD MASTER UNLOCKED!', color: 'gold' };
  if (level === 25) return { type: 'rare', message: 'ELITE HUNTER UNLOCKED!', color: 'secondary' };
  if (level % 10 === 0) return { type: 'milestone', message: 'MAJOR MILESTONE!', color: 'primary' };
  if (level % 5 === 0) return { type: 'minor', message: 'Keep pushing!', color: 'primary' };
  return null;
};

export const LevelUpModal = ({ open, onClose, level, previousLevel }: LevelUpModalProps) => {
  const [showParticles, setShowParticles] = useState(false);
  const milestone = getLevelMilestone(level);
  const isSpecial = milestone && ['legendary', 'epic', 'rare'].includes(milestone.type);

  useEffect(() => {
    if (open) {
      setShowParticles(true);
      const timer = setTimeout(() => setShowParticles(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const getColor = () => {
    if (milestone?.type === 'legendary') return 'accent';
    if (milestone?.type === 'epic') return 'gold';
    if (milestone?.type === 'rare') return 'secondary';
    return 'primary';
  };

  const color = getColor();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`bg-card/95 backdrop-blur-xl border-2 border-${color}/50 max-w-md overflow-hidden`}>
        {/* Animated background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute inset-0 bg-gradient-to-br from-${color}/30 to-transparent`} />
          <div className={`absolute top-0 left-1/4 w-48 h-48 bg-${color}/20 rounded-full blur-3xl animate-pulse`} />
          <div className={`absolute bottom-0 right-1/4 w-40 h-40 bg-${color}/20 rounded-full blur-2xl animate-pulse`} style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Particle explosion */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <Star
                key={i}
                className={`absolute w-3 h-3 text-${color} animate-ping`}
                style={{
                  left: `${50 + (Math.random() - 0.5) * 60}%`,
                  top: `${50 + (Math.random() - 0.5) * 60}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 text-center py-8">
          {/* Level circle */}
          <div className="relative mb-6">
            <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-${color}/30 to-${color}/10 border-4 border-${color}/50 flex items-center justify-center shadow-2xl shadow-${color}/30 animate-scale-in`}>
              <div className="text-center">
                <Sparkles className={`w-8 h-8 text-${color} mx-auto mb-1 animate-bounce`} />
                <span className={`font-game text-4xl text-${color}`}>{level}</span>
              </div>
            </div>
            
            {/* Orbiting icons */}
            <div className="absolute inset-0 animate-spin-slow">
              <Zap className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 w-6 h-6 text-${color}`} />
            </div>
            <div className="absolute inset-0 animate-spin-slow" style={{ animationDirection: 'reverse' }}>
              <Shield className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-3 w-6 h-6 text-${color}`} />
            </div>
          </div>

          {/* Level up text */}
          <h2 className={`font-game text-4xl text-${color} mb-2 animate-fade-in text-glow-${color}`}>
            LEVEL UP!
          </h2>
          
          {previousLevel && (
            <div className="flex items-center justify-center gap-2 mb-2 text-muted-foreground">
              <span className="font-game text-xl">{previousLevel}</span>
              <TrendingUp className={`w-5 h-5 text-${color}`} />
              <span className={`font-game text-xl text-${color}`}>{level}</span>
            </div>
          )}

          <p className="text-lg text-foreground mb-2">
            You're getting stronger, Hunter!
          </p>

          {milestone && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${color}/20 border border-${color}/40 mb-4`}>
              {isSpecial && <Crown className={`w-4 h-4 text-${color}`} />}
              <span className={`text-sm font-game text-${color}`}>{milestone.message}</span>
            </div>
          )}

          <p className="text-sm text-muted-foreground mb-6">
            Keep pushing forward to unlock your true potential.
          </p>

          <Button 
            onClick={onClose}
            size="lg"
            className={`font-game bg-${color}/20 border-2 border-${color}/50 text-${color} hover:bg-${color}/30`}
          >
            Continue Journey
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
