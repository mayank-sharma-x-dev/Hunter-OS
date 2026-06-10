import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { SkillTreePanel } from "@/components/dashboard/SkillTreePanel";
import { AchievementsColumn } from "@/components/dashboard/AchievementsColumn";
import { GoalsColumn } from "@/components/dashboard/GoalsColumn";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { useTasks } from "@/hooks/useTasks";
import { ChillPageLayout, fadeUp, scaleUp } from "@/components/ChillPageLayout";
import { Target, TrendingUp, Trophy } from "lucide-react";
import type { Goal, StreakData } from "@/pages/Dashboard";

const Growth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { currentLevel, currentExp } = usePlayerStats();
  const { completedTasks } = useTasks();

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("soloLevelingData");
    return saved ? JSON.parse(saved).goals || [] : [];
  });

  const streak: StreakData = (() => {
    const saved = localStorage.getItem("soloLevelingData");
    return saved ? JSON.parse(saved).streak || { currentStreak: 0, longestStreak: 0, lastCompletionDate: null, todayCompleted: false } : { currentStreak: 0, longestStreak: 0, lastCompletionDate: null, todayCompleted: false };
  })();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    const saved = localStorage.getItem("soloLevelingData");
    const data = saved ? JSON.parse(saved) : {};
    data.goals = goals;
    localStorage.setItem("soloLevelingData", JSON.stringify(data));
  }, [goals]);

  if (!loading && !user) return null;

  const masteredGoals = goals.filter(g => g.progress >= 100).length;

  return (
    <ChillPageLayout
      title="Growth Hub"
      subtitle="Skills, goals, achievements & personal mastery"
      icon={<Target className="w-7 h-7 text-accent" />}
      accentColor="accent"
      stats={[
        { icon: <TrendingUp className="w-5 h-5" />, value: goals.length, label: "Active Goals", color: "accent" },
        { icon: <Trophy className="w-5 h-5" />, value: masteredGoals, label: "Mastered", color: "gold" },
        { icon: <Target className="w-5 h-5" />, value: `Lv.${currentLevel}`, label: "Level", color: "primary" },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={scaleUp}><SkillTreePanel /></motion.div>
        <motion.div variants={scaleUp}><GoalsColumn goals={goals} setGoals={setGoals} /></motion.div>
      </div>
      <motion.div variants={fadeUp} className="mt-6">
        <AchievementsColumn
          achievements={[]}
          level={currentLevel}
          exp={currentExp}
          tasksCompleted={completedTasks.length}
          streak={streak}
        />
      </motion.div>
    </ChillPageLayout>
  );
};

export default Growth;
