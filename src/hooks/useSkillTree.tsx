import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface SkillDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  requiredLevel: number;
  branch: "combat" | "wisdom" | "spirit" | "shadow";
  prerequisites: string[];
  effects: string[];
}

export interface UnlockedSkill {
  skill_key: string;
  skill_level: number;
  unlocked_at: string;
}

// Define all available skills in the skill tree
export const SKILL_DEFINITIONS: SkillDefinition[] = [
  // Combat Branch - Focus on task completion and productivity
  {
    key: "warrior_focus",
    name: "Warrior's Focus",
    description: "Enhanced concentration during tasks",
    icon: "⚔️",
    maxLevel: 5,
    requiredLevel: 5,
    branch: "combat",
    prerequisites: [],
    effects: ["+2% EXP per task", "+4% EXP per task", "+6% EXP per task", "+8% EXP per task", "+10% EXP per task"],
  },
  {
    key: "blade_master",
    name: "Blade Master",
    description: "Swift task execution abilities",
    icon: "🗡️",
    maxLevel: 3,
    requiredLevel: 15,
    branch: "combat",
    prerequisites: ["warrior_focus"],
    effects: ["Daily bonus: +1 EXP", "Daily bonus: +2 EXP", "Daily bonus: +3 EXP"],
  },
  {
    key: "berserker_rage",
    name: "Berserker Rage",
    description: "Unleash your inner power",
    icon: "💢",
    maxLevel: 3,
    requiredLevel: 30,
    branch: "combat",
    prerequisites: ["blade_master"],
    effects: ["Streak bonus: +5%", "Streak bonus: +10%", "Streak bonus: +15%"],
  },
  {
    key: "ultimate_warrior",
    name: "Ultimate Warrior",
    description: "Master of all combat skills",
    icon: "👑",
    maxLevel: 1,
    requiredLevel: 50,
    branch: "combat",
    prerequisites: ["berserker_rage"],
    effects: ["Unlock exclusive Combat title"],
  },

  // Wisdom Branch - Focus on learning and knowledge
  {
    key: "keen_mind",
    name: "Keen Mind",
    description: "Enhanced memory and learning",
    icon: "🧠",
    maxLevel: 5,
    requiredLevel: 5,
    branch: "wisdom",
    prerequisites: [],
    effects: ["Study timer: +1 min", "Study timer: +2 min", "Study timer: +3 min", "Study timer: +4 min", "Study timer: +5 min"],
  },
  {
    key: "scholar",
    name: "Scholar's Insight",
    description: "Deep understanding of subjects",
    icon: "📚",
    maxLevel: 3,
    requiredLevel: 15,
    branch: "wisdom",
    prerequisites: ["keen_mind"],
    effects: ["Journal bonus: +1 EXP", "Journal bonus: +2 EXP", "Journal bonus: +3 EXP"],
  },
  {
    key: "sage_wisdom",
    name: "Sage's Wisdom",
    description: "Ancient knowledge unlocked",
    icon: "🔮",
    maxLevel: 3,
    requiredLevel: 30,
    branch: "wisdom",
    prerequisites: ["scholar"],
    effects: ["Habit completion: +5%", "Habit completion: +10%", "Habit completion: +15%"],
  },
  {
    key: "grandmaster_sage",
    name: "Grandmaster Sage",
    description: "Master of all wisdom",
    icon: "✨",
    maxLevel: 1,
    requiredLevel: 50,
    branch: "wisdom",
    prerequisites: ["sage_wisdom"],
    effects: ["Unlock exclusive Wisdom title"],
  },

  // Spirit Branch - Focus on habits and consistency
  {
    key: "inner_peace",
    name: "Inner Peace",
    description: "Calm mind for better habits",
    icon: "🧘",
    maxLevel: 5,
    requiredLevel: 5,
    branch: "spirit",
    prerequisites: [],
    effects: ["Break timer: +30s", "Break timer: +1m", "Break timer: +1m30s", "Break timer: +2m", "Break timer: +2m30s"],
  },
  {
    key: "spirit_walker",
    name: "Spirit Walker",
    description: "Walk between realms",
    icon: "👻",
    maxLevel: 3,
    requiredLevel: 15,
    branch: "spirit",
    prerequisites: ["inner_peace"],
    effects: ["Streak protection: 1 day", "Streak protection: 2 days", "Streak protection: 3 days"],
  },
  {
    key: "ethereal_form",
    name: "Ethereal Form",
    description: "Transcend physical limits",
    icon: "🌟",
    maxLevel: 3,
    requiredLevel: 30,
    branch: "spirit",
    prerequisites: ["spirit_walker"],
    effects: ["Health goal: +5%", "Health goal: +10%", "Health goal: +15%"],
  },
  {
    key: "ascended_being",
    name: "Ascended Being",
    description: "Master of spiritual arts",
    icon: "🌈",
    maxLevel: 1,
    requiredLevel: 50,
    branch: "spirit",
    prerequisites: ["ethereal_form"],
    effects: ["Unlock exclusive Spirit title"],
  },

  // Shadow Branch - Focus on advanced abilities
  {
    key: "shadow_step",
    name: "Shadow Step",
    description: "Move unseen through challenges",
    icon: "🌑",
    maxLevel: 5,
    requiredLevel: 10,
    branch: "shadow",
    prerequisites: [],
    effects: ["Special task: +1 EXP", "Special task: +2 EXP", "Special task: +3 EXP", "Special task: +4 EXP", "Special task: +5 EXP"],
  },
  {
    key: "dark_vision",
    name: "Dark Vision",
    description: "See through any obstacle",
    icon: "👁️",
    maxLevel: 3,
    requiredLevel: 25,
    branch: "shadow",
    prerequisites: ["shadow_step"],
    effects: ["Night mode bonus: +2%", "Night mode bonus: +4%", "Night mode bonus: +6%"],
  },
  {
    key: "void_walker",
    name: "Void Walker",
    description: "Master the void between",
    icon: "🕳️",
    maxLevel: 3,
    requiredLevel: 40,
    branch: "shadow",
    prerequisites: ["dark_vision"],
    effects: ["Deadline extension: 1h", "Deadline extension: 2h", "Deadline extension: 3h"],
  },
  {
    key: "shadow_monarch",
    name: "Shadow Monarch",
    description: "Ultimate shadow mastery",
    icon: "👤",
    maxLevel: 1,
    requiredLevel: 75,
    branch: "shadow",
    prerequisites: ["void_walker"],
    effects: ["Unlock Shadow Monarch title"],
  },
];

export const BRANCH_INFO = {
  combat: { name: "Combat", color: "destructive", icon: "⚔️", description: "Task mastery & productivity" },
  wisdom: { name: "Wisdom", color: "primary", icon: "📚", description: "Learning & knowledge" },
  spirit: { name: "Spirit", color: "accent", icon: "✨", description: "Habits & consistency" },
  shadow: { name: "Shadow", color: "secondary", icon: "🌑", description: "Advanced abilities" },
};

export const useSkillTree = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unlockedSkills, setUnlockedSkills] = useState<UnlockedSkill[]>([]);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchSkills = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch unlocked skills
      const { data: skills, error: skillsError } = await supabase
        .from("skill_trees")
        .select("skill_key, skill_level, unlocked_at")
        .eq("user_id", user.id);

      if (skillsError) throw skillsError;
      setUnlockedSkills(skills || []);

      // Fetch talent points from player_stats
      const { data: stats, error: statsError } = await supabase
        .from("player_stats")
        .select("available_talent_points, total_talent_points")
        .eq("user_id", user.id)
        .single();

      if (statsError) throw statsError;
      setAvailablePoints(stats?.available_talent_points || 0);
      setTotalPoints(stats?.total_talent_points || 0);
    } catch (error) {
      console.error("Error fetching skill tree:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const skillChannel = supabase
      .channel("skill_trees_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "skill_trees",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchSkills();
        }
      )
      .subscribe();

    const statsChannel = supabase
      .channel("player_stats_talent_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "player_stats",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            const newStats = payload.new as { available_talent_points: number; total_talent_points: number };
            setAvailablePoints(newStats.available_talent_points || 0);
            setTotalPoints(newStats.total_talent_points || 0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(skillChannel);
      supabase.removeChannel(statsChannel);
    };
  }, [user, fetchSkills]);

  const getSkillLevel = (skillKey: string): number => {
    const skill = unlockedSkills.find((s) => s.skill_key === skillKey);
    return skill?.skill_level || 0;
  };

  const canUnlockSkill = (skill: SkillDefinition, playerLevel: number): boolean => {
    // Check level requirement
    if (playerLevel < skill.requiredLevel) return false;

    // Check if already at max level
    const currentLevel = getSkillLevel(skill.key);
    if (currentLevel >= skill.maxLevel) return false;

    // Check prerequisites
    for (const prereq of skill.prerequisites) {
      const prereqSkill = SKILL_DEFINITIONS.find((s) => s.key === prereq);
      if (!prereqSkill) continue;
      
      const prereqLevel = getSkillLevel(prereq);
      // Prerequisite must be at least level 1
      if (prereqLevel < 1) return false;
    }

    // Check available points
    if (availablePoints < 1) return false;

    return true;
  };

  const unlockOrUpgradeSkill = async (skillKey: string, playerLevel: number): Promise<boolean> => {
    if (!user) return false;

    const skill = SKILL_DEFINITIONS.find((s) => s.key === skillKey);
    if (!skill || !canUnlockSkill(skill, playerLevel)) return false;

    const currentLevel = getSkillLevel(skillKey);
    const newLevel = currentLevel + 1;

    try {
      if (currentLevel === 0) {
        // Insert new skill
        const { error } = await supabase
          .from("skill_trees")
          .insert({ user_id: user.id, skill_key: skillKey, skill_level: 1 });

        if (error) throw error;
      } else {
        // Update existing skill
        const { error } = await supabase
          .from("skill_trees")
          .update({ skill_level: newLevel })
          .eq("user_id", user.id)
          .eq("skill_key", skillKey);

        if (error) throw error;
      }

      // Deduct talent point
      const { error: pointsError } = await supabase
        .from("player_stats")
        .update({ available_talent_points: availablePoints - 1 })
        .eq("user_id", user.id);

      if (pointsError) throw pointsError;

      toast({
        title: `${skill.icon} ${skill.name} ${currentLevel === 0 ? "Unlocked!" : `Level ${newLevel}!`}`,
        description: skill.effects[newLevel - 1],
      });

      await fetchSkills();
      return true;
    } catch (error) {
      console.error("Error unlocking skill:", error);
      toast({
        title: "Error",
        description: "Failed to unlock skill",
        variant: "destructive",
      });
      return false;
    }
  };

  const resetSkillTree = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      // Delete all skills
      const { error: deleteError } = await supabase
        .from("skill_trees")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      // Restore all talent points
      const { error: pointsError } = await supabase
        .from("player_stats")
        .update({ available_talent_points: totalPoints })
        .eq("user_id", user.id);

      if (pointsError) throw pointsError;

      toast({
        title: "🔄 Skill Tree Reset",
        description: `${totalPoints} talent points restored!`,
      });

      await fetchSkills();
      return true;
    } catch (error) {
      console.error("Error resetting skill tree:", error);
      toast({
        title: "Error",
        description: "Failed to reset skill tree",
        variant: "destructive",
      });
      return false;
    }
  };

  const getSpentPoints = (): number => {
    return unlockedSkills.reduce((sum, s) => sum + s.skill_level, 0);
  };

  const getBranchProgress = (branch: SkillDefinition["branch"]): { current: number; max: number } => {
    const branchSkills = SKILL_DEFINITIONS.filter((s) => s.branch === branch);
    const maxPoints = branchSkills.reduce((sum, s) => sum + s.maxLevel, 0);
    const currentPoints = branchSkills.reduce((sum, s) => sum + getSkillLevel(s.key), 0);
    return { current: currentPoints, max: maxPoints };
  };

  return {
    unlockedSkills,
    availablePoints,
    totalPoints,
    loading,
    getSkillLevel,
    canUnlockSkill,
    unlockOrUpgradeSkill,
    resetSkillTree,
    getSpentPoints,
    getBranchProgress,
    refetch: fetchSkills,
  };
};
