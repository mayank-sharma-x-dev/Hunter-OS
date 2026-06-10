import { usePlayerStats } from "@/hooks/usePlayerStats";
import { Progress } from "@/components/ui/progress";
import { Shield, Zap, Star, Crown, Swords, TrendingUp } from "lucide-react";

export const PlayerStatsCard = () => {
  const { 
    currentLevel, 
    currentExp, 
    expProgress, 
    expToNextLevel, 
    maxLevel, 
    rankInfo,
    stats 
  } = usePlayerStats();

  const getLevelMilestone = () => {
    if (currentLevel >= 251) return { next: maxLevel, label: "MAX RANK ACHIEVED" };
    if (currentLevel >= 201) return { next: 251, label: "S-RANK" };
    if (currentLevel >= 151) return { next: 201, label: "A-RANK" };
    if (currentLevel >= 101) return { next: 151, label: "B-RANK" };
    if (currentLevel >= 51) return { next: 101, label: "C-RANK" };
    return { next: 51, label: "D-RANK" };
  };

  const milestone = getLevelMilestone();
  const levelsToNextRank = milestone.next - currentLevel;

  return (
    <div className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-primary/30 card-anime">
      {/* Header with Rank */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center glow-primary">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2">
              <span className={`rank-badge ${rankInfo.class} text-xs font-bold px-2 py-0.5 rounded-full border-2`}>
                {rankInfo.rank}
              </span>
            </div>
          </div>
          <div>
            <h3 className="font-game text-xl text-primary">{rankInfo.label}</h3>
            <p className="text-xs text-muted-foreground font-ui">Hunter Classification</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-game text-3xl text-foreground">{currentLevel}</p>
          <p className="text-xs text-muted-foreground font-ui">LEVEL</p>
        </div>
      </div>

      {/* EXP Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-gold" />
            <span className="font-ui text-sm text-foreground">EXP Progress</span>
          </div>
          <span className="font-ui text-sm text-muted-foreground">
            {currentExp}/{expToNextLevel}
          </span>
        </div>
        <Progress value={expProgress} className="h-3 bg-background/50" />
        <p className="text-xs text-muted-foreground mt-1 font-ui">
          {expToNextLevel - currentExp} EXP to Level {currentLevel + 1}
        </p>
      </div>

      {/* Rank Progress */}
      {currentLevel < 251 && (
        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-gold/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-ui text-sm text-foreground">Next Rank: {milestone.label}</span>
          </div>
          <Progress 
            value={((currentLevel - (milestone.next - 50)) / 50) * 100} 
            className="h-2 bg-background/50" 
          />
          <p className="text-xs text-muted-foreground mt-1 font-ui">
            {levelsToNextRank} levels remaining
          </p>
        </div>
      )}

      {currentLevel >= 251 && (
        <div className="p-3 rounded-lg bg-gradient-to-r from-gold/20 to-primary/20 border border-gold/40">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-gold animate-pulse" />
            <span className="font-game text-gold">LEGENDARY HUNTER</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-ui">
            You have reached the pinnacle of power!
          </p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="p-2.5 rounded-lg bg-background/30 border border-border/50 text-center">
          <Star className="w-4 h-4 text-gold mx-auto mb-1" />
          <p className="font-game text-lg text-foreground">{stats?.total_exp ?? 0}</p>
          <p className="text-[10px] text-muted-foreground font-ui">TOTAL EXP</p>
        </div>
        <div className="p-2.5 rounded-lg bg-background/30 border border-border/50 text-center">
          <Swords className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="font-game text-lg text-foreground">{stats?.current_streak ?? 0}</p>
          <p className="text-[10px] text-muted-foreground font-ui">DAY STREAK</p>
        </div>
      </div>
    </div>
  );
};
