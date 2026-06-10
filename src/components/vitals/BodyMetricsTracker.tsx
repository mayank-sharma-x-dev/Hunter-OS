import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Scale, TrendingUp, TrendingDown, Minus, Activity, Plus,
  Target, Sparkles, Flame, RotateCcw
} from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { format } from "date-fns";

interface BodyMetrics {
  date: string;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  waterPercentage: number;
  bmi: number;
  height: number;
}

interface MetricsHistory {
  metrics: BodyMetrics[];
}

const INITIAL_METRICS: BodyMetrics = {
  date: format(new Date(), 'yyyy-MM-dd'),
  weight: 70,
  bodyFat: 20,
  muscleMass: 30,
  waterPercentage: 55,
  bmi: 22,
  height: 170,
};

export const BodyMetricsTracker = () => {
  const [metrics, setMetrics] = useState<BodyMetrics>(INITIAL_METRICS);
  const [history, setHistory] = useState<MetricsHistory>({ metrics: [] });

  useEffect(() => {
    const saved = localStorage.getItem('bodyMetrics');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.current) setMetrics(data.current);
      if (data.history) setHistory(data.history);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bodyMetrics', JSON.stringify({
      current: metrics,
      history: history
    }));
  }, [metrics, history]);

  const calculateBMI = (weight: number, height: number) => {
    const heightM = height / 100;
    return parseFloat((weight / (heightM * heightM)).toFixed(1));
  };

  const updateMetric = (field: keyof BodyMetrics, value: number) => {
    soundManager.playClick();
    const newMetrics = {
      ...metrics,
      [field]: value,
      date: format(new Date(), 'yyyy-MM-dd'),
    };
    
    // Recalculate BMI when weight or height changes
    if (field === 'weight' || field === 'height') {
      newMetrics.bmi = calculateBMI(
        field === 'weight' ? value : metrics.weight,
        field === 'height' ? value : metrics.height
      );
    }
    
    setMetrics(newMetrics);
  };

  const adjustMetric = (field: keyof BodyMetrics, amount: number) => {
    const newValue = Math.max(0, (metrics[field] as number) + amount);
    updateMetric(field, newValue);
  };

  const handleDirectInput = (field: keyof BodyMetrics, value: string) => {
    const numValue = parseFloat(value) || 0;
    updateMetric(field, numValue);
  };

  const saveToHistory = () => {
    soundManager.playTaskComplete();
    setHistory(prev => ({
      metrics: [...prev.metrics, { ...metrics }].slice(-30)
    }));
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-secondary', bg: 'bg-secondary/20' };
    if (bmi < 25) return { label: 'Healthy', color: 'text-accent', bg: 'bg-accent/20' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-gold', bg: 'bg-gold/20' };
    return { label: 'Obese', color: 'text-destructive', bg: 'bg-destructive/20' };
  };

  const getBodyFatCategory = (bf: number) => {
    if (bf < 10) return { label: 'Essential', color: 'text-destructive' };
    if (bf < 15) return { label: 'Athletic', color: 'text-accent' };
    if (bf < 20) return { label: 'Fitness', color: 'text-primary' };
    if (bf < 25) return { label: 'Average', color: 'text-gold' };
    return { label: 'Above Avg', color: 'text-destructive' };
  };

  const getWeightTrend = () => {
    if (history.metrics.length < 1) return null;
    const previous = history.metrics[history.metrics.length - 1]?.weight || metrics.weight;
    const diff = metrics.weight - previous;
    if (Math.abs(diff) < 0.1) return { icon: Minus, color: 'text-muted-foreground', label: 'Stable' };
    if (diff > 0) return { icon: TrendingUp, color: 'text-gold', label: `+${diff.toFixed(1)}kg` };
    return { icon: TrendingDown, color: 'text-accent', label: `${diff.toFixed(1)}kg` };
  };

  const bmiCategory = getBMICategory(metrics.bmi);
  const bodyFatCategory = getBodyFatCategory(metrics.bodyFat);
  const weightTrend = getWeightTrend();

  const getOverallScore = () => {
    let score = 0;
    if (metrics.bmi >= 18.5 && metrics.bmi < 25) score += 30;
    else if (metrics.bmi >= 17 && metrics.bmi < 27) score += 20;
    else score += 10;
    
    if (metrics.bodyFat >= 10 && metrics.bodyFat <= 20) score += 30;
    else if (metrics.bodyFat >= 8 && metrics.bodyFat <= 25) score += 20;
    else score += 10;
    
    const muscleRatio = metrics.muscleMass / metrics.weight;
    if (muscleRatio >= 0.4) score += 20;
    else if (muscleRatio >= 0.35) score += 15;
    else score += 10;
    
    if (metrics.waterPercentage >= 50 && metrics.waterPercentage <= 65) score += 20;
    else if (metrics.waterPercentage >= 45 && metrics.waterPercentage <= 70) score += 15;
    else score += 10;
    
    return score;
  };

  return (
    <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-card/95 via-card/90 to-primary/5 backdrop-blur-xl shadow-2xl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-accent/10 rounded-full blur-2xl animate-pulse-glow [animation-delay:1s]" />
      </div>
      
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="font-game text-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
              <Scale className="w-5 h-5" />
            </div>
            BODY METRICS
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
              <span className="font-game text-sm text-primary">{getOverallScore()}%</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={saveToHistory}
              className="font-ui text-xs"
              title="Save to History"
            >
              Save
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 relative z-10">
        {/* Main Stats Grid - All Editable */}
        <div className="grid grid-cols-2 gap-3">
          {/* Weight */}
          <div className="p-3 rounded-xl bg-background/40 border border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-ui uppercase tracking-wide">Weight</span>
              {weightTrend && (
                <div className={`flex items-center gap-1 ${weightTrend.color}`}>
                  <weightTrend.icon className="w-3 h-3" />
                  <span className="text-[10px]">{weightTrend.label}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => adjustMetric('weight', -0.5)} className="h-7 w-7 p-0">
                <Minus className="w-3 h-3" />
              </Button>
              <div className="flex-1 flex items-baseline gap-1">
                <Input
                  type="number"
                  step="0.1"
                  value={metrics.weight}
                  onChange={(e) => handleDirectInput('weight', e.target.value)}
                  className="h-8 text-center font-game text-xl bg-transparent border-primary/30"
                />
                <span className="text-xs text-muted-foreground">kg</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => adjustMetric('weight', 0.5)} className="h-7 w-7 p-0">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Height */}
          <div className="p-3 rounded-xl bg-background/40 border border-secondary/20 backdrop-blur-sm hover:border-secondary/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-ui uppercase tracking-wide">Height</span>
              <Activity className="w-3 h-3 text-secondary" />
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => adjustMetric('height', -1)} className="h-7 w-7 p-0">
                <Minus className="w-3 h-3" />
              </Button>
              <div className="flex-1 flex items-baseline gap-1">
                <Input
                  type="number"
                  value={metrics.height}
                  onChange={(e) => handleDirectInput('height', e.target.value)}
                  className="h-8 text-center font-game text-xl bg-transparent border-secondary/30"
                />
                <span className="text-xs text-muted-foreground">cm</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => adjustMetric('height', 1)} className="h-7 w-7 p-0">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Body Fat */}
          <div className="p-3 rounded-xl bg-background/40 border border-gold/20 backdrop-blur-sm hover:border-gold/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-ui uppercase tracking-wide">Body Fat</span>
              <span className={`text-[10px] ${bodyFatCategory.color} font-medium`}>{bodyFatCategory.label}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => adjustMetric('bodyFat', -0.5)} className="h-7 w-7 p-0">
                <Minus className="w-3 h-3" />
              </Button>
              <div className="flex-1 flex items-baseline gap-1">
                <Input
                  type="number"
                  step="0.1"
                  value={metrics.bodyFat}
                  onChange={(e) => handleDirectInput('bodyFat', e.target.value)}
                  className="h-8 text-center font-game text-xl bg-transparent border-gold/30"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => adjustMetric('bodyFat', 0.5)} className="h-7 w-7 p-0">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <Progress value={Math.min(metrics.bodyFat * 2.5, 100)} className="h-1.5 mt-2 bg-gold/10" />
          </div>

          {/* Muscle Mass */}
          <div className="p-3 rounded-xl bg-background/40 border border-accent/20 backdrop-blur-sm hover:border-accent/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-ui uppercase tracking-wide">Muscle</span>
              <Flame className="w-3 h-3 text-accent" />
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => adjustMetric('muscleMass', -0.5)} className="h-7 w-7 p-0">
                <Minus className="w-3 h-3" />
              </Button>
              <div className="flex-1 flex items-baseline gap-1">
                <Input
                  type="number"
                  step="0.1"
                  value={metrics.muscleMass}
                  onChange={(e) => handleDirectInput('muscleMass', e.target.value)}
                  className="h-8 text-center font-game text-xl bg-transparent border-accent/30"
                />
                <span className="text-xs text-muted-foreground">kg</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => adjustMetric('muscleMass', 0.5)} className="h-7 w-7 p-0">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <Progress value={(metrics.muscleMass / metrics.weight) * 100} className="h-1.5 mt-2 bg-accent/10" />
          </div>
        </div>

        {/* BMI Card - Auto-calculated */}
        <div className={`p-4 rounded-xl ${bmiCategory.bg} border border-primary/20 backdrop-blur-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-ui uppercase tracking-wide">Body Mass Index</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-game text-3xl text-foreground">{metrics.bmi}</span>
                <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${bmiCategory.bg} ${bmiCategory.color} border`}>
                  {bmiCategory.label}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Auto-calculated from weight & height</p>
            </div>
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-4 border-primary/30 flex items-center justify-center bg-background/50">
                <Target className={`w-5 h-5 ${bmiCategory.color}`} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-primary" />
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Under</span>
              <span>Healthy</span>
              <span>Over</span>
            </div>
            <div className="h-2 rounded-full bg-gradient-to-r from-secondary/50 via-accent/50 to-destructive/50 relative overflow-hidden">
              <div 
                className="absolute top-0 w-1 h-full bg-foreground rounded-full shadow-lg transition-all"
                style={{ left: `${Math.min(Math.max((metrics.bmi - 15) / 20 * 100, 0), 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Body Water - Editable */}
        <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-ui uppercase tracking-wide">Body Water</span>
            <span className="text-[10px] text-muted-foreground">Optimal: 50-65%</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => adjustMetric('waterPercentage', -1)} className="h-7 w-7 p-0">
              <Minus className="w-3 h-3" />
            </Button>
            <div className="flex-1 flex items-center gap-2">
              <Input
                type="number"
                value={metrics.waterPercentage}
                onChange={(e) => handleDirectInput('waterPercentage', e.target.value)}
                className="w-16 h-8 text-center font-game text-lg bg-transparent border-secondary/30"
              />
              <span className="text-sm text-muted-foreground">%</span>
              <Progress value={metrics.waterPercentage} className="flex-1 h-3 bg-secondary/10" />
            </div>
            <Button size="sm" variant="ghost" onClick={() => adjustMetric('waterPercentage', 1)} className="h-7 w-7 p-0">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* History Info */}
        {history.metrics.length > 0 && (
          <div className="text-[10px] text-muted-foreground text-center">
            {history.metrics.length} entries saved • Last: {history.metrics[history.metrics.length - 1]?.date}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
