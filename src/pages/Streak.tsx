import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, Calendar, Plus, Check, X, Flame, TrendingUp
} from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { format, getDaysInMonth, startOfMonth, getDay } from "date-fns";
import DarkModeToggle from "@/components/DarkModeToggle";

interface RoutineTask {
  id: string;
  name: string;
  completedDates: string[];
}

const Streak = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [routineTasks, setRoutineTasks] = useState<RoutineTask[]>([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentDate] = useState(new Date());

  const currentMonth = format(currentDate, "MMMM yyyy");
  const daysInMonth = getDaysInMonth(currentDate);
  const today = format(currentDate, 'yyyy-MM-dd');
  const todayDay = currentDate.getDate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const saved = localStorage.getItem('streakTrackerData');
    if (saved) {
      setRoutineTasks(JSON.parse(saved));
    } else {
      setRoutineTasks([
        { id: '1', name: 'Morning Exercise', completedDates: [] },
        { id: '2', name: 'Study Session', completedDates: [] },
        { id: '3', name: 'Reading', completedDates: [] },
        { id: '4', name: 'Meditation', completedDates: [] },
        { id: '5', name: 'Healthy Eating', completedDates: [] },
      ]);
    }
  }, []);

  useEffect(() => {
    if (routineTasks.length > 0) {
      localStorage.setItem('streakTrackerData', JSON.stringify(routineTasks));
    }
  }, [routineTasks]);

  const days = Array.from({ length: Math.min(30, daysInMonth) }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum), 'yyyy-MM-dd');
    return {
      day: dayNum,
      date: dateStr,
      isToday: dayNum === todayDay,
      isPast: dayNum < todayDay,
    };
  });

  const toggleTaskForDate = (taskId: string, dateStr: string) => {
    soundManager.playClick();
    
    setRoutineTasks(tasks => tasks.map(task => {
      if (task.id === taskId) {
        const hasDate = task.completedDates.includes(dateStr);
        return {
          ...task,
          completedDates: hasDate
            ? task.completedDates.filter(d => d !== dateStr)
            : [...task.completedDates, dateStr],
        };
      }
      return task;
    }));
  };

  const addTask = () => {
    if (!newTaskName.trim()) return;
    
    soundManager.playClick();
    const newTask: RoutineTask = {
      id: Date.now().toString(),
      name: newTaskName,
      completedDates: [],
    };
    
    setRoutineTasks([...routineTasks, newTask]);
    setNewTaskName("");
    setDialogOpen(false);
  };

  const deleteTask = (taskId: string) => {
    soundManager.playClick();
    setRoutineTasks(routineTasks.filter(t => t.id !== taskId));
  };

  const getStreak = (task: RoutineTask) => {
    let streak = 0;
    for (let i = todayDay; i >= 1; i--) {
      const checkDate = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), i), 'yyyy-MM-dd');
      if (task.completedDates.includes(checkDate)) {
        streak++;
      } else if (i < todayDay) {
        break;
      }
    }
    return streak;
  };

  const getMonthlyCount = (task: RoutineTask) => {
    return task.completedDates.filter(d => d.startsWith(format(currentDate, 'yyyy-MM'))).length;
  };

  const handleBack = () => {
    soundManager.playClick();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 transition-colors duration-300">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <DarkModeToggle />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
              Daily Streak
            </h1>
            <p className="text-muted-foreground mt-1">Track your daily habits and build consistency</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">{currentMonth}</span>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Add New Routine</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <Input
                    placeholder="Enter task name..."
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    className="border-border bg-background focus:border-primary focus:ring-primary text-foreground"
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  />
                  <Button 
                    onClick={addTask} 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Add Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Header Row */}
              <div className="flex items-center border-b border-border bg-muted/50">
                <div className="w-48 shrink-0 px-4 py-3 border-r border-border">
                  <span className="text-sm font-medium text-muted-foreground">Routine</span>
                </div>
                <div className="flex-1 flex">
                  {days.map((day) => (
                    <div 
                      key={day.day}
                      className={`w-8 flex-shrink-0 py-3 text-center border-r border-border/50 last:border-r-0 ${
                        day.isToday ? 'bg-primary/10' : ''
                      }`}
                    >
                      <span className={`text-xs font-medium ${
                        day.isToday 
                          ? 'text-primary' 
                          : day.isPast 
                            ? 'text-muted-foreground/50' 
                            : 'text-muted-foreground'
                      }`}>
                        {day.day}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="w-20 shrink-0 px-3 py-3 text-center border-l border-border">
                  <span className="text-xs font-medium text-muted-foreground">Streak</span>
                </div>
                <div className="w-20 shrink-0 px-3 py-3 text-center border-l border-border">
                  <span className="text-xs font-medium text-muted-foreground">Done</span>
                </div>
              </div>

              {/* Task Rows */}
              {routineTasks.map((task, idx) => {
                const streak = getStreak(task);
                const monthlyCount = getMonthlyCount(task);
                
                return (
                  <div 
                    key={task.id} 
                    className={`flex items-center border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors group ${
                      idx % 2 === 0 ? 'bg-card' : 'bg-muted/20'
                    }`}
                  >
                    {/* Task Name */}
                    <div className="w-48 shrink-0 px-4 py-3 border-r border-border">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-foreground truncate" title={task.name}>
                          {task.name}
                        </span>
                      </div>
                    </div>
                    
                    {/* Day Cells */}
                    <div className="flex-1 flex">
                      {days.map((day) => {
                        const isCompleted = task.completedDates.includes(day.date);
                        
                        return (
                          <button
                            key={day.date}
                            onClick={() => toggleTaskForDate(task.id, day.date)}
                            className={`w-8 h-10 flex-shrink-0 flex items-center justify-center border-r border-border/50 last:border-r-0 transition-all ${
                              day.isToday ? 'bg-primary/5' : ''
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-primary border-primary'
                                : day.isToday
                                  ? 'border-primary/50 hover:border-primary bg-background'
                                  : 'border-muted-foreground/30 hover:border-muted-foreground/50 bg-background'
                            }`}>
                              {isCompleted && (
                                <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Streak */}
                    <div className="w-20 shrink-0 px-3 py-3 text-center border-l border-border">
                      {streak > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          <Flame className={`w-4 h-4 ${
                            streak >= 7 ? 'text-orange-500' : 'text-muted-foreground'
                          }`} />
                          <span className={`text-sm font-medium ${
                            streak >= 7 ? 'text-orange-500' : 'text-foreground'
                          }`}>
                            {streak}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                    
                    {/* Monthly Count */}
                    <div className="w-20 shrink-0 px-3 py-3 text-center border-l border-border">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-sm font-medium text-foreground">{monthlyCount}</span>
                        <span className="text-xs text-muted-foreground">/ {Math.min(30, daysInMonth)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {routineTasks.length === 0 && (
                <div className="py-16 text-center bg-card">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-foreground">No routines added yet</p>
                  <p className="text-muted-foreground text-sm">Click "Add Task" to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{routineTasks.length}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Routines</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {routineTasks.filter(t => t.completedDates.includes(today)).length}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Done Today</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {Math.max(...routineTasks.map(t => getStreak(t)), 0)}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Best Streak</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{todayDay}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Day of Month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Streak;
