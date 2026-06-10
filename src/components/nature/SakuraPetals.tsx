import { motion } from "framer-motion";
import { useMemo } from "react";

interface SakuraPetalsProps {
  count?: number;
}

const SakuraPetals = ({ count = 15 }: SakuraPetalsProps) => {
  const petals = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 10,
      size: 8 + Math.random() * 10,
      rotation: Math.random() * 360,
      swayAmount: 30 + Math.random() * 60,
      opacity: 0.3 + Math.random() * 0.4,
    }));
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute"
          initial={{
            x: `${petal.x}vw`,
            y: -20,
            rotate: petal.rotation,
            opacity: 0,
          }}
          animate={{
            y: ["−20px", "110vh"],
            x: [
              `${petal.x}vw`,
              `${petal.x + petal.swayAmount / 5}vw`,
              `${petal.x - petal.swayAmount / 8}vw`,
              `${petal.x + petal.swayAmount / 4}vw`,
            ],
            rotate: [petal.rotation, petal.rotation + 180, petal.rotation + 360],
            opacity: [0, petal.opacity, petal.opacity, 0],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Sakura petal shape */}
          <svg
            width={petal.size}
            height={petal.size}
            viewBox="0 0 20 20"
            fill="none"
          >
            <ellipse
              cx="10"
              cy="8"
              rx="5"
              ry="8"
              fill="hsl(350, 70%, 80%)"
              opacity="0.8"
            />
            <ellipse
              cx="10"
              cy="8"
              rx="3"
              ry="6"
              fill="hsl(345, 80%, 88%)"
              opacity="0.6"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default SakuraPetals;
