import { motion } from "framer-motion";

const AuroraBorealis = () => (
  <div className="fixed inset-x-0 top-0 h-[40vh] pointer-events-none z-0 overflow-hidden opacity-60">
    {/* Primary aurora band */}
    <motion.div
      className="absolute inset-x-0 -top-20 h-[200px]"
      style={{
        background: "linear-gradient(180deg, hsl(200 80% 50% / 0.15), hsl(185 70% 55% / 0.08), transparent)",
        filter: "blur(40px)",
      }}
      animate={{
        opacity: [0.4, 0.7, 0.5, 0.8, 0.4],
        scaleX: [1, 1.05, 0.98, 1.03, 1],
        y: [0, 8, -4, 6, 0],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
    {/* Secondary shifted band */}
    <motion.div
      className="absolute inset-x-0 -top-10 h-[160px]"
      style={{
        background: "linear-gradient(180deg, hsl(190 75% 60% / 0.12), hsl(210 65% 55% / 0.06), transparent)",
        filter: "blur(50px)",
      }}
      animate={{
        opacity: [0.3, 0.6, 0.35, 0.65, 0.3],
        scaleX: [1.02, 0.97, 1.04, 0.99, 1.02],
        y: [4, -6, 8, -2, 4],
      }}
      transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
    />
    {/* Tertiary cyan shimmer */}
    <motion.div
      className="absolute left-[20%] right-[20%] top-0 h-[120px]"
      style={{
        background: "radial-gradient(ellipse at center, hsl(180 70% 55% / 0.1), transparent 70%)",
        filter: "blur(30px)",
      }}
      animate={{
        opacity: [0.2, 0.5, 0.25, 0.55, 0.2],
        x: [-30, 30, -15, 25, -30],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
    />
  </div>
);

export default AuroraBorealis;
