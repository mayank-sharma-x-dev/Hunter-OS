import { useState, useCallback } from "react";
import { useTasks, Task, TaskCategory } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Star, Trash2, Swords, Sparkles, CheckCircle2, Circle, 
  Calendar, CalendarDays, Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { soundManager } from "@/lib/sounds";

const CATEGORY_CONFIG: Record<TaskCategory, { label: string; icon: typeof Calendar; color: string; exp: number }> = {
  daily: { label: 'Daily', icon: Calendar, color: 'primary', exp: 1 },
  weekly: { label: 'Weekly', icon: CalendarDays, color: 'secondary', exp: 3 },
  special: { label: 'Special', icon: Star, color: 'gold', exp: 5 },
};

export const QuestPanel = () => {
  const { tasks, addTask, toggleTask, deleteTask, pendingTasks, completedTasks, dailyTasks, weeklyTasks, specialCategoryTasks } = useTasks();
  const [newTask, setNewTask] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('daily');
  const [activeTab, setActiveTab] = useState<TaskCategory | 'all'>('all');

  const playHover = useCallback(() => {
    soundManager.playHover();
  }, []);

  const handleAddTask = () => {
    if (newTask.trim()) {
      soundManager.playClick();
      addTask(newTask, selectedCategory);
      setNewTask("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  const handleTabChange = (value: string) => {
    soundManager.playClick();
    setActiveTab(value as TaskCategory | 'all');
  };

  const getFilteredPendingTasks = () => {
    if (activeTab === 'all') return pendingTasks;
    return pendingTasks.filter(t => t.category === activeTab);
  };

  const getFilteredCompletedTasks = () => {
    if (activeTab === 'all') return completedTasks;
    return completedTasks.filter(t => t.category === activeTab);
  };

  const getCategoryCount = (category: TaskCategory) => {
    const categoryTasks = tasks.filter(t => t.category === category);
    const completed = categoryTasks.filter(t => t.is_completed).length;
    return `${completed}/${categoryTasks.length}`;
  };

  return (
    <div className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-primary/30 card-anime h-full">
      <div className="flex items-center gap-2 mb-4">
        <Swords className="w-5 h-5 text-primary" />
        <h2 className="font-game text-lg text-primary">QUESTS</h2>
        <span className="ml-auto text-xs text-muted-foreground font-ui">
          {completedTasks.length}/{tasks.length} Complete
        </span>
      </div>

      {/* Category Selector for New Tasks */}
      <div className="flex gap-1 mb-3">
          {(Object.keys(CATEGORY_CONFIG) as TaskCategory[]).map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            const Icon = config.icon;
            return (
              <Button
                key={cat}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedCategory(cat);
                }}
                onMouseEnter={playHover}
                variant="outline"
                size="sm"
                className={`flex-1 text-xs transition-all ${
                  selectedCategory === cat
                    ? `bg-${config.color}/20 border-${config.color} text-${config.color}`
                    : "border-muted text-muted-foreground"
                }`}
              >
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
                <span className="ml-1 opacity-70">+{config.exp}</span>
              </Button>
            );
          })}
      </div>

      {/* Add New Task */}
      <div className="flex gap-2 mb-4">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`New ${selectedCategory} quest...`}
          className="bg-background/50 border-primary/20 text-sm"
          maxLength={200}
        />
        <Button
          onClick={handleAddTask}
          onMouseEnter={playHover}
          size="icon"
          className="shrink-0 bg-primary hover:bg-primary/80"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Category Filter Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-3">
        <TabsList className="w-full grid grid-cols-4 h-8 bg-muted/50">
          <TabsTrigger value="all" onMouseEnter={playHover} className="text-xs data-[state=active]:bg-primary/20">
            All
          </TabsTrigger>
          <TabsTrigger value="daily" onMouseEnter={playHover} className="text-xs data-[state=active]:bg-primary/20">
            📅 {getCategoryCount('daily')}
          </TabsTrigger>
          <TabsTrigger value="weekly" onMouseEnter={playHover} className="text-xs data-[state=active]:bg-secondary/20">
            📆 {getCategoryCount('weekly')}
          </TabsTrigger>
          <TabsTrigger value="special" onMouseEnter={playHover} className="text-xs data-[state=active]:bg-gold/20">
            ⭐ {getCategoryCount('special')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <ScrollArea className="h-[280px] pr-2">
        {/* Pending Quests */}
        {getFilteredPendingTasks().length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2 font-ui">ACTIVE QUESTS</p>
            <div className="space-y-2">
              {getFilteredPendingTasks().map((task) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onToggle={toggleTask} 
                  onDelete={deleteTask}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Quests */}
        {getFilteredCompletedTasks().length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-ui">COMPLETED</p>
            <div className="space-y-2">
              {getFilteredCompletedTasks().slice(0, 10).map((task) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onToggle={toggleTask} 
                  onDelete={deleteTask}
                />
              ))}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Swords className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="font-ui text-sm">No quests yet. Add your first quest!</p>
          </div>
        )}

        {tasks.length > 0 && getFilteredPendingTasks().length === 0 && getFilteredCompletedTasks().length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-ui text-sm">No quests in this category</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskItem = ({ task, onToggle, onDelete }: TaskItemProps) => {
  const config = CATEGORY_CONFIG[task.category];
  const Icon = config.icon;
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !task.is_completed;

  const handleHover = () => {
    soundManager.playHover();
  };

  const handleToggle = () => {
    soundManager.playClick();
    onToggle(task.id);
  };

  return (
    <div
      className={`group flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:scale-[1.02] ${
        task.is_completed
          ? "bg-primary/5 border-primary/20 opacity-70"
          : isOverdue
          ? "bg-destructive/10 border-destructive/40"
          : task.category === 'special'
          ? "bg-gold/5 border-gold/30 hover:border-gold/50"
          : task.category === 'weekly'
          ? "bg-secondary/5 border-secondary/30 hover:border-secondary/50"
          : "bg-background/30 border-border/50 hover:border-primary/50"
      }`}
      onClick={handleToggle}
      onMouseEnter={handleHover}
    >
      <div className="shrink-0">
        {task.is_completed ? (
          <CheckCircle2 className="w-5 h-5 text-primary" />
        ) : (
          <Circle className={`w-5 h-5 ${
            task.category === 'special' ? "text-gold" : 
            task.category === 'weekly' ? "text-secondary" : 
            "text-muted-foreground"
          }`} />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`font-ui text-sm ${task.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
            task.category === 'special' 
              ? "bg-gold/20 text-gold" 
              : task.category === 'weekly'
              ? "bg-secondary/20 text-secondary"
              : "bg-primary/20 text-primary"
          }`}>
            <Icon className="w-2.5 h-2.5" />
            {config.label}
          </span>
          <span className="text-[10px] text-muted-foreground">+{task.exp_reward} EXP</span>
          {task.deadline && !task.is_completed && (
            <span className={`text-[10px] flex items-center gap-0.5 ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
              <Clock className="w-2.5 h-2.5" />
              {isOverdue ? "Overdue" : formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
      >
        <Trash2 className="w-3.5 h-3.5 text-destructive" />
      </Button>
    </div>
  );
};