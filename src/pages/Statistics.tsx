import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Target, Zap, Download, FileJson, FileSpreadsheet } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay, parseISO } from "date-fns";

const Statistics = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { tasks, completedTasks, loading: tasksLoading } = useTasks();
  const { stats, currentLevel, loading: statsLoading } = usePlayerStats();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Generate task completion data for last 7 days
  const getTaskCompletionData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, "MMM dd"),
        fullDate: startOfDay(date),
      };
    });

    return last7Days.map(({ date, fullDate }) => {
      const completedOnDay = (completedTasks || []).filter((task) => {
        if (!task.completed_at) return false;
        const taskDate = startOfDay(parseISO(task.completed_at));
        return taskDate.getTime() === fullDate.getTime();
      }).length;

      return {
        date,
        completed: completedOnDay,
      };
    });
  };

  // Generate level progression data
  const getLevelProgressionData = () => {
    const totalLevels = currentLevel;
    const dataPoints = Math.min(totalLevels, 10);

    if (dataPoints === 0) return [{ milestone: "Level 1", level: 1, exp: 0 }];

    return Array.from({ length: dataPoints }, (_, i) => {
      const level = Math.max(1, Math.floor((totalLevels / dataPoints) * (i + 1)));
      return {
        milestone: `Level ${level}`,
        level: level,
        exp: level * 20,
      };
    });
  };

  const taskData = getTaskCompletionData();
  const levelData = getLevelProgressionData();
  const totalTasksCompleted = completedTasks?.length || 0;
  const totalExp = stats?.total_exp || 0;
  const currentStreak = stats?.current_streak || 0;
  const longestStreak = stats?.longest_streak || 0;

  const handleBack = () => {
    soundManager.playClick();
    navigate("/dashboard");
  };

  const handleExportJSON = () => {
    soundManager.playClick();
    const exportData = {
      tasks: tasks || [],
      stats: stats,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hunter-stats-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    soundManager.playClick();
    const taskRows = (tasks || []).map((task) => ({
      type: "task",
      title: task.title,
      completed: task.is_completed,
      exp_reward: task.exp_reward,
      is_special: task.is_special,
      completed_at: task.completed_at || "",
      created_at: task.created_at,
    }));

    const headers = ["type", "title", "completed", "exp_reward", "is_special", "completed_at", "created_at"];
    const csvContent = [
      headers.join(","),
      ...taskRows.map((row) => headers.map((h) => `"${row[h as keyof typeof row] || ""}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hunter-stats-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authLoading && !user) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4 text-primary hover:text-primary/80"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary text-glow-primary mb-2 animate-fade-in">
              HUNTER STATISTICS
            </h1>
            <p className="text-muted-foreground">Your journey at a glance</p>
          </div>
          <div className="flex gap-2 animate-fade-in">
            <Button
              onClick={handleExportJSON}
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              <FileJson className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="border-secondary/30 text-secondary hover:bg-secondary/10"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-6 bg-card border-glow-primary animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Level</p>
              <p className="text-3xl font-bold text-primary">{currentLevel}</p>
            </div>
            <Zap className="w-10 h-10 text-primary glow-primary" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-glow-secondary animate-slide-up [animation-delay:100ms]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Quests</p>
              <p className="text-3xl font-bold text-secondary">{totalTasksCompleted}</p>
            </div>
            <Target className="w-10 h-10 text-secondary glow-secondary" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-glow-accent animate-slide-up [animation-delay:200ms]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total EXP</p>
              <p className="text-3xl font-bold text-accent">{totalExp}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-accent glow-accent" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-glow-gold animate-slide-up [animation-delay:300ms]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Best Streak</p>
              <p className="text-3xl font-bold text-gold">{longestStreak} days</p>
            </div>
            <Download className="w-10 h-10 text-gold glow-gold" />
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Chart */}
        <Card className="p-6 bg-card border-glow-secondary animate-fade-in">
          <h2 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Quest Completion (Last 7 Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="completed"
                fill="hsl(var(--secondary))"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Level Progression Chart */}
        <Card className="p-6 bg-card border-glow-primary animate-fade-in [animation-delay:100ms]">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Level Progression
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={levelData}>
              <defs>
                <linearGradient id="levelGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="milestone"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="level"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#levelGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Streak Progress */}
        <Card className="p-6 bg-card border-glow-gold animate-fade-in [animation-delay:200ms] lg:col-span-2">
          <h2 className="text-xl font-bold text-gold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Streak Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30">
              <p className="text-sm text-muted-foreground mb-2">Current Streak</p>
              <p className="text-5xl font-bold text-gold">{currentStreak}</p>
              <p className="text-sm text-muted-foreground mt-2">consecutive days</p>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30">
              <p className="text-sm text-muted-foreground mb-2">Longest Streak</p>
              <p className="text-5xl font-bold text-primary">{longestStreak}</p>
              <p className="text-sm text-muted-foreground mt-2">consecutive days</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 bg-card border-glow-accent mt-6 animate-fade-in [animation-delay:300ms]">
        <h2 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Recent Completed Quests
        </h2>
        <div className="space-y-3">
          {completedTasks?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No completed quests yet. Start your journey!
            </p>
          ) : (
            completedTasks?.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-lg bg-gradient-to-r from-accent/10 to-transparent border border-accent/30"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-accent-foreground">
                    {task.title}
                  </h3>
                  <span className="text-sm font-bold text-accent">
                    +{task.exp_reward} EXP
                  </span>
                </div>
                {task.completed_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Completed {format(parseISO(task.completed_at), "MMM dd, yyyy 'at' h:mm a")}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default Statistics;