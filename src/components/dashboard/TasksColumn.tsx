import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Swords, Trash2, Undo2, CheckCircle2, Circle } from "lucide-react";
import { Task } from "@/pages/Dashboard";
import { soundManager } from "@/lib/sounds";

interface TasksColumnProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  onToggleTask: (taskId: string) => void;
}

export const TasksColumn = ({
  tasks,
  setTasks,
  onToggleTask,
}: TasksColumnProps) => {
  const [newTask, setNewTask] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const addTask = () => {
    if (newTask.trim()) {
      soundManager.playClick();
      const task: Task = {
        id: Date.now().toString(),
        text: newTask,
        completed: false,
        date: selectedDate || new Date(),
      };
      setTasks([...tasks, task]);
      setNewTask("");
    }
  };

  const deleteTask = (taskId: string) => {
    soundManager.playClick();
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const todayTasks = tasks.filter(
    (task) =>
      new Date(task.date).toDateString() === new Date().toDateString()
  );

  const completedCount = todayTasks.filter(t => t.completed).length;

  return (
    <Card className="p-6 bg-card border-secondary/40 animate-slide-up hover:border-secondary/60 transition-all card-anime">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Swords className="w-7 h-7 text-secondary animate-glow" />
            <div className="absolute -inset-1 bg-secondary/20 rounded-full blur-md -z-10" />
          </div>
          <div>
            <h2 className="font-game text-xl font-bold text-secondary text-glow-secondary tracking-wide">
              DAILY QUESTS
            </h2>
            <p className="font-ui text-xs text-muted-foreground">
              {completedCount}/{todayTasks.length} completed
            </p>
          </div>
        </div>
        <span className="font-game text-xs px-2 py-1 rounded bg-secondary/20 text-secondary border border-secondary/30">
          +1 EXP
        </span>
      </div>

      {/* Add Task */}
      <div className="flex gap-2 mb-4">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTask()}
          placeholder="New quest..."
          className="font-ui bg-muted/50 border-secondary/30 focus:border-secondary focus:ring-secondary/30 transition-all placeholder:text-muted-foreground/50"
        />
        <Button
          onClick={addTask}
          size="icon"
          className="bg-secondary hover:bg-secondary/80 glow-secondary transition-all hover:scale-110 power-surge"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Task List */}
      <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-1">
        {todayTasks.map((task, index) => (
          <div
            key={task.id}
            className={`quest-item flex items-center gap-3 p-3 rounded-lg border transition-all ${
              task.completed
                ? "bg-muted/30 border-muted-foreground/20"
                : "bg-gradient-secondary border-secondary/30 hover:border-secondary/50"
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <button
              onClick={() => onToggleTask(task.id)}
              className="flex-shrink-0 transition-all hover:scale-110"
            >
              {task.completed ? (
                <CheckCircle2 className="w-6 h-6 text-secondary glow-secondary" />
              ) : (
                <Circle className="w-6 h-6 text-secondary/50 hover:text-secondary transition-colors" />
              )}
            </button>
            <span
              className={`flex-1 font-ui transition-all ${
                task.completed
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {task.text}
            </span>
            {task.completed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleTask(task.id)}
                className="h-8 w-8 text-muted-foreground hover:text-secondary hover:bg-secondary/10 transition-all"
                title="Undo completion (-1 EXP)"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteTask(task.id)}
              className="h-8 w-8 text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-all hover:scale-110"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {todayTasks.length === 0 && (
          <div className="text-center py-8 animate-fade-in">
            <Swords className="w-12 h-12 text-secondary/30 mx-auto mb-3" />
            <p className="font-ui text-muted-foreground">
              No quests for today.
            </p>
            <p className="font-ui text-sm text-muted-foreground/70">
              Add your first quest above!
            </p>
          </div>
        )}
      </div>

      {/* Mini Calendar */}
      <div className="border-t border-secondary/20 pt-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-lg border border-secondary/30 p-3 font-ui"
        />
      </div>
    </Card>
  );
};