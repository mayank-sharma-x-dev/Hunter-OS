import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, Activity, Brain, Flame, Shield, Zap, 
  TrendingUp, Award, Sparkles, Crown
} from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { format } from "date-fns";

interface VitalityScore {
  overall: number;
  physical: number;
  nutrition: number;
  hydration: number;
  recovery: number;
  consistency: number;
}

export const VitalityDashboard = () => {
  const [scores, setScores] = useState<VitalityScore>({
    overall: 0,
    physical: 0,
    nutrition: 0,
    hydration: 0,
    recovery: 0,
    consistency: 0,
  });

  useEffect(() => {
    // Calculate scores from localStorage data
    const healthData = localStorage.getItem('healthTracker');
    const nutritionData = localStorage.getItem('nutritionTracker');
    const bodyData = localStorage.getItem('bodyMetrics');

    let physical = 50;
    let nutrition = 50;
    let hydration = 50;
    let recovery = 50;
    let consistency = 50;

    if (healthData) {
      const health = JSON.parse(healthData);
      hydration = Math.min((health.water / 8) * 100, 100);
      recovery = Math.min((health.sleep / 8) * 100, 100);
      physical = Math.min((health.exercise / 30) * 50 + (health.energy * 5), 100);
    }

    if (nutritionData) {
      const nutri = JSON.parse(nutritionData);
      const proteinScore = Math.min((nutri.protein / 150) * 40, 40);
      const calorieScore = nutri.calories >= 1800 && nutri.calories <= 2500 ? 30 : 15;
      const waterScore = Math.min((nutri.water / 3) * 30, 30);
      nutrition = proteinScore + calorieScore + waterScore;
    }

    if (bodyData) {
      const body = JSON.parse(bodyData);
      if (body.current) {
        const bmiScore = body.current.bmi >= 18.5 && body.current.bmi < 25 ? 30 : 15;
        const bfScore = body.current.bodyFat >= 10 && body.current.bodyFat <= 25 ? 30 : 15;
        consistency = bmiScore + bfScore + 40;
      }
    }

    const overall = Math.round((physical + nutrition + hydration + recovery + consistency) / 5);

    setScores({
      overall,
      physical: Math.round(physical),
      nutrition: Math.round(nutrition),
      hydration: Math.round(hydration),
      recovery: Math.round(recovery),
      consistency: Math.round(consistency),
    });
  }, []);

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'S', color: 'gold', label: 'Legendary' };
    if (score >= 80) return { grade: 'A', color: 'primary', label: 'Excellent' };
    if (score >= 70) return { grade: 'B', color: 'accent', label: 'Great' };
    if (score >= 60) return { grade: 'C', color: 'secondary', label: 'Good' };
    if (score >= 50) return { grade: 'D', color: 'gold', label: 'Average' };
    return { grade: 'F', color: 'destructive', label: 'Needs Work' };
  };

  const overallGrade = getScoreGrade(scores.overall);

  const stats = [
    { key: 'physical', label: 'Physical', icon: Activity, value: scores.physical },
    { key: 'nutrition', label: 'Nutrition', icon: Flame, value: scores.nutrition },
    { key: 'hydration', label: 'Hydration', icon: Heart, value: scores.hydration },
    { key: 'recovery', label: 'Recovery', icon: Brain, value: scores.recovery },
    { key: 'consistency', label: 'Consistency', icon: Shield, value: scores.consistency },
  ];

  // Generate animated particles
  const particles = useMemo(() => 
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      delay: Math.random() * 3,
      size: 2 + Math.random() * 3,
    }))
  , []);

  return (
    <Card className="relative overflow-hidden border-2 border-primary/40 bg-gradient-to-br from-card via-card/95 to-primary/10 backdrop-blur-xl shadow-2xl">
      {/* Epic animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/15 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-gold/15 rounded-full blur-3xl animate-pulse-glow [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/10 rounded-full blur-2xl animate-pulse-glow [animation-delay:2s]" />
        
        {/* Floating particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-primary animate-particle-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              boxShadow: `0 0 ${particle.size * 3}px hsl(var(--primary) / 0.5)`,
            }}
          />
        ))}
      </div>

      <CardContent className="p-6 relative z-10">
        {/* Main Score Display */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/20 border border-primary/30 mb-3">
            <Sparkles className="w-4 h-4 text-gold animate-pulse" />
            <span className="font-ui text-xs text-muted-foreground uppercase tracking-wider">Vitality Index</span>
            <Sparkles className="w-4 h-4 text-gold animate-pulse" />
          </div>
          
          {/* Score Circle */}
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full border-4 border-primary/30 flex items-center justify-center bg-gradient-to-br from-card to-primary/10 shadow-xl shadow-primary/20">
              <div className="text-center">
                <div className={`font-game text-5xl text-${overallGrade.color} text-glow-${overallGrade.color}`}>
                  {scores.overall}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Points</div>
              </div>
            </div>
            
            {/* Orbiting ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20 animate-spin-slow" />
            
            {/* Grade badge */}
            <div className={`absolute -top-2 -right-2 w-10 h-10 rounded-full bg-${overallGrade.color} border-2 border-background flex items-center justify-center shadow-lg`}>
              <span className={`font-game text-lg text-${overallGrade.color}-foreground`}>{overallGrade.grade}</span>
            </div>
            
            {/* Crown for S rank */}
            {overallGrade.grade === 'S' && (
              <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 text-gold animate-float" />
            )}
          </div>
          
          <div className="mt-3">
            <span className={`font-game text-lg text-${overallGrade.color}`}>{overallGrade.label}</span>
            <p className="text-xs text-muted-foreground mt-1">Hunter Vitality Status</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {stats.map((stat) => {
            const grade = getScoreGrade(stat.value);
            return (
              <div 
                key={stat.key} 
                className="text-center p-2 rounded-xl bg-background/40 border border-border/30 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10 group"
              >
                <div className={`mx-auto w-8 h-8 rounded-lg bg-${grade.color}/20 border border-${grade.color}/30 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-4 h-4 text-${grade.color}`} />
                </div>
                <div className={`font-game text-lg text-${grade.color}`}>{stat.value}</div>
                <div className="text-[9px] text-muted-foreground truncate">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          {stats.map((stat) => {
            const grade = getScoreGrade(stat.value);
            return (
              <div key={stat.key} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <stat.icon className={`w-3 h-3 text-${grade.color}`} />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <span className={`font-game text-xs text-${grade.color}`}>{stat.value}%</span>
                </div>
                <div className="relative h-2 rounded-full bg-background/50 overflow-hidden">
                  <div 
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r from-${grade.color} to-${grade.color}/70 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${stat.value}%` }}
                  />
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/3 animate-shimmer"
                    style={{ width: `${stat.value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Achievement Banner */}
        {scores.overall >= 80 && (
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-gold/20 via-primary/10 to-gold/20 border border-gold/30 flex items-center gap-3 animate-slide-up">
            <Award className="w-8 h-8 text-gold animate-pulse" />
            <div className="flex-1">
              <p className="font-game text-sm text-gold">Elite Status Achieved!</p>
              <p className="text-[10px] text-muted-foreground">Your dedication to health is legendary</p>
            </div>
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
