import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Plus, Sprout, Target, TreePine, Leaf, Mountain } from "lucide-react";
import { Goal } from "@/pages/Dashboard";
import { soundManager } from "@/lib/sounds";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GoalsColumnProps {
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
}

export const GoalsColumn = ({ goals, setGoals }: GoalsColumnProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "short" as "short" | "long",
  });

  const addGoal = () => {
    if (newGoal.title.trim()) {
      const goal: Goal = {
        id: Date.now().toString(),
        title: newGoal.title,
        description: newGoal.description,
        progress: 0,
        category: newGoal.category,
        color: newGoal.category === "short" ? "accent" : "accent",
      };
      setGoals([...goals, goal]);
      setNewGoal({ title: "", description: "", category: "short" });
      setIsDialogOpen(false);
      soundManager.playClick();
    }
  };

  const updateProgress = (goalId: string, progress: number) => {
    const oldGoal = goals.find((g) => g.id === goalId);
    const newProgress = progress;
    
    if (oldGoal && newProgress > oldGoal.progress) {
      soundManager.playGoalProgress();
    }
    
    setGoals(
      goals.map((goal) => (goal.id === goalId ? { ...goal, progress } : goal))
    );
  };

  const deleteGoal = (goalId: string) => {
    soundManager.playClick();
    setGoals(goals.filter((goal) => goal.id !== goalId));
  };

  const getProgressIcon = (progress: number) => {
    if (progress >= 100) return <TreePine className="w-4 h-4 text-accent" />;
    if (progress >= 50) return <Sprout className="w-4 h-4 text-accent" />;
    return <Leaf className="w-4 h-4 text-accent/60" />;
  };

  return (
    <Card className="p-6 bg-card border-accent/40 animate-slide-up [animation-delay:100ms] card-anime">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Mountain className="w-7 h-7 text-accent" />
          <div className="absolute -inset-1 bg-accent/20 rounded-full blur-md -z-10" />
        </div>
        <div>
          <h2 className="font-game text-xl font-bold text-accent text-glow-accent tracking-wide">
            SKILL TREE
          </h2>
          <p className="font-ui text-xs text-muted-foreground">
            {goals.filter(g => g.progress >= 100).length}/{goals.length} mastered
          </p>
        </div>
      </div>

      {/* Add Goal Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full mb-4 font-ui bg-accent hover:bg-accent/80 glow-accent group">
            <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
            New Skill
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-accent/40 card-anime">
          <DialogHeader>
            <DialogTitle className="font-game text-accent text-glow-accent">UNLOCK NEW SKILL</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="font-ui">Skill Name</Label>
              <Input
                value={newGoal.title}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, title: e.target.value })
                }
                placeholder="e.g., Learn Japanese"
                className="font-ui bg-muted/50 border-accent/30 focus:border-accent"
              />
            </div>
            <div>
              <Label className="font-ui">Description</Label>
              <Textarea
                value={newGoal.description}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, description: e.target.value })
                }
                placeholder="Describe your skill goal..."
                className="font-ui bg-muted/50 border-accent/30 focus:border-accent"
              />
            </div>
            <div>
              <Label className="font-ui">Difficulty</Label>
              <Select
                value={newGoal.category}
                onValueChange={(value: "short" | "long") =>
                  setNewGoal({ ...newGoal, category: value })
                }
              >
                <SelectTrigger className="font-ui bg-muted/50 border-accent/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">⚡ Quick Skill (Short-term)</SelectItem>
                  <SelectItem value="long">🏔️ Epic Skill (Long-term)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={addGoal}
              className="w-full font-ui bg-accent hover:bg-accent/80 glow-accent"
            >
              Unlock Skill
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goals List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        {goals.map((goal, index) => (
          <div
            key={goal.id}
            className="quest-item p-4 rounded-lg bg-gradient-accent border border-accent/30 space-y-3 group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-ui font-semibold text-foreground flex items-center gap-2">
                  {getProgressIcon(goal.progress)}
                  {goal.title}
                  {goal.progress >= 100 && (
                    <span className="font-game text-xs px-2 py-0.5 rounded bg-accent/20 text-accent border border-accent/30 animate-glow-pulse">
                      MASTERED
                    </span>
                  )}
                </h3>
                {goal.description && (
                  <p className="font-ui text-sm text-muted-foreground mt-1">
                    {goal.description}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteGoal(goal.id)}
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive/50 hover:text-destructive hover:bg-destructive/10"
              >
                ×
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-ui">
                <span className="text-muted-foreground flex items-center gap-1">
                  {goal.category === "short" ? "⚡" : "🏔️"}
                  {goal.category === "short" ? "Quick" : "Epic"}
                </span>
                <span className={`font-game font-bold ${goal.progress >= 100 ? 'text-accent text-glow-accent' : 'text-foreground'}`}>
                  {goal.progress}%
                </span>
              </div>
              <div className="relative">
                <Progress value={goal.progress} className="h-3 bg-muted" />
                <div 
                  className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-accent to-accent/70 transition-all duration-500"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <Input
                type="range"
                min="0"
                max="100"
                value={goal.progress}
                onChange={(e) =>
                  updateProgress(goal.id, parseInt(e.target.value))
                }
                className="w-full h-2 cursor-pointer accent-accent"
              />
            </div>
          </div>
        ))}
        {goals.length === 0 && (
          <div className="text-center py-8 animate-fade-in">
            <Mountain className="w-12 h-12 text-accent/30 mx-auto mb-3" />
            <p className="font-ui text-muted-foreground">
              No skills yet.
            </p>
            <p className="font-ui text-sm text-muted-foreground/70">
              Start building your skill tree!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};