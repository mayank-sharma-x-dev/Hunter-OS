import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Crown, Shield, Swords, Star, Zap } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { useEffect } from "react";

interface RoleUpgradeModalProps {
  open: boolean;
  onClose: () => void;
  newRole: 'elite_hunter' | 'guild_master' | 'shadow_monarch';
  level: number;
}

const ROLE_CONFIG = {
  elite_hunter: {
    title: 'ELITE HUNTER',
    subtitle: 'Your skills have been recognized',
    description: 'You have proven yourself worthy. The guild acknowledges your exceptional abilities.',
    icon: Shield,
    bg: 'from-secondary/40 to-secondary/10',
    border: 'border-secondary',
    text: 'text-secondary',
    glow: 'shadow-2xl shadow-secondary/50',
  },
  guild_master: {
    title: 'GUILD MASTER',
    subtitle: 'Leader of the Hunters',
    description: 'You have risen above all others. Command respect. Lead the way.',
    icon: Crown,
    bg: 'from-gold/40 to-gold/10',
    border: 'border-gold',
    text: 'text-gold',
    glow: 'shadow-2xl shadow-gold/50',
  },
  shadow_monarch: {
    title: 'SHADOW MONARCH',
    subtitle: 'The Ultimate Power',
    description: 'You have transcended mortality. The shadows obey your command.',
    icon: Sparkles,
    bg: 'from-accent/40 via-primary/30 to-accent/10',
    border: 'border-accent',
    text: 'text-accent',
    glow: 'shadow-2xl shadow-accent/50 animate-pulse',
  },
};

export const RoleUpgradeModal = ({ open, onClose, newRole, level }: RoleUpgradeModalProps) => {
  const config = ROLE_CONFIG[newRole];
  const RoleIcon = config.icon;

  useEffect(() => {
    if (open) {
      soundManager.playLevelUp();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`bg-card/95 backdrop-blur-xl border-2 ${config.border} max-w-lg overflow-hidden`}>
        {/* Animated background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${config.bg}`} />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-current opacity-10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-current opacity-10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
          
          {/* Floating particles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <Star
              key={i}
              className={`absolute w-4 h-4 ${config.text} opacity-30 animate-float`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center py-8">
          {/* Icon with epic animation */}
          <div className="relative mb-6">
            <div className={`w-28 h-28 mx-auto rounded-full bg-gradient-to-br ${config.bg} border-4 ${config.border} flex items-center justify-center ${config.glow} animate-scale-in`}>
              <RoleIcon className={`w-14 h-14 ${config.text}`} />
            </div>
            
            {/* Orbiting elements */}
            <div className="absolute inset-0 animate-spin-slow">
              <Zap className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-5 h-5 ${config.text}`} />
            </div>
            <div className="absolute inset-0 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '4s' }}>
              <Sparkles className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-5 h-5 ${config.text}`} />
            </div>
          </div>

          {/* Level badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r ${config.bg} border ${config.border} mb-4`}>
            <Shield className={`w-4 h-4 ${config.text}`} />
            <span className={`font-game text-sm ${config.text}`}>LEVEL {level}</span>
          </div>

          <h2 className={`font-game text-3xl ${config.text} mb-2 animate-fade-in`}>
            {config.title}
          </h2>
          <p className="text-lg text-foreground/80 mb-2 font-ui">
            {config.subtitle}
          </p>
          <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto">
            {config.description}
          </p>

          {/* Perks unlocked */}
          <div className={`p-4 rounded-xl bg-gradient-to-r ${config.bg} border ${config.border} mb-6`}>
            <p className={`text-xs font-semibold uppercase ${config.text} mb-2`}>New Privileges Unlocked</p>
            <div className="flex items-center justify-center gap-4 text-sm text-foreground">
              <span>🎖️ New Badge</span>
              <span>⚡ Enhanced Status</span>
              <span>🏆 Exclusive Rank</span>
            </div>
          </div>

          <Button 
            onClick={onClose}
            size="lg"
            className={`font-game bg-gradient-to-r ${config.bg} border-2 ${config.border} ${config.text} hover:opacity-80 ${config.glow}`}
          >
            <RoleIcon className="w-5 h-5 mr-2" />
            Accept Your Power
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};