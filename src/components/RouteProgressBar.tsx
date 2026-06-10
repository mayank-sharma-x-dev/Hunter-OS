import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Thin top progress bar that briefly appears on route changes.
 * Mimics nprogress: quick ramp to ~80%, then completes after content settles.
 */
const RouteProgressBar = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const firstRender = useRef(true);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    // clear any pending timers
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];

    setVisible(true);
    setProgress(15);

    timersRef.current.push(window.setTimeout(() => setProgress(55), 80));
    timersRef.current.push(window.setTimeout(() => setProgress(82), 220));
    timersRef.current.push(window.setTimeout(() => setProgress(100), 420));
    timersRef.current.push(window.setTimeout(() => setVisible(false), 700));
    timersRef.current.push(window.setTimeout(() => setProgress(0), 900));

    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="route-progress"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 z-[10000] h-[2px] pointer-events-none"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-secondary to-primary rounded-r-full"
            style={{
              width: `${progress}%`,
              boxShadow: "0 0 10px hsl(var(--primary) / 0.6), 0 0 4px hsl(var(--primary) / 0.8)",
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RouteProgressBar;
