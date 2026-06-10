import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { soundManager } from "@/lib/sounds";
import NatureAmbience from "@/components/nature/NatureAmbience";
import SakuraPetals from "@/components/nature/SakuraPetals";
import ArcticSilhouettes from "@/components/nature/ArcticSilhouettes";
import AuroraBorealis from "@/components/nature/AuroraBorealis";
import DarkModeToggle from "@/components/DarkModeToggle";

const stagger = {
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const scaleUp = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
};

interface ChillPageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  icon: ReactNode;
  accentColor: string;
  maxWidth?: string;
  stats?: Array<{ icon: ReactNode; value: string | number; label: string; color: string }>;
}

const ChillPageLayout = ({
  children,
  title,
  subtitle,
  icon,
  accentColor,
  maxWidth = "max-w-7xl",
  stats,
}: ChillPageLayoutProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit={{ opacity: 0, y: -8 }}
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

      <div className={`relative z-10 ${maxWidth} mx-auto px-4 md:px-8 py-6 md:py-8`}>
        {/* Header */}
        <motion.div variants={stagger} className="flex items-center justify-between mb-8">
          <motion.div variants={fadeUp} className="flex items-center gap-3 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { soundManager.playNavigate(); navigate("/dashboard"); }}
              className="rounded-full hover:bg-primary/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Button>
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.08, rotate: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-card/60 backdrop-blur-md border border-border/30 flex items-center justify-center shadow-sm"
              >
                {icon}
              </motion.div>
              <div>
                <h1 className="font-game text-xl md:text-2xl font-bold text-foreground tracking-wide">
                  {title}
                </h1>
                <p className="font-ui text-xs md:text-sm text-muted-foreground">{subtitle}</p>
              </div>
            </div>
          </motion.div>
          <motion.div variants={fadeUp}>
            <DarkModeToggle />
          </motion.div>
        </motion.div>

        {/* Stats Row */}
        {stats && stats.length > 0 && (
          <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={scaleUp}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/30 text-center shadow-sm cursor-default"
              >
                <div className="text-muted-foreground mx-auto mb-1 flex justify-center">{stat.icon}</div>
                <span className="font-game text-xl md:text-2xl text-foreground">{stat.value}</span>
                <p className="text-[10px] md:text-xs text-muted-foreground font-ui mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Content */}
        <motion.div variants={stagger}>
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
};

export { ChillPageLayout, fadeUp, scaleUp, stagger };
export default ChillPageLayout;
