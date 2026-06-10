import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { VitalityDashboard } from "@/components/vitals/VitalityDashboard";
import { BodyMetricsTracker } from "@/components/vitals/BodyMetricsTracker";
import { NutritionTracker } from "@/components/vitals/NutritionTracker";
import { ProteinFoodGuide } from "@/components/vitals/ProteinFoodGuide";
import { HealthTracker } from "@/components/student/HealthTracker";
import { ChillPageLayout, fadeUp, scaleUp } from "@/components/ChillPageLayout";
import { Heart } from "lucide-react";

const Vitals = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (!loading && !user) return null;

  return (
    <ChillPageLayout
      title="Vitals & Health"
      subtitle="Body metrics, nutrition & wellness tracking"
      icon={<Heart className="w-7 h-7 text-destructive" />}
      accentColor="destructive"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={scaleUp}><VitalityDashboard /></motion.div>
        <motion.div variants={scaleUp}><BodyMetricsTracker /></motion.div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <motion.div variants={fadeUp}><NutritionTracker /></motion.div>
        <motion.div variants={fadeUp} className="space-y-6">
          <ProteinFoodGuide />
          <HealthTracker />
        </motion.div>
      </div>
    </ChillPageLayout>
  );
};

export default Vitals;
