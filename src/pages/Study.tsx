import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { DeepFocusSession } from "@/components/student/DeepFocusSession";
import { StudySchedule } from "@/components/student/StudySchedule";
import { HabitTracker } from "@/components/student/HabitTracker";
import { PomodoroTimer } from "@/components/student/PomodoroTimer";
import { ChillPageLayout, fadeUp, scaleUp } from "@/components/ChillPageLayout";
import { GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Study = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (!loading && !user) return null;

  return (
    <ChillPageLayout
      title="Study Zone"
      subtitle="Deep focus sessions, schedules & habit building"
      icon={<GraduationCap className="w-7 h-7 text-secondary" />}
      accentColor="secondary"
    >
      <motion.div variants={fadeUp} className="mb-6">
        <DeepFocusSession onSessionComplete={(type) => {
          if (type === 'work') toast({ title: "🧠 Focus Block Complete!", description: "Great focus session!" });
        }} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={scaleUp}>
          <PomodoroTimer onSessionComplete={(type) => {
            if (type === 'work') toast({ title: "⚡ Quick Focus Done!", description: "25min session complete!" });
          }} />
        </motion.div>
        <motion.div variants={scaleUp}>
          <StudySchedule />
        </motion.div>
      </div>

      <motion.div variants={fadeUp} className="mt-6">
        <HabitTracker onHabitComplete={() => toast({ title: "✓ Habit Done!", description: "Keep it up!" })} />
      </motion.div>
    </ChillPageLayout>
  );
};

export default Study;
