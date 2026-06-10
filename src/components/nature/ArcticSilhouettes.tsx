import { motion } from "framer-motion";

/**
 * ArcticSilhouettes — animated Mt. Fuji + torii gate SVG silhouettes
 * with drifting snow particles and aurora-like glow.
 */
const ArcticSilhouettes = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Mt. Fuji silhouette — bottom-right */}
      <motion.svg
        viewBox="0 0 800 400"
        className="absolute bottom-0 right-0 w-[55vw] max-w-[700px] opacity-[0.06] dark:opacity-[0.08]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: [0.04, 0.07, 0.04], y: 0 }}
        transition={{ opacity: { duration: 10, repeat: Infinity, ease: "easeInOut" }, y: { duration: 1.5, ease: "easeOut" } }}
      >
        <path
          d="M0 400 L250 80 Q300 40 350 60 L400 80 Q420 70 440 80 L500 130 Q520 120 540 130 L800 400 Z"
          fill="currentColor"
          className="text-primary"
        />
        {/* Snow cap */}
        <path
          d="M250 80 L300 55 Q310 48 320 55 L350 60 Q360 52 370 58 L400 80 Q380 90 360 85 L320 78 Q300 72 280 80 Z"
          fill="currentColor"
          className="text-accent opacity-60"
        />
      </motion.svg>

      {/* Torii gate silhouette — bottom-left */}
      <motion.svg
        viewBox="0 0 200 300"
        className="absolute bottom-0 left-[8%] w-[12vw] max-w-[140px] min-w-[80px] opacity-[0.06] dark:opacity-[0.1]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: [0.05, 0.09, 0.05], y: 0 }}
        transition={{ opacity: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }, y: { duration: 1.8, ease: "easeOut" } }}
      >
        {/* Main pillars */}
        <rect x="30" y="60" width="12" height="240" rx="3" fill="currentColor" className="text-primary" />
        <rect x="158" y="60" width="12" height="240" rx="3" fill="currentColor" className="text-primary" />
        {/* Top beam (kasagi) — curved */}
        <path d="M10 55 Q100 35 190 55 L190 65 Q100 48 10 65 Z" fill="currentColor" className="text-primary" />
        {/* Second beam (nuki) */}
        <rect x="25" y="90" width="150" height="8" rx="2" fill="currentColor" className="text-primary" />
        {/* Small tablet (gakuzuka) */}
        <rect x="80" y="70" width="40" height="22" rx="3" fill="currentColor" className="text-secondary" />
      </motion.svg>

      {/* Drifting snow / ice particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/20 dark:bg-primary/15"
          style={{
            width: 2 + Math.random() * 4,
            height: 2 + Math.random() * 4,
            left: `${Math.random() * 100}%`,
            top: `-${5 + Math.random() * 10}%`,
          }}
          animate={{
            y: ["0vh", "110vh"],
            x: [0, (Math.random() - 0.5) * 120],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 12,
            repeat: Infinity,
            delay: Math.random() * 15,
            ease: "linear",
          }}
        />
      ))}

      {/* Aurora / icy glow ribbon at top */}
      <motion.div
        className="absolute top-0 left-0 w-full h-[30vh]"
        style={{
          background: "linear-gradient(180deg, hsl(200 70% 55% / 0.04), hsl(190 60% 50% / 0.02), transparent)",
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

export default ArcticSilhouettes;
