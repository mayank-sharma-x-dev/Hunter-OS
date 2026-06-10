import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense, useEffect } from "react";
import { LucyChat } from "./components/lucy/LucyChat";
import RouteProgressBar from "./components/RouteProgressBar";

// Each loader is held as a memoized promise so prefetch + lazy share the same import.
const loaders = {
  Index: () => import("./pages/Index"),
  Auth: () => import("./pages/Auth"),
  Dashboard: () => import("./pages/Dashboard"),
  Quests: () => import("./pages/Quests"),
  Study: () => import("./pages/Study"),
  Growth: () => import("./pages/Growth"),
  SkillsAcademy: () => import("./pages/SkillsAcademy"),
  Vitals: () => import("./pages/Vitals"),
  Treasury: () => import("./pages/Treasury"),
  Statistics: () => import("./pages/Statistics"),
  Journal: () => import("./pages/Journal"),
  Streak: () => import("./pages/Streak"),
  Settings: () => import("./pages/Settings"),
  NotFound: () => import("./pages/NotFound"),
};

const Index = lazy(loaders.Index);
const Auth = lazy(loaders.Auth);
const Dashboard = lazy(loaders.Dashboard);
const Quests = lazy(loaders.Quests);
const Study = lazy(loaders.Study);
const Growth = lazy(loaders.Growth);
const SkillsAcademy = lazy(loaders.SkillsAcademy);
const Vitals = lazy(loaders.Vitals);
const Treasury = lazy(loaders.Treasury);
const Statistics = lazy(loaders.Statistics);
const Journal = lazy(loaders.Journal);
const Streak = lazy(loaders.Streak);
const Settings = lazy(loaders.Settings);
const NotFound = lazy(loaders.NotFound);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

/** Prefetch every route chunk during idle time so subsequent navigations are instant. */
const useRoutePrefetch = () => {
  useEffect(() => {
    const idle =
      (window as any).requestIdleCallback ||
      ((cb: () => void) => window.setTimeout(cb, 200));
    const cancelIdle =
      (window as any).cancelIdleCallback || window.clearTimeout;

    const handle = idle(() => {
      Object.values(loaders).forEach((load) => {
        // fire-and-forget; browser caches the chunk
        load().catch(() => {});
      });
    });

    return () => cancelIdle(handle);
  }, []);
};

const AnimatedRoutes = () => {
  const location = useLocation();
  useRoutePrefetch();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={null}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/study" element={<Study />} />
          <Route path="/growth" element={<Growth />} />
          <Route path="/skills-academy" element={<SkillsAcademy />} />
          <Route path="/vitals" element={<Vitals />} />
          <Route path="/treasury" element={<Treasury />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/streak" element={<Streak />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteProgressBar />
        <AnimatedRoutes />
        <LucyChat />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
