import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useLifeSkills } from "@/hooks/useLifeSkills";
import { LIFE_SKILL_CATEGORIES } from "@/lib/lifeSkills";
import { SkillCategoryCard } from "@/components/skills/SkillCategoryCard";
import { CharacterStory } from "@/components/skills/CharacterStory";
import { ChillPageLayout, fadeUp, scaleUp } from "@/components/ChillPageLayout";
import { Progress } from "@/components/ui/progress";
import { Brain, Trophy, Flame, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SkillsAcademy = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { skills, getSkillLevel, logPractice, getTotalProgress } = useLifeSkills();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (!loading && !user) return null;

  const { practiced, total } = getTotalProgress();
  const overallProgress = (practiced / total) * 100;
  const practiceLog: Record<string, any[]> = {};
  skills.forEach(s => { practiceLog[s.skill_key] = (s.practice_log as any[]) || []; });
  const totalPractices = skills.reduce((sum, s) => sum + ((s.practice_log as any[])?.length || 0), 0);

  return (
    <ChillPageLayout
      title="Skills Academy"
      subtitle="Master real-life skills. Become unstoppable."
      icon={<Brain className="w-7 h-7 text-primary" />}
      accentColor="primary"
      maxWidth="max-w-4xl"
      stats={[
        { icon: <Trophy className="w-5 h-5" />, value: practiced, label: "Skills Touched", color: "primary" },
        { icon: <Flame className="w-5 h-5" />, value: totalPractices, label: "Practices Done", color: "gold" },
        { icon: <BookOpen className="w-5 h-5" />, value: LIFE_SKILL_CATEGORIES.length, label: "Categories", color: "secondary" },
      ]}
    >
      {/* Overall Progress */}
      <motion.div variants={fadeUp} className="mb-8 p-4 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-game text-primary text-xs tracking-wider">OVERALL MASTERY</span>
          <span className="font-ui text-xs text-muted-foreground">{practiced}/{total} skills</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="skills" className="space-y-6">
          <TabsList className="bg-muted/40 rounded-full p-1 backdrop-blur-sm">
            <TabsTrigger value="skills" className="rounded-full font-game text-xs data-[state=active]:bg-background">
              <Brain className="w-3.5 h-3.5 mr-1.5" /> Skill Tree
            </TabsTrigger>
            <TabsTrigger value="story" className="rounded-full font-game text-xs data-[state=active]:bg-background">
              <BookOpen className="w-3.5 h-3.5 mr-1.5" /> My Story
            </TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="space-y-4">
            {LIFE_SKILL_CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <SkillCategoryCard
                  category={cat}
                  getSkillLevel={getSkillLevel}
                  logPractice={logPractice}
                  practiceLog={practiceLog}
                />
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="story">
            <CharacterStory />
          </TabsContent>
        </Tabs>
      </motion.div>
    </ChillPageLayout>
  );
};

export default SkillsAcademy;
