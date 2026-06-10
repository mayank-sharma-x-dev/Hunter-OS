import { Card } from "@/components/ui/card";
import { Trophy, Zap, Target, Award, Flame, Shield, Crown, Star, Swords } from "lucide-react";
import { Achievement, StreakData } from "@/pages/Dashboard";
import { useAchievements, ACHIEVEMENTS } from "@/hooks/useAchievements";
import { Progress } from "@/components/ui/progress";

interface AchievementsColumnProps {
  achievements: Achievement[];
  level: number;
  exp: number;
  tasksCompleted: number;
  streak: StreakData;
}

export const AchievementsColumn = ({
  achievements,
  level,
  exp,
  tasksCompleted,
  streak,
}: AchievementsColumnProps) => {
  const { getUnlockedAchievements, getProgress, unlockedKeys } = useAchievements();
  const progress = getProgress();

  const getBotMessage = () => {
    if (streak.currentStreak >= 30) {
      return `${streak.currentStreak} day streak! You've become a legendary Hunter!`;
    } else if (streak.currentStreak >= 7) {
      return `🔥 ${streak.currentStreak} day streak! Your dedication is unmatched!`;
    } else if (streak.currentStreak >= 3) {
      return `${streak.currentStreak} day streak! The fire within you grows stronger!`;
    } else if (!streak.todayCompleted && streak.currentStreak > 0) {
      return "Complete a quest today to keep your streak alive!";
    } else if (tasksCompleted === 0) {
      return "Hunter, welcome! Your first quest awaits.";
    } else if (level >= 50) {
      return "Impressive, Hunter. You're among the elite now.";
    } else {
      return "Every completed task makes you stronger, Hunter.";
    }
  };

  const getRank = () => {
    if (level >= 90) return { rank: "S-RANK", class: "text-gold text-glow-gold" };
    if (level >= 70) return { rank: "A-RANK", class: "text-primary text-glow-primary" };
    if (level >= 50) return { rank: "B-RANK", class: "text-secondary text-glow-secondary" };
    if (level >= 30) return { rank: "C-RANK", class: "text-accent text-glow-accent" };
    if (level >= 15) return { rank: "D-RANK", class: "text-muted-foreground" };
    return { rank: "E-RANK", class: "text-muted-foreground" };
  };

  const rankInfo = getRank();

  return (
    <Card className="p-6 bg-card border-primary/40 animate-slide-up [animation-delay:200ms] card-anime">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-7 h-7 text-primary" />
        <h2 className="font-game text-xl font-bold text-primary">HUNTER STATUS</h2>
      </div>

      {/* Bot Assistant */}
      <div className="mb-4 p-4 rounded-lg bg-gradient-primary border border-primary/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-game text-sm text-primary mb-1">SYSTEM</p>
            <p className="font-ui text-sm text-muted-foreground">{getBotMessage()}</p>
          </div>
        </div>
      </div>

      {/* Streak Display */}
      <div className="mb-4 p-4 rounded-lg bg-gradient-fire border border-destructive/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Flame className={`w-6 h-6 text-destructive ${streak.currentStreak >= 3 ? 'animate-pulse' : ''}`} />
            <span className="font-game text-destructive">STREAK</span>
          </div>
          <span className="font-game text-3xl text-destructive">{streak.currentStreak}</span>
        </div>
        <p className="text-xs text-muted-foreground">Best: {streak.longestStreak} days</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-gradient-primary border border-primary/30 text-center">
          <Shield className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="font-game text-xl text-foreground">{level}</p>
          <p className="text-xs text-muted-foreground">Level</p>
        </div>
        <div className="p-3 rounded-lg bg-gradient-primary border border-primary/30 text-center">
          <Crown className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className={`font-game text-lg ${rankInfo.class}`}>{rankInfo.rank}</p>
          <p className="text-xs text-muted-foreground">Rank</p>
        </div>
        <div className="p-3 rounded-lg bg-gradient-primary border border-primary/30 text-center">
          <Swords className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="font-game text-xl text-foreground">{tasksCompleted}</p>
          <p className="text-xs text-muted-foreground">Quests</p>
        </div>
        <div className="p-3 rounded-lg bg-gradient-primary border border-primary/30 text-center">
          <Award className="w-5 h-5 text-gold mx-auto mb-1" />
          <p className="font-game text-xl text-gold">{progress.unlocked}</p>
          <p className="text-xs text-muted-foreground">Badges</p>
        </div>
      </div>

      {/* Achievements Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-game text-muted-foreground flex items-center gap-1">
            <Star className="w-4 h-4" /> ACHIEVEMENTS
          </span>
          <span className="text-primary">{progress.unlocked}/{progress.total}</span>
        </div>
        <Progress value={progress.percentage} className="h-2" />
        <div className="flex flex-wrap gap-1 mt-2">
          {ACHIEVEMENTS.slice(0, 8).map((a) => (
            <span 
              key={a.key} 
              className={`text-lg ${unlockedKeys.has(a.key) ? '' : 'grayscale opacity-40'}`}
              title={unlockedKeys.has(a.key) ? `${a.title} - ${a.description}` : `🔒 ${a.title}`}
            >
              {a.icon}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
};