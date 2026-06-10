import { useCallback } from "react";

export const useScreenEffects = () => {
  const triggerShake = useCallback((intensity: "light" | "medium" | "heavy" = "medium") => {
    const root = document.documentElement;
    const shakeClass = `screen-shake-${intensity}`;
    root.classList.add(shakeClass);
    setTimeout(() => root.classList.remove(shakeClass), intensity === "heavy" ? 600 : intensity === "medium" ? 400 : 200);
  }, []);

  const triggerFlash = useCallback((color: "primary" | "gold" | "accent" | "white" = "primary") => {
    const flash = document.createElement("div");
    flash.className = `screen-flash screen-flash-${color}`;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
  }, []);

  const triggerLevelUp = useCallback(() => {
    triggerShake("heavy");
    triggerFlash("gold");
    // Add secondary flash for dramatic effect
    setTimeout(() => triggerFlash("white"), 150);
  }, [triggerShake, triggerFlash]);

  const triggerTaskComplete = useCallback(() => {
    triggerShake("light");
    triggerFlash("primary");
  }, [triggerShake, triggerFlash]);

  return {
    triggerShake,
    triggerFlash,
    triggerLevelUp,
    triggerTaskComplete,
  };
};
