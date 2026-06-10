import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface LifeSkillRecord {
  id: string;
  skill_category: string;
  skill_key: string;
  current_level: number;
  max_level: number;
  practice_log: any[];
  notes: string | null;
}

export const useLifeSkills = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [skills, setSkills] = useState<LifeSkillRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSkills = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("life_skills")
      .select("*")
      .eq("user_id", user.id);
    if (error) console.error(error);
    else setSkills((data as any[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  const getSkillLevel = (skillKey: string): number => {
    return skills.find(s => s.skill_key === skillKey)?.current_level || 0;
  };

  const logPractice = async (skillKey: string, category: string, practiceText: string) => {
    if (!user) return;
    const existing = skills.find(s => s.skill_key === skillKey);
    const newLog = { text: practiceText, date: new Date().toISOString() };

    if (existing) {
      const logs = [...(existing.practice_log || []), newLog];
      const newLevel = Math.min(existing.max_level, Math.floor(logs.length / 3));
      await supabase
        .from("life_skills")
        .update({ practice_log: logs as any, current_level: newLevel, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("life_skills")
        .insert({ user_id: user.id, skill_category: category, skill_key: skillKey, practice_log: [newLog] as any, current_level: 0 });
    }

    toast({ title: "✅ Practice Logged!", description: practiceText });
    await fetchSkills();
  };

  const getTotalProgress = (): { practiced: number; total: number } => {
    const practiced = skills.filter(s => (s.practice_log as any[])?.length > 0).length;
    return { practiced, total: 40 };
  };

  return { skills, loading, getSkillLevel, logPractice, getTotalProgress, refetch: fetchSkills };
};
