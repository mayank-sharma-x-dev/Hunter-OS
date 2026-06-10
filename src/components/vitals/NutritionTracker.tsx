import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Utensils, Flame, Droplets, Wheat, Beef, Plus, Check, Minus,
  Apple, Fish, Egg, Milk, Leaf, Cookie, ChevronRight, Edit2, RotateCcw
} from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { format } from "date-fns";

interface NutritionData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  water: number;
}

interface FoodItem {
  id: string;
  name: string;
  icon: React.ElementType;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category: 'protein' | 'carbs' | 'dairy' | 'vegetable' | 'fruit' | 'snack';
}

const QUICK_FOODS: FoodItem[] = [
  { id: '1', name: 'Chicken Breast', icon: Beef, calories: 165, protein: 31, carbs: 0, fats: 3.6, category: 'protein' },
  { id: '2', name: 'Eggs (2)', icon: Egg, calories: 140, protein: 12, carbs: 1, fats: 10, category: 'protein' },
  { id: '3', name: 'Salmon', icon: Fish, calories: 208, protein: 20, carbs: 0, fats: 13, category: 'protein' },
  { id: '4', name: 'Greek Yogurt', icon: Milk, calories: 100, protein: 17, carbs: 6, fats: 0.7, category: 'dairy' },
  { id: '5', name: 'Brown Rice', icon: Wheat, calories: 216, protein: 5, carbs: 45, fats: 1.8, category: 'carbs' },
  { id: '6', name: 'Banana', icon: Apple, calories: 105, protein: 1.3, carbs: 27, fats: 0.4, category: 'fruit' },
  { id: '7', name: 'Spinach Salad', icon: Leaf, calories: 40, protein: 3, carbs: 4, fats: 0.5, category: 'vegetable' },
  { id: '8', name: 'Protein Shake', icon: Droplets, calories: 120, protein: 24, carbs: 3, fats: 1, category: 'protein' },
];

const DEFAULT_GOALS = {
  calories: 2200,
  protein: 150,
  carbs: 250,
  fats: 70,
  fiber: 30,
  water: 3,
};

export const NutritionTracker = () => {
  const [nutrition, setNutrition] = useState<NutritionData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    water: 0,
  });
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [addedFoods, setAddedFoods] = useState<string[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [editingGoals, setEditingGoals] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nutritionTracker');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === format(new Date(), 'yyyy-MM-dd')) {
        setNutrition(data);
        setAddedFoods(data.addedFoods || []);
      }
      if (data.goals) setGoals(data.goals);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nutritionTracker', JSON.stringify({
      ...nutrition,
      addedFoods,
      goals
    }));
  }, [nutrition, addedFoods, goals]);

  const addFood = (food: FoodItem) => {
    soundManager.playClick();
    setNutrition(prev => ({
      ...prev,
      calories: prev.calories + food.calories,
      protein: prev.protein + food.protein,
      carbs: prev.carbs + food.carbs,
      fats: prev.fats + food.fats,
    }));
    setAddedFoods(prev => [...prev, food.id]);
  };

  const adjustValue = (field: keyof NutritionData, amount: number) => {
    soundManager.playClick();
    setNutrition(prev => ({
      ...prev,
      [field]: Math.max(0, (prev[field] as number) + amount),
    }));
  };

  const handleDirectInput = (field: keyof NutritionData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setNutrition(prev => ({
      ...prev,
      [field]: Math.max(0, numValue),
    }));
  };

  const resetDay = () => {
    soundManager.playClick();
    setNutrition({
      date: format(new Date(), 'yyyy-MM-dd'),
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      water: 0,
    });
    setAddedFoods([]);
  };

  const getMacroPercentage = (current: number, goal: number) => Math.min((current / goal) * 100, 100);
  
  const getCalorieStatus = () => {
    const percent = (nutrition.calories / goals.calories) * 100;
    if (percent < 50) return { label: 'Undereating', color: 'text-secondary' };
    if (percent < 90) return { label: 'On Track', color: 'text-primary' };
    if (percent <= 110) return { label: 'Perfect', color: 'text-accent' };
    return { label: 'Excess', color: 'text-destructive' };
  };

  const calorieStatus = getCalorieStatus();

  return (
    <Card className="relative overflow-hidden border-gold/30 bg-gradient-to-br from-card/95 via-card/90 to-gold/5 backdrop-blur-xl shadow-2xl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-gold/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-accent/10 rounded-full blur-2xl animate-pulse-glow [animation-delay:1.5s]" />
      </div>

      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="font-game text-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-gold">
            <div className="p-2 rounded-lg bg-gold/20 border border-gold/30">
              <Utensils className="w-5 h-5" />
            </div>
            NUTRITION
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={resetDay}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              title="Reset Day"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                soundManager.playClick();
                setShowQuickAdd(!showQuickAdd);
              }}
              className="font-ui text-xs border-gold/30 text-gold hover:bg-gold/10"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {/* Calories - Editable */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-gold" />
              <span className="font-ui text-sm text-muted-foreground">Daily Calories</span>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${calorieStatus.color} bg-background/50`}>
              {calorieStatus.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => adjustValue('calories', -50)} className="h-8 w-8 p-0 border-gold/30">
              <Minus className="w-4 h-4" />
            </Button>
            <Input
              type="number"
              value={nutrition.calories}
              onChange={(e) => handleDirectInput('calories', e.target.value)}
              className="flex-1 h-10 text-center font-game text-2xl bg-background/30 border-gold/30"
            />
            <Button size="sm" variant="outline" onClick={() => adjustValue('calories', 50)} className="h-8 w-8 p-0 border-gold/30">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">Goal:</span>
            {editingGoals ? (
              <Input
                type="number"
                value={goals.calories}
                onChange={(e) => setGoals({ ...goals, calories: parseInt(e.target.value) || 0 })}
                className="w-20 h-6 text-center text-xs"
              />
            ) : (
              <button 
                onClick={() => setEditingGoals(true)}
                className="text-xs text-gold hover:underline"
              >
                {goals.calories} kcal
              </button>
            )}
          </div>
          <Progress 
            value={getMacroPercentage(nutrition.calories, goals.calories)} 
            className="h-2 mt-2 bg-gold/10" 
          />
        </div>

        {/* Macros Grid - All Editable */}
        <div className="grid grid-cols-3 gap-2">
          {/* Protein */}
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 backdrop-blur-sm group hover:border-destructive/40 transition-all">
            <div className="flex items-center gap-1 mb-1">
              <Beef className="w-3 h-3 text-destructive" />
              <span className="text-[10px] text-muted-foreground uppercase">Protein</span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => adjustValue('protein', -5)} className="h-6 w-6 p-0">
                <Minus className="w-3 h-3" />
              </Button>
              <Input
                type="number"
                value={nutrition.protein}
                onChange={(e) => handleDirectInput('protein', e.target.value)}
                className="h-7 text-center font-game text-sm bg-transparent border-destructive/30 px-1"
              />
              <Button size="sm" variant="ghost" onClick={() => adjustValue('protein', 5)} className="h-6 w-6 p-0">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <Progress value={getMacroPercentage(nutrition.protein, goals.protein)} className="h-1.5 mt-1 bg-destructive/10" />
            <span className="text-[9px] text-muted-foreground">/{goals.protein}g</span>
          </div>

          {/* Carbs */}
          <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 backdrop-blur-sm group hover:border-secondary/40 transition-all">
            <div className="flex items-center gap-1 mb-1">
              <Wheat className="w-3 h-3 text-secondary" />
              <span className="text-[10px] text-muted-foreground uppercase">Carbs</span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => adjustValue('carbs', -5)} className="h-6 w-6 p-0">
                <Minus className="w-3 h-3" />
              </Button>
              <Input
                type="number"
                value={nutrition.carbs}
                onChange={(e) => handleDirectInput('carbs', e.target.value)}
                className="h-7 text-center font-game text-sm bg-transparent border-secondary/30 px-1"
              />
              <Button size="sm" variant="ghost" onClick={() => adjustValue('carbs', 5)} className="h-6 w-6 p-0">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <Progress value={getMacroPercentage(nutrition.carbs, goals.carbs)} className="h-1.5 mt-1 bg-secondary/10" />
            <span className="text-[9px] text-muted-foreground">/{goals.carbs}g</span>
          </div>

          {/* Fats */}
          <div className="p-3 rounded-xl bg-gold/10 border border-gold/20 backdrop-blur-sm group hover:border-gold/40 transition-all">
            <div className="flex items-center gap-1 mb-1">
              <Cookie className="w-3 h-3 text-gold" />
              <span className="text-[10px] text-muted-foreground uppercase">Fats</span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => adjustValue('fats', -2)} className="h-6 w-6 p-0">
                <Minus className="w-3 h-3" />
              </Button>
              <Input
                type="number"
                value={Math.round(nutrition.fats)}
                onChange={(e) => handleDirectInput('fats', e.target.value)}
                className="h-7 text-center font-game text-sm bg-transparent border-gold/30 px-1"
              />
              <Button size="sm" variant="ghost" onClick={() => adjustValue('fats', 2)} className="h-6 w-6 p-0">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <Progress value={getMacroPercentage(nutrition.fats, goals.fats)} className="h-1.5 mt-1 bg-gold/10" />
            <span className="text-[9px] text-muted-foreground">/{goals.fats}g</span>
          </div>
        </div>

        {/* Water Intake - Editable */}
        <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-secondary" />
              <span className="text-xs text-muted-foreground font-ui">Hydration</span>
            </div>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                step="0.25"
                value={nutrition.water}
                onChange={(e) => handleDirectInput('water', e.target.value)}
                className="w-14 h-6 text-center font-game text-sm bg-transparent border-secondary/30"
              />
              <span className="text-xs text-muted-foreground">/ {goals.water}L</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => adjustValue('water', -0.25)} className="h-7 w-7 p-0 border-secondary/30">
              -
            </Button>
            <div className="flex-1 flex gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 h-4 rounded transition-all cursor-pointer hover:opacity-80 ${
                    i < nutrition.water * 4 ? 'bg-secondary shadow-sm shadow-secondary/50' : 'bg-secondary/20'
                  }`}
                  onClick={() => {
                    soundManager.playClick();
                    setNutrition(prev => ({ ...prev, water: (i + 1) / 4 }));
                  }}
                />
              ))}
            </div>
            <Button size="sm" variant="outline" onClick={() => adjustValue('water', 0.25)} className="h-7 w-7 p-0 border-secondary/30">
              +
            </Button>
          </div>
        </div>

        {/* Quick Add Foods */}
        {showQuickAdd && (
          <div className="space-y-2 animate-slide-up">
            <p className="text-xs text-muted-foreground font-ui">Quick Add Foods:</p>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {QUICK_FOODS.map((food) => (
                <Button
                  key={food.id}
                  variant="outline"
                  size="sm"
                  onClick={() => addFood(food)}
                  className="justify-between h-auto py-2 px-3 border-border/50 hover:border-primary/50 hover:bg-primary/5 group"
                >
                  <div className="flex items-center gap-2">
                    <food.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    <div className="text-left">
                      <p className="text-xs font-medium">{food.name}</p>
                      <p className="text-[10px] text-muted-foreground">{food.protein}g protein</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gold">{food.calories} kcal</p>
                    {addedFoods.filter(id => id === food.id).length > 0 && (
                      <span className="text-[9px] text-accent">×{addedFoods.filter(id => id === food.id).length}</span>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Edit Goals */}
        {editingGoals && (
          <div className="p-3 rounded-xl bg-background/40 border border-primary/20 space-y-2 animate-slide-up">
            <p className="text-xs font-medium text-foreground">Edit Daily Goals:</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-12">Protein:</span>
                <Input
                  type="number"
                  value={goals.protein}
                  onChange={(e) => setGoals({ ...goals, protein: parseInt(e.target.value) || 0 })}
                  className="h-7 text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-12">Carbs:</span>
                <Input
                  type="number"
                  value={goals.carbs}
                  onChange={(e) => setGoals({ ...goals, carbs: parseInt(e.target.value) || 0 })}
                  className="h-7 text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-12">Fats:</span>
                <Input
                  type="number"
                  value={goals.fats}
                  onChange={(e) => setGoals({ ...goals, fats: parseInt(e.target.value) || 0 })}
                  className="h-7 text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-12">Water:</span>
                <Input
                  type="number"
                  step="0.5"
                  value={goals.water}
                  onChange={(e) => setGoals({ ...goals, water: parseFloat(e.target.value) || 0 })}
                  className="h-7 text-xs"
                />
              </div>
            </div>
            <Button size="sm" onClick={() => setEditingGoals(false)} className="w-full h-7 text-xs">
              Done
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
