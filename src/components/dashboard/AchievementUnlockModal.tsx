import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Achievement } from "@/hooks/useAchievements";
import { Trophy, Sparkles, Star, Crown, Shield, Swords } from "lucide-react";

interface AchievementUnlockModalProps {
  open: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

const RARITY_CONFIG = {
  common: { 
    bg: 'from-muted/30 to-muted/10', 
    border: 'border-muted-foreground/30',
    text: 'text-muted-foreground',
    glow: 'shadow-lg shadow-muted-foreground/20'
  },
  rare: { 
    bg: 'from-secondary/30 to-secondary/10', 
    border: 'border-secondary/50',
    text: 'text-secondary',
    glow: 'shadow-lg shadow-secondary/30'
  },
  epic: { 
    bg: 'from-primary/30 to-primary/10', 
    border: 'border-primary/50',
    text: 'text-primary',
    glow: 'shadow-lg shadow-primary/30'
  },
  legendary: { 
    bg: 'from-gold/30 to-gold/10', 
    border: 'border-gold/50',
    text: 'text-gold',
    glow: 'shadow-lg shadow-gold/30 animate-pulse'
  },
};

export const AchievementUnlockModal = ({ open, onClose, achievements }: AchievementUnlockModalProps) => {
  if (achievements.length === 0) return null;

  const highestRarity = achievements.reduce((highest, a) => {
    const order = ['common', 'rare', 'epic', 'legendary'];
    return order.indexOf(a.rarity) > order.indexOf(highest) ? a.rarity : highest;
  }, achievements[0].rarity);

  const config = RARITY_CONFIG[highestRarity];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`bg-card/95 backdrop-blur-xl border-2 ${config.border} max-w-md overflow-hidden`}>
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} opacity-50`} />
          <div className="absolute top-0 left-1/4 w-40 h-40 bg-current opacity-10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-current opacity-10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="relative z-10 text-center py-6">
          {/* Trophy icon with animation */}
          <div className="relative mb-6">
            <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${config.bg} border-2 ${config.border} flex items-center justify-center ${config.glow}`}>
              <Trophy className={`w-10 h-10 ${config.text}`} />
            </div>
            <Sparkles className={`absolute top-0 right-1/3 w-6 h-6 ${config.text} animate-bounce`} />
            <Sparkles className={`absolute bottom-0 left-1/3 w-5 h-5 ${config.text} animate-bounce`} style={{ animationDelay: '0.3s' }} />
          </div>

          <h2 className={`font-game text-2xl ${config.text} mb-2`}>
            ACHIEVEMENT{achievements.length > 1 ? 'S' : ''} UNLOCKED!
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {achievements.length > 1 ? `You unlocked ${achievements.length} achievements!` : 'A new achievement has been unlocked!'}
          </p>

          <div className="space-y-3 mb-6">
            {achievements.map((achievement) => {
              const achievementConfig = RARITY_CONFIG[achievement.rarity];
              return (
                <div 
                  key={achievement.key}
                  className={`p-4 rounded-xl bg-gradient-to-r ${achievementConfig.bg} border ${achievementConfig.border} ${achievementConfig.glow}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{achievement.icon}</span>
                    <div className="text-left">
                      <h3 className={`font-game text-lg ${achievementConfig.text}`}>{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <span className={`text-xs font-medium uppercase ${achievementConfig.text}`}>
                        {achievement.rarity}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Button 
            onClick={onClose}
            className={`font-game bg-gradient-to-r ${config.bg} border ${config.border} ${config.text} hover:opacity-80`}
          >
            Continue Journey
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};