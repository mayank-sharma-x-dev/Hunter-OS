import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Heart, Droplets, Moon, Zap, Plus, Minus, Dumbbell } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { format, isToday } from "date-fns";

interface HealthData {
  date: string;
  water: number; // glasses
  sleep: number; // hours
  energy: number; // 1-10
  exercise: number; // minutes
}

const WATER_GOAL = 8;
const SLEEP_GOAL = 8;
const EXERCISE_GOAL = 30;

export const HealthTracker = () => {
  const [health, setHealth] = useState<HealthData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    water: 0,
    sleep: 7,
    energy: 5,
    exercise: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem('healthTracker');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === format(new Date(), 'yyyy-MM-dd')) {
        setHealth(data);
      } else {
        // Reset for new day but keep sleep from last night
        setHealth({
          date: format(new Date(), 'yyyy-MM-dd'),
          water: 0,
          sleep: data.sleep || 7,
          energy: 5,
          exercise: 0,
        });
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('healthTracker', JSON.stringify(health));
  }, [health]);

  const adjustWater = (amount: number) => {
    soundManager.playClick();
    setHealth(prev => ({
      ...prev,
      water: Math.max(0, Math.min(12, prev.water + amount)),
    }));
  };

  const adjustExercise = (amount: number) => {
    soundManager.playClick();
    setHealth(prev => ({
      ...prev,
      exercise: Math.max(0, Math.min(180, prev.exercise + amount)),
    }));
  };

  const getHealthScore = () => {
    const waterScore = Math.min(health.water / WATER_GOAL, 1) * 25;
    const sleepScore = Math.min(health.sleep / SLEEP_GOAL, 1) * 25;
    const energyScore = (health.energy / 10) * 25;
    const exerciseScore = Math.min(health.exercise / EXERCISE_GOAL, 1) * 25;
    return Math.round(waterScore + sleepScore + energyScore + exerciseScore);
  };

  const healthScore = getHealthScore();

  const getScoreColor = () => {
    if (healthScore >= 80) return 'accent';
    if (healthScore >= 60) return 'gold';
    if (healthScore >= 40) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="card-anime border-destructive/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-game text-lg flex items-center gap-2 text-destructive">
          <Heart className="w-5 h-5 text-destructive" />
          VITALITY STATS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Score */}
        <div className={`p-4 rounded-lg bg-${getScoreColor()}/10 border border-${getScoreColor()}/30 text-center`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Heart className={`w-6 h-6 text-${getScoreColor()}`} />
            <span className={`font-game text-3xl text-${getScoreColor()} text-glow-${getScoreColor()}`}>
              {healthScore}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-ui">Vitality Score</p>
        </div>

        {/* Water Intake */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-secondary" />
              <span className="font-ui text-sm">Hydration</span>
            </div>
            <span className="font-game text-sm text-secondary">
              {health.water}/{WATER_GOAL} glasses
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => adjustWater(-1)}
              className="border-secondary/30 text-secondary"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary transition-all duration-300"
                style={{ width: `${(health.water / WATER_GOAL) * 100}%` }}
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => adjustWater(1)}
              className="border-secondary/30 text-secondary"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-1 justify-center">
            {Array.from({ length: WATER_GOAL }).map((_, i) => (
              <Droplets 
                key={i} 
                className={`w-4 h-4 transition-all ${
                  i < health.water ? 'text-secondary' : 'text-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Sleep */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-primary" />
              <span className="font-ui text-sm">Sleep</span>
            </div>
            <span className="font-game text-sm text-primary">
              {health.sleep}h
            </span>
          </div>
          <Slider
            value={[health.sleep]}
            onValueChange={([value]) => {
              soundManager.playClick();
              setHealth(prev => ({ ...prev, sleep: value }));
            }}
            min={0}
            max={12}
            step={0.5}
            className="[&>span:first-child]:bg-primary/20 [&_[role=slider]]:bg-primary"
          />
        </div>

        {/* Energy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gold" />
              <span className="font-ui text-sm">Energy Level</span>
            </div>
            <span className="font-game text-sm text-gold">
              {health.energy}/10
            </span>
          </div>
          <Slider
            value={[health.energy]}
            onValueChange={([value]) => {
              soundManager.playClick();
              setHealth(prev => ({ ...prev, energy: value }));
            }}
            min={1}
            max={10}
            step={1}
            className="[&>span:first-child]:bg-gold/20 [&_[role=slider]]:bg-gold"
          />
        </div>

        {/* Exercise */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-accent" />
              <span className="font-ui text-sm">Exercise</span>
            </div>
            <span className="font-game text-sm text-accent">
              {health.exercise} min
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => adjustExercise(-5)}
              className="border-accent/30 text-accent"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${Math.min((health.exercise / EXERCISE_GOAL) * 100, 100)}%` }}
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => adjustExercise(15)}
              className="border-accent/30 text-accent"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
