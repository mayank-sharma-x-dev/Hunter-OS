import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { useTasks } from "@/hooks/useTasks";
import { useScreenEffects } from "@/hooks/useScreenEffects";
import { useAchievements } from "@/hooks/useAchievements";
import { LevelUpModal } from "@/components/dashboard/LevelUpModal";
import { RoleUpgradeModal } from "@/components/dashboard/RoleUpgradeModal";
import { AchievementUnlockModal } from "@/components/dashboard/AchievementUnlockModal";
import { soundManager } from "@/lib/sounds";
import { supabase } from "@/integrations/supabase/client";
import NatureAmbience from "@/components/nature/NatureAmbience";
import SakuraPetals from "@/components/nature/SakuraPetals";
import ArcticSilhouettes from "@/components/nature/ArcticSilhouettes";
import AuroraBorealis from "@/components/nature/AuroraBorealis";

import AmbientSoundPlayer from "@/components/nature/AmbientSoundPlayer";
import DarkModeToggle from "@/components/DarkModeToggle";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { getDailyQuote } from "@/lib/quotes";
import { startOfDay, differenceInDays } from "date-fns";
import {
  Swords, GraduationCap, Target, Heart, Shield, Flame, Wallet, Brain,
  Quote, BarChart3, BookOpen, LogOut, Calendar, Settings, ChevronRight, Sparkles
} from "lucide-react";

export interface Task { id: string; text: string; completed: boolean; date: Date; }
export interface Goal { id: string; title: string; description: string; progress: number; category: "short" | "long"; color: string; }
export interface Achievement { id: string; title: string; completedAt: Date; exp: number; }
export interface StreakData { currentStreak: number; longestStreak: number; lastCompletionDate: string | null; todayCompleted: boolean; }

// --- Animation Variants ---
const stagger = {
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

const fadeSlideUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const slideFromLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const sectionCards = [
  { id: "quests", title: "Quest Board", desc: "Daily missions & objectives", icon: Swords, color: "primary", route: "/quests", gradient: "from-primary/15 to-primary/5", borderColor: "border-primary/25" },
  { id: "study", title: "Study Zone", desc: "Deep focus & schedules", icon: GraduationCap, color: "secondary", route: "/study", gradient: "from-secondary/15 to-secondary/5", borderColor: "border-secondary/25" },
  { id: "growth", title: "Growth Hub", desc: "Skills, goals & achievements", icon: Target, color: "accent", route: "/growth", gradient: "from-accent/15 to-accent/5", borderColor: "border-accent/25" },
  { id: "vitals", title: "Vitals & Health", desc: "Body metrics & nutrition", icon: Heart, color: "destructive", route: "/vitals", gradient: "from-destructive/15 to-destructive/5", borderColor: "border-destructive/25" },
  { id: "treasury", title: "Treasury", desc: "Budget & finance tracking", icon: Wallet, color: "gold", route: "/treasury", gradient: "from-gold/15 to-gold/5", borderColor: "border-gold/25" },
  { id: "skills-academy", title: "Skills Academy", desc: "Master real-life skills with AI", icon: Brain, color: "primary", route: "/skills-academy", gradient: "from-primary/10 via-secondary/10 to-accent/10", borderColor: "border-primary/25" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { currentLevel, currentExp, rankInfo, stats } = usePlayerStats();
  const { completedTasks: dbCompletedTasks } = useTasks();
  const { triggerLevelUp } = useScreenEffects();
  const { checkAndUnlockAchievements, newlyUnlocked, clearNewlyUnlocked } = useAchievements();
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("hunter");
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showRoleUpgrade, setShowRoleUpgrade] = useState(false);
  const [newRole, setNewRole] = useState<'elite_hunter' | 'guild_master' | 'shadow_monarch' | null>(null);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [quote] = useState(getDailyQuote());
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastCompletionDate: null, todayCompleted: false });
  const prevLevelRef = useRef<number | null>(null);
  const prevRoleRef = useRef<string | null>(null);

  const playerLevel = currentLevel;
  const playerExp = currentExp;
  const expToNextLevel = 20;

  // --- Data Loading (unchanged logic) ---
  useEffect(() => {
    const savedData = localStorage.getItem("soloLevelingData");
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.streak) {
        const loadedStreak = data.streak as StreakData;
        const today = startOfDay(new Date());
        const lastCompletion = loadedStreak.lastCompletionDate ? startOfDay(new Date(loadedStreak.lastCompletionDate)) : null;
        if (lastCompletion) {
          const daysDiff = differenceInDays(today, lastCompletion);
          if (daysDiff === 0) setStreak(loadedStreak);
          else if (daysDiff === 1) setStreak({ ...loadedStreak, todayCompleted: false });
          else setStreak({ currentStreak: 0, longestStreak: loadedStreak.longestStreak, lastCompletionDate: null, todayCompleted: false });
        }
      }
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    const loadProfile = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) setProfile(data);
    };
    const loadRole = async () => {
      const { data } = await supabase.rpc('get_user_role', { _user_id: user.id });
      if (data) { setUserRole(data); prevRoleRef.current = data; }
    };
    loadProfile();
    loadRole();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (prevLevelRef.current !== null && currentLevel > prevLevelRef.current) {
      soundManager.playLevelUp();
      triggerLevelUp();
      setPreviousLevel(prevLevelRef.current);
      setShowLevelUp(true);
      const checkRoleUpgrade = async () => {
        if (!user) return;
        const { data: newRoleData } = await supabase.rpc('get_user_role', { _user_id: user.id });
        if (newRoleData && newRoleData !== prevRoleRef.current) {
          setUserRole(newRoleData);
          if (['elite_hunter', 'guild_master', 'shadow_monarch'].includes(newRoleData)) {
            setTimeout(() => { setNewRole(newRoleData as any); setShowRoleUpgrade(true); }, 2000);
          }
          prevRoleRef.current = newRoleData;
        }
      };
      checkRoleUpgrade();
    }
    prevLevelRef.current = currentLevel;
  }, [currentLevel, triggerLevelUp, user]);

  useEffect(() => {
    if (stats && user) {
      checkAndUnlockAchievements({
        level: currentLevel,
        totalExp: stats.total_exp || 0,
        tasksCompleted: dbCompletedTasks.length,
        currentStreak: stats.current_streak || 0,
        longestStreak: stats.longest_streak || 0,
      });
    }
  }, [currentLevel, stats, dbCompletedTasks.length, checkAndUnlockAchievements, user]);

  const playHover = useCallback(() => soundManager.playHover(), []);

  return (
    <>
      <PageTransition>
      <motion.div
        initial="initial"
        animate="animate"
        className="min-h-screen bg-background relative overflow-hidden"
      >
        {/* Arctic ambient layers */}
        <NatureAmbience showFireflies showBreathing leavesCount={2} firefliesCount={6} breathingVariant="mist" showCherryBlossoms={false} />
        <SakuraPetals count={10} />
        <ArcticSilhouettes />
        <AuroraBorealis />

        {/* Arctic blue animated gradient orbs */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{ top: "5%", left: "-5%", background: "radial-gradient(circle, hsl(200 65% 60% / 0.1), transparent)" }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{ bottom: "10%", right: "0%", background: "radial-gradient(circle, hsl(215 55% 55% / 0.08), transparent)" }}
            animate={{ scale: [1, 1.1, 1], y: [0, -20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          />
          <motion.div
            className="absolute w-[350px] h-[350px] rounded-full blur-[90px]"
            style={{ top: "40%", right: "30%", background: "radial-gradient(circle, hsl(190 60% 55% / 0.06), transparent)" }}
            animate={{ x: [0, 30, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          />
        </div>

        <motion.div variants={stagger} className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8">

          {/* ═══ Header ═══ */}
          <motion.div variants={fadeSlideUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <motion.div
              variants={slideFromLeft}
              className="flex items-center gap-4"
            >
              <motion.div
                className="relative"
                whileHover={{ scale: 1.08, rotate: 3 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/10 border border-primary/20 flex items-center justify-center backdrop-blur-sm">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 400 }}
                  className={`absolute -top-1.5 -right-1.5 rank-badge ${rankInfo.class} text-[9px]`}
                >
                  {rankInfo.rank}
                </motion.span>
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="font-game text-2xl md:text-3xl font-bold text-foreground tracking-wide"
                >
                  Welcome back{profile ? `, ${profile.username}` : ''}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="font-ui text-sm text-muted-foreground flex items-center gap-1.5"
                >
                  Level {playerLevel} • {rankInfo.rank}-Rank Hunter
                  <motion.span
                    animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                  </motion.span>
                </motion.p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeSlideUp}
              className="flex gap-2 items-center flex-wrap"
            >
              {[
                { el: <ProfileAvatar profile={profile} size="md" onProfileUpdate={setProfile} />, key: "avatar" },
                { el: <DarkModeToggle />, key: "dark" },
                { el: (
                  <Button variant="ghost" size="icon" onClick={() => navigate("/settings")} onMouseEnter={playHover} className="rounded-full hover:bg-muted">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                  </Button>
                ), key: "settings" },
                { el: (
                  <Button variant="ghost" size="icon" onClick={signOut} onMouseEnter={playHover} className="rounded-full hover:bg-destructive/10">
                    <LogOut className="w-5 h-5 text-muted-foreground" />
                  </Button>
                ), key: "logout" },
              ].map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.08, type: "spring", stiffness: 300 }}
                >
                  {item.el}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ═══ Level Bar ═══ */}
          <motion.div
            variants={scaleIn}
            whileHover={{ scale: 1.01 }}
            className="bg-card/60 backdrop-blur-md rounded-2xl p-4 border border-border/40 mb-6 shadow-sm"
          >
            <div className="flex items-center justify-between text-sm mb-2">
              <motion.span
                className="font-game text-primary"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                LEVEL {playerLevel}
              </motion.span>
              <span className="font-ui text-muted-foreground">
                <span className="text-primary font-bold">{playerExp}</span> / {expToNextLevel} EXP
              </span>
            </div>
            <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${(playerExp / expToNextLevel) * 100}%` }}
                transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.5 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1.5 }}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* ═══ Streak + Quote ═══ */}
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <AnimatePresence>
              {streak.currentStreak > 0 && (
                <motion.div
                  variants={fadeSlideUp}
                  whileHover={{ y: -3, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="p-4 rounded-2xl bg-gradient-to-r from-destructive/8 to-gold/8 border border-destructive/20 flex items-center gap-3 backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Flame className="w-7 h-7 text-destructive" />
                  </motion.div>
                  <div>
                    <span className="font-game text-lg font-bold text-destructive">{streak.currentStreak} DAY STREAK</span>
                    {streak.todayCompleted && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-destructive/15 text-destructive"
                      >
                        ✓ TODAY
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              variants={fadeSlideUp}
              whileHover={{ y: -3 }}
              className={`p-4 rounded-2xl bg-gradient-to-r from-gold/8 to-primary/5 border border-gold/20 flex items-center gap-3 backdrop-blur-sm ${streak.currentStreak <= 0 ? 'md:col-span-2' : ''}`}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Quote className="w-5 h-5 text-gold shrink-0" />
              </motion.div>
              <p className="font-ui text-sm text-foreground/80 italic line-clamp-2">
                "{quote.quote}" <span className="text-gold font-semibold">— {quote.character}</span>
              </p>
            </motion.div>
          </motion.div>

          {/* ═══ Quick Nav ═══ */}
          <motion.div variants={stagger} className="flex gap-2 flex-wrap mb-8">
            {[
              { label: "Streak", icon: Calendar, route: "/streak", hoverColor: "hover:bg-primary/10 hover:text-primary hover:border-primary/30" },
              { label: "Journal", icon: BookOpen, route: "/journal", hoverColor: "hover:bg-gold/10 hover:text-gold hover:border-gold/30" },
              { label: "Stats", icon: BarChart3, route: "/statistics", hoverColor: "hover:bg-secondary/10 hover:text-secondary hover:border-secondary/30" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                variants={fadeSlideUp}
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { soundManager.playNavigate(); navigate(item.route); }}
                  onMouseEnter={playHover}
                  className={`font-ui rounded-full border-border/40 text-muted-foreground ${item.hoverColor} transition-all backdrop-blur-sm`}
                >
                  <item.icon className="w-4 h-4 mr-1.5" />
                  {item.label}
                </Button>
              </motion.div>
            ))}
          </motion.div>

          {/* ═══ Section Cards ═══ */}
          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sectionCards.map((card) => {
              const Icon = card.icon;
              const colorStyles: Record<string, { iconBg: string; iconBorder: string; iconText: string; glow: string; ring: string }> = {
                primary:     { iconBg: "bg-primary/10",     iconBorder: "border-primary/25",     iconText: "text-primary",     glow: "shadow-[0_0_30px_-5px_hsl(var(--primary)/0.35)]",     ring: "group-hover:border-primary/50" },
                secondary:   { iconBg: "bg-secondary/10",   iconBorder: "border-secondary/25",   iconText: "text-secondary",   glow: "shadow-[0_0_30px_-5px_hsl(var(--secondary)/0.35)]",   ring: "group-hover:border-secondary/50" },
                accent:      { iconBg: "bg-accent/10",      iconBorder: "border-accent/25",      iconText: "text-accent",      glow: "shadow-[0_0_30px_-5px_hsl(var(--accent)/0.35)]",      ring: "group-hover:border-accent/50" },
                destructive: { iconBg: "bg-destructive/10", iconBorder: "border-destructive/25", iconText: "text-destructive", glow: "shadow-[0_0_30px_-5px_hsl(var(--destructive)/0.35)]", ring: "group-hover:border-destructive/50" },
                gold:        { iconBg: "bg-gold/10",        iconBorder: "border-gold/25",        iconText: "text-gold",        glow: "shadow-[0_0_30px_-5px_hsl(var(--gold)/0.35)]",        ring: "group-hover:border-gold/50" },
              };
              const cs = colorStyles[card.color] ?? colorStyles.primary;

              return (
                <motion.button
                  key={card.id}
                  variants={fadeSlideUp}
                  whileHover={{ y: -6, scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  onClick={() => { soundManager.playNavigate(); navigate(card.route); }}
                  onMouseEnter={playHover}
                  className={`group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br ${card.gradient} border ${card.borderColor} ${cs.ring} backdrop-blur-sm text-left transition-all duration-300 hover:${cs.glow}`}
                >
                  {/* Soft inner glow on hover */}
                  <div className={`pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${card.gradient}`} />

                  {/* Diagonal shimmer sweep */}
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                    <div className="absolute -inset-y-4 -left-1/2 w-1/2 rotate-12 bg-gradient-to-r from-transparent via-foreground/[0.07] to-transparent translate-x-0 group-hover:translate-x-[300%] transition-transform duration-[1100ms] ease-out" />
                  </div>

                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        whileHover={{ rotate: 6, scale: 1.12 }}
                        transition={{ type: "spring", stiffness: 320, damping: 14 }}
                        className={`w-11 h-11 rounded-xl ${cs.iconBg} border ${cs.iconBorder} flex items-center justify-center transition-shadow duration-300 group-hover:shadow-[0_0_18px_-2px_currentColor] ${cs.iconText}`}
                      >
                        <Icon className={`w-5 h-5 ${cs.iconText} transition-transform duration-500 group-hover:rotate-[-4deg]`} />
                      </motion.div>
                      <div>
                        <h3 className="font-game text-lg font-bold text-foreground tracking-wide">{card.title}</h3>
                        <p className="font-ui text-sm text-muted-foreground">{card.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 mt-1 text-muted-foreground transition-all duration-300 group-hover:text-foreground group-hover:translate-x-1" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Modals */}
        <LevelUpModal open={showLevelUp} onClose={() => setShowLevelUp(false)} level={playerLevel} previousLevel={previousLevel ?? undefined} />
        {newRole && <RoleUpgradeModal open={showRoleUpgrade} onClose={() => { setShowRoleUpgrade(false); setNewRole(null); }} newRole={newRole} level={playerLevel} />}
        <AchievementUnlockModal open={newlyUnlocked.length > 0} onClose={clearNewlyUnlocked} achievements={newlyUnlocked} />

        <div className="fixed bottom-4 right-4 z-50"><AmbientSoundPlayer /></div>
      </motion.div>
    </PageTransition>
    </>
  );
};

export default Dashboard;
