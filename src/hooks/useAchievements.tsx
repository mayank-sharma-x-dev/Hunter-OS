import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { soundManager } from "@/lib/sounds";

export interface Achievement {
  key: string;
  title: string;
  description: string;
  icon: string;
  requirement: (stats: AchievementCheckData) => boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementCheckData {
  level: number;
  totalExp: number;
  tasksCompleted: number;
  currentStreak: number;
  longestStreak: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Level achievements
  { key: 'first_level', title: 'First Steps', description: 'Reach Level 2', icon: '🌱', requirement: (d) => d.level >= 2, rarity: 'common' },
  { key: 'level_10', title: 'Rising Hunter', description: 'Reach Level 10', icon: '⚔️', requirement: (d) => d.level >= 10, rarity: 'common' },
  { key: 'level_25', title: 'Elite Status', description: 'Reach Level 25', icon: '🛡️', requirement: (d) => d.level >= 25, rarity: 'rare' },
  { key: 'level_50', title: 'Guild Master', description: 'Reach Level 50', icon: '👑', requirement: (d) => d.level >= 50, rarity: 'epic' },
  { key: 'level_100', title: 'Shadow Monarch', description: 'Reach Level 100', icon: '⭐', requirement: (d) => d.level >= 100, rarity: 'legendary' },
  
  // Task achievements
  { key: 'first_quest', title: 'Quest Accepted', description: 'Complete your first quest', icon: '✅', requirement: (d) => d.tasksCompleted >= 1, rarity: 'common' },
  { key: 'quest_10', title: 'Quest Seeker', description: 'Complete 10 quests', icon: '📋', requirement: (d) => d.tasksCompleted >= 10, rarity: 'common' },
  { key: 'quest_50', title: 'Quest Master', description: 'Complete 50 quests', icon: '📜', requirement: (d) => d.tasksCompleted >= 50, rarity: 'rare' },
  { key: 'quest_100', title: 'Legendary Quester', description: 'Complete 100 quests', icon: '🏆', requirement: (d) => d.tasksCompleted >= 100, rarity: 'epic' },
  { key: 'quest_500', title: 'Quest God', description: 'Complete 500 quests', icon: '💎', requirement: (d) => d.tasksCompleted >= 500, rarity: 'legendary' },
  
  // Streak achievements
  { key: 'streak_3', title: 'Getting Started', description: '3 day streak', icon: '🔥', requirement: (d) => d.currentStreak >= 3 || d.longestStreak >= 3, rarity: 'common' },
  { key: 'streak_7', title: 'Week Warrior', description: '7 day streak', icon: '🔥', requirement: (d) => d.currentStreak >= 7 || d.longestStreak >= 7, rarity: 'rare' },
  { key: 'streak_30', title: 'Monthly Master', description: '30 day streak', icon: '🔥', requirement: (d) => d.currentStreak >= 30 || d.longestStreak >= 30, rarity: 'epic' },
  { key: 'streak_100', title: 'Eternal Flame', description: '100 day streak', icon: '🌟', requirement: (d) => d.currentStreak >= 100 || d.longestStreak >= 100, rarity: 'legendary' },
  
  // EXP achievements
  { key: 'exp_100', title: 'EXP Collector', description: 'Earn 100 total EXP', icon: '✨', requirement: (d) => d.totalExp >= 100, rarity: 'common' },
  { key: 'exp_500', title: 'EXP Hunter', description: 'Earn 500 total EXP', icon: '💫', requirement: (d) => d.totalExp >= 500, rarity: 'rare' },
  { key: 'exp_1000', title: 'EXP Master', description: 'Earn 1000 total EXP', icon: '🌟', requirement: (d) => d.totalExp >= 1000, rarity: 'epic' },
];

const RARITY_COLORS = {
  common: 'text-muted-foreground',
  rare: 'text-secondary',
  epic: 'text-primary',
  legendary: 'text-gold',
};

export const useAchievements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unlockedKeys, setUnlockedKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  const fetchAchievements = async () => {
    if (!user) return;

    const { data, error } = await supabase.rpc('get_user_achievements', { p_user_id: user.id });
    
    if (!error && data) {
      setUnlockedKeys(new Set(data.map((a: { achievement_key: string }) => a.achievement_key)));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAchievements();
  }, [user]);

  const checkAndUnlockAchievements = useCallback(async (stats: AchievementCheckData) => {
    if (!user) return;

    const newUnlocks: Achievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedKeys.has(achievement.key)) continue;
      
      if (achievement.requirement(stats)) {
        const { error } = await supabase.rpc('unlock_achievement', {
          p_user_id: user.id,
          p_achievement_key: achievement.key
        });

        if (!error) {
          newUnlocks.push(achievement);
          setUnlockedKeys(prev => new Set([...prev, achievement.key]));
        }
      }
    }

    if (newUnlocks.length > 0) {
      setNewlyUnlocked(newUnlocks);
      soundManager.playLevelUp();
      
      // Show toast for each achievement
      newUnlocks.forEach((achievement, index) => {
        setTimeout(() => {
          toast({
            title: `🏆 Achievement Unlocked!`,
            description: `${achievement.icon} ${achievement.title} - ${achievement.description}`,
          });
        }, index * 1000);
      });
    }
  }, [user, unlockedKeys, toast]);

  const clearNewlyUnlocked = () => setNewlyUnlocked([]);

  const getUnlockedAchievements = () => 
    ACHIEVEMENTS.filter(a => unlockedKeys.has(a.key));

  const getLockedAchievements = () => 
    ACHIEVEMENTS.filter(a => !unlockedKeys.has(a.key));

  const getProgress = () => ({
    unlocked: unlockedKeys.size,
    total: ACHIEVEMENTS.length,
    percentage: Math.round((unlockedKeys.size / ACHIEVEMENTS.length) * 100)
  });

  return {
    achievements: ACHIEVEMENTS,
    unlockedKeys,
    loading,
    newlyUnlocked,
    clearNewlyUnlocked,
    checkAndUnlockAchievements,
    getUnlockedAchievements,
    getLockedAchievements,
    getProgress,
    rarityColors: RARITY_COLORS,
    refetch: fetchAchievements,
  };
};