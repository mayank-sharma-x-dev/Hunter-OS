import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { QuestPanel } from "@/components/dashboard/QuestPanel";
import { useTasks } from "@/hooks/useTasks";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { ChillPageLayout, fadeUp } from "@/components/ChillPageLayout";
import { Swords, Shield, Flame } from "lucide-react";

const Quests = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { completedTasks, tasks } = useTasks();
  const { currentLevel, rankInfo } = usePlayerStats();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (!loading && !user) return null;

  const activeTasks = tasks?.filter(t => !t.is_completed)?.length || 0;

  return (
    <ChillPageLayout
      title="Quest Board"
      subtitle="Accept missions • Earn rewards • Get stronger"
      icon={<Swords className="w-7 h-7 text-primary" />}
      accentColor="primary"
      stats={[
        { icon: <Shield className="w-5 h-5" />, value: activeTasks, label: "Active Quests", color: "primary" },
        { icon: <Swords className="w-5 h-5" />, value: completedTasks.length, label: "Completed", color: "accent" },
        { icon: <Flame className="w-5 h-5" />, value: `Lv.${currentLevel}`, label: rankInfo.rank, color: "destructive" },
      ]}
    >
      <motion.div variants={fadeUp} className="max-w-2xl mx-auto">
        <QuestPanel />
      </motion.div>
    </ChillPageLayout>
  );
};

export default Quests;
