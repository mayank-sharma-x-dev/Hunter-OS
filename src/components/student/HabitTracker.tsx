import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Sparkles, Plus, Check, Flame, Dumbbell, BookOpen, 
  Moon, Droplets, Apple, Brain, Target, X
} from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { format, startOfDay, differenceInDays } from "date-fns";

interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  streak: number;
  lastCompleted: string | null;
  completedToday: boolean;
}

const ICONS: { [key: string]: React.ReactNode } = {
  dumbbell: <Dumbbell className="w-4 h-4" />,
  book: <BookOpen className="w-4 h-4" />,
  moon: <Moon className="w-4 h-4" />,
  droplets: <Droplets className="w-4 h-4" />,
  apple: <Apple className="w-4 h-4" />,
  brain: <Brain className="w-4 h-4" />,
  target: <Target className="w-4 h-4" />,
  sparkles: <Sparkles className="w-4 h-4" />,
};

const COLORS = ['primary', 'secondary', 'accent', 'gold', 'destructive'];

interface HabitTrackerProps {
  onHabitComplete?: () => void;
}

export const HabitTracker = ({ onHabitComplete }: HabitTrackerProps) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("sparkles");
  const [selectedColor, setSelectedColor] = useState("primary");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('habitTracker');
    if (saved) {
      const data = JSON.parse(saved);
      const today = startOfDay(new Date());
      
      // Reset completedToday for habits not completed today
      const updatedHabits = data.map((habit: Habit) => {
        if (habit.lastCompleted) {
          const lastDate = startOfDay(new Date(habit.lastCompleted));
          const daysDiff = differenceInDays(today, lastDate);
          
          if (daysDiff === 0) {
            return habit;
          } else if (daysDiff === 1) {
            return { ...habit, completedToday: false };
          } else {
            return { ...habit, completedToday: false, streak: 0 };
          }
        }
        return habit;
      });
      
      setHabits(updatedHabits);
    } else {
      // Default habits
      setHabits([
        { id: '1', name: 'Exercise', icon: 'dumbbell', color: 'destructive', streak: 0, lastCompleted: null, completedToday: false },
        { id: '2', name: 'Read', icon: 'book', color: 'secondary', streak: 0, lastCompleted: null, completedToday: false },
        { id: '3', name: 'Meditate', icon: 'brain', color: 'accent', streak: 0, lastCompleted: null, completedToday: false },
        { id: '4', name: 'Hydrate', icon: 'droplets', color: 'primary', streak: 0, lastCompleted: null, completedToday: false },
      ]);
    }
  }, []);

  useEffect(() => {
    if (habits.length > 0) {
      localStorage.setItem('habitTracker', JSON.stringify(habits));
    }
  }, [habits]);

  const toggleHabit = (habitId: string) => {
    soundManager.playTaskComplete();
    const today = format(new Date(), 'yyyy-MM-dd');
    
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        if (habit.completedToday) {
          // Undo completion
          return {
            ...habit,
            completedToday: false,
            streak: Math.max(0, habit.streak - 1),
            lastCompleted: null,
          };
        } else {
          // Complete
          onHabitComplete?.();
          return {
            ...habit,
            completedToday: true,
            streak: habit.streak + 1,
            lastCompleted: today,
          };
        }
      }
      return habit;
    }));
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    
    soundManager.playClick();
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      icon: selectedIcon,
      color: selectedColor,
      streak: 0,
      lastCompleted: null,
      completedToday: false,
    };
    
    setHabits([...habits, newHabit]);
    setNewHabitName("");
    setDialogOpen(false);
  };

  const deleteHabit = (habitId: string) => {
    soundManager.playClick();
    setHabits(habits.filter(h => h.id !== habitId));
  };

  const completedCount = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;

  return (
    <Card className="card-anime border-accent/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-game text-lg flex items-center gap-2 text-accent">
            <Sparkles className="w-5 h-5 text-accent" />
            DAILY RITUALS
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-accent hover:bg-accent/10">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-accent/30">
              <DialogHeader>
                <DialogTitle className="font-game text-accent">New Ritual</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Habit name..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="font-ui bg-muted/30 border-accent/30"
                />
                <div>
                  <p className="text-sm text-muted-foreground mb-2 font-ui">Icon</p>
                  <div className="flex gap-2 flex-wrap">
                    {Object.keys(ICONS).map((icon) => (
                      <Button
                        key={icon}
                        size="sm"
                        variant={selectedIcon === icon ? 'default' : 'outline'}
                        onClick={() => setSelectedIcon(icon)}
                        className={selectedIcon === icon ? 'bg-accent' : 'border-accent/30'}
                      >
                        {ICONS[icon]}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2 font-ui">Color</p>
                  <div className="flex gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full bg-${color} border-2 transition-all ${
                          selectedColor === color ? 'border-foreground scale-110' : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={addHabit} className="w-full bg-accent hover:bg-accent/90">
                  Add Ritual
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress */}
        <div className="flex items-center justify-between text-sm font-ui">
          <span className="text-muted-foreground">Daily Progress</span>
          <span className="text-accent font-bold">{completedCount}/{totalHabits}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0}%` }}
          />
        </div>

        {/* Habits List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer group ${
                habit.completedToday 
                  ? `bg-${habit.color}/20 border-${habit.color}/40` 
                  : 'bg-muted/20 border-border hover:border-' + habit.color + '/40'
              }`}
              onClick={() => toggleHabit(habit.id)}
            >
              <div className={`p-2 rounded-lg bg-${habit.color}/20 text-${habit.color}`}>
                {ICONS[habit.icon]}
              </div>
              <div className="flex-1">
                <p className={`font-ui font-medium ${habit.completedToday ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {habit.name}
                </p>
                {habit.streak > 0 && (
                  <div className="flex items-center gap-1 text-xs text-destructive">
                    <Flame className="w-3 h-3" />
                    <span>{habit.streak} day streak</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {habit.completedToday && (
                  <Check className={`w-5 h-5 text-${habit.color}`} />
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteHabit(habit.id);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {habits.length === 0 && (
          <div className="text-center py-8 text-muted-foreground font-ui">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No rituals yet. Add your first daily habit!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
