import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Target, Brain, Shield, Flame } from "lucide-react";
import NatureAmbience from "@/components/nature/NatureAmbience";

const PRELOADER_DURATION = 1200;

const preloaderVariants = {
  initial: { opacity: 1 },
  exit: { opacity: 0, scale: 1.1, filter: "blur(10px)", transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] } },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const fadeSlideUp = {
  initial: { opacity: 0, y: 40, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const features = [
  { icon: Target, label: "Quest System", desc: "Daily missions that level you up", color: "primary" },
  { icon: Brain, label: "Skills Academy", desc: "Master real-life abilities with AI", color: "secondary" },
  { icon: Shield, label: "Rank Progression", desc: "E-Rank to S-Rank journey", color: "accent" },
  { icon: Flame, label: "Streak Engine", desc: "Build unstoppable momentum", color: "gold" },
];

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [currentWord, setCurrentWord] = useState(0);
  const words = ["Initializing", "Loading Systems", "Preparing Your Journey"];

  useEffect(() => {
    const interval = setInterval(() => setProgress(p => Math.min(p + 2, 100)), PRELOADER_DURATION / 50);
    const wordInterval = setInterval(() => setCurrentWord(w => (w + 1) % words.length), 800);
    const timer = setTimeout(onComplete, PRELOADER_DURATION);
    return () => { clearInterval(interval); clearInterval(wordInterval); clearTimeout(timer); };
  }, [onComplete]);

  return (
    <motion.div
      variants={preloaderVariants}
      initial="initial"
      exit="exit"
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-8"
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[100px] animate-pulse [animation-delay:0.5s]" />
      </div>

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 1, ease: [0.68, -0.55, 0.265, 1.55] }}
        className="relative"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/30 flex items-center justify-center backdrop-blur-xl">
          <Zap className="w-10 h-10 text-primary" />
        </div>
        <div className="absolute -inset-4 rounded-[2rem] border border-primary/10 animate-ping [animation-duration:2s]" />
      </motion.div>

      <div className="flex flex-col items-center gap-3">
        <motion.p
          key={currentWord}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-ui text-sm text-muted-foreground tracking-widest uppercase"
        >
          {words[currentWord]}
        </motion.p>
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const FloatingOrb = ({ delay, size, color, x, y }: { delay: number; size: number; color: string; x: string; y: string }) => (
  <motion.div
    className={`absolute rounded-full bg-${color}/10 blur-2xl`}
    style={{ width: size, height: size, left: x, top: y }}
    animate={{
      y: [0, -30, 0, 20, 0],
      x: [0, 15, -10, 5, 0],
      scale: [1, 1.1, 0.95, 1.05, 1],
    }}
    transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

const Index = () => {
  const navigate = useNavigate();
  const [showPreloader, setShowPreloader] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleStart = useCallback(() => {
    navigate("/auth");
  }, [navigate]);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {showPreloader && <Preloader key="preloader" onComplete={() => setShowPreloader(false)} />}
      </AnimatePresence>

      <NatureAmbience showFireflies firefliesCount={8} showBreathing breathingVariant="mist" />

      {/* Interactive cursor glow */}
      <motion.div
        className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 70%)",
          left: `calc(${mousePos.x * 100}% - 250px)`,
          top: `calc(${mousePos.y * 100}% - 250px)`,
        }}
        transition={{ type: "tween", duration: 0.3 }}
      />

      {/* Floating ambient orbs */}
      <FloatingOrb delay={0} size={300} color="primary" x="10%" y="20%" />
      <FloatingOrb delay={2} size={200} color="secondary" x="70%" y="60%" />
      <FloatingOrb delay={4} size={250} color="accent" x="80%" y="10%" />
      <FloatingOrb delay={1} size={180} color="gold" x="20%" y="70%" />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      {/* Main Content */}
      {!showPreloader && (
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Nav */}
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-between px-6 md:px-12 py-6"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <span className="font-game text-lg font-bold text-foreground tracking-wider">SOLO LEVELING</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="px-5 py-2 rounded-full bg-card/80 border border-border/50 font-ui text-sm text-foreground hover:bg-card transition-colors backdrop-blur-sm"
            >
              Sign In
            </motion.button>
          </motion.nav>

          {/* Hero */}
          <div className="flex-1 flex items-center justify-center px-6 md:px-12">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="max-w-3xl mx-auto text-center"
            >
              {/* Badge */}
              <motion.div variants={fadeSlideUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 mb-8">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="font-ui text-xs text-primary tracking-wider uppercase font-medium">Student Growth System</span>
              </motion.div>

              {/* Headline */}
              <motion.h1 variants={fadeSlideUp} className="font-game text-5xl md:text-7xl lg:text-8xl font-bold text-foreground leading-[0.95] tracking-tight mb-6">
                Level Up
                <br />
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Your Life
                </span>
              </motion.h1>

              {/* Subtext */}
              <motion.p variants={fadeSlideUp} className="font-ui text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
                Transform daily habits into quests. Track skills, build streaks, 
                and watch yourself evolve — one level at a time.
              </motion.p>

              {/* CTA */}
              <motion.div variants={fadeSlideUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStart}
                  className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-game text-lg tracking-wider flex items-center gap-3 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
                >
                  <span>Begin Your Journey</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 blur-xl transition-opacity -z-10" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                  className="px-8 py-4 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm text-foreground font-ui text-base hover:bg-card/80 transition-colors"
                >
                  Explore Features
                </motion.button>
              </motion.div>

              {/* Scroll indicator */}
              <motion.div
                variants={fadeSlideUp}
                className="mt-16 flex flex-col items-center gap-2"
              >
                <span className="font-ui text-xs text-muted-foreground/60 uppercase tracking-widest">Scroll</span>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-5 h-8 rounded-full border-2 border-muted-foreground/20 flex items-start justify-center pt-1.5"
                >
                  <div className="w-1 h-2 rounded-full bg-muted-foreground/40" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* Features Section */}
          <div id="features" className="px-6 md:px-12 py-24 md:py-32">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="max-w-5xl mx-auto"
            >
              <motion.p variants={fadeSlideUp} className="font-ui text-xs text-primary tracking-widest uppercase mb-3 text-center">What's Inside</motion.p>
              <motion.h2 variants={fadeSlideUp} className="font-game text-3xl md:text-5xl font-bold text-foreground text-center mb-4">
                Everything you need to <span className="text-primary">grow</span>
              </motion.h2>
              <motion.p variants={fadeSlideUp} className="font-ui text-muted-foreground text-center max-w-lg mx-auto mb-16">
                A gamified ecosystem designed to build discipline, track progress, and keep you moving forward.
              </motion.p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {features.map((feat, i) => {
                  const Icon = feat.icon;
                  return (
                    <motion.div
                      key={feat.label}
                      variants={scaleIn}
                      whileHover={{ y: -6, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`group relative p-8 rounded-3xl bg-card/60 backdrop-blur-sm border border-border/50 hover:border-${feat.color}/30 transition-colors cursor-default overflow-hidden`}
                    >
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-${feat.color}/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-${feat.color}/10 transition-colors`} />
                      <div className={`w-12 h-12 rounded-2xl bg-${feat.color}/10 border border-${feat.color}/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 text-${feat.color}`} />
                      </div>
                      <h3 className="font-game text-xl font-bold text-foreground mb-2">{feat.label}</h3>
                      <p className="font-ui text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <div className="px-6 md:px-12 pb-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="p-12 md:p-16 rounded-3xl bg-gradient-to-br from-primary/8 via-card/80 to-secondary/5 border border-primary/15 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <h3 className="font-game text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Ready to begin?
                </h3>
                <p className="font-ui text-muted-foreground mb-8 max-w-md mx-auto">
                  Your character awaits. Start as an E-Rank Hunter and climb your way to the top.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStart}
                  className="px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-game text-lg tracking-wider shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
                >
                  Enter the System
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="px-6 md:px-12 pb-8">
            <div className="flex items-center justify-center gap-6 text-muted-foreground/40">
              <span className="font-ui text-xs">Solo Leveling © 2026</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
              <span className="font-ui text-xs">Student Hunter System</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
              <span className="font-ui text-xs">Created by Dev Mayank Sharma 2026</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
