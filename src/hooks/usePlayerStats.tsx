import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface PlayerStats {
  id: string;
  user_id: string;
  level: number;
  current_exp: number;
  total_exp: number;
  current_streak: number;
  longest_streak: number;
  last_task_date: string | null;
  available_talent_points: number;
  total_talent_points: number;
}

export const usePlayerStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  const expToNextLevel = 20;
  const maxLevel = 300;

  const getRank = (level: number) => {
    if (level >= 251) return { rank: "S", label: "S-RANK", class: "rank-s", color: "gold" };
    if (level >= 201) return { rank: "A", label: "A-RANK", class: "rank-a", color: "primary" };
    if (level >= 151) return { rank: "B", label: "B-RANK", class: "rank-b", color: "secondary" };
    if (level >= 101) return { rank: "C", label: "C-RANK", class: "rank-c", color: "accent" };
    if (level >= 51) return { rank: "D", label: "D-RANK", class: "rank-d", color: "muted-foreground" };
    return { rank: "E", label: "E-RANK", class: "rank-e", color: "muted-foreground" };
  };

  const fetchStats = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("player_stats")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching player stats:", error);
      // If no stats exist, create them
      if (error.code === "PGRST116" || !data) {
        const { data: newStats } = await supabase
          .from("player_stats")
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (newStats) {
          setStats(newStats);
        }
      }
    } else if (data) {
      setStats(data);
    } else {
      // No stats found, create them
      const { data: newStats } = await supabase
        .from("player_stats")
        .insert({ user_id: user.id })
        .select()
        .single();
      
      if (newStats) {
        setStats(newStats);
      }
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("player_stats_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "player_stats",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            setStats(payload.new as PlayerStats);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const currentExp = stats?.current_exp ?? 0;
  const currentLevel = stats?.level ?? 1;
  const expProgress = (currentExp / expToNextLevel) * 100;
  const rankInfo = getRank(currentLevel);

  return {
    stats,
    loading,
    currentLevel,
    currentExp,
    expProgress,
    expToNextLevel,
    maxLevel,
    rankInfo,
    refetch: fetchStats,
  };
};
