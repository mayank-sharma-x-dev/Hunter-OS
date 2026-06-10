import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { soundManager } from "@/lib/sounds";
import { useScreenEffects } from "./useScreenEffects";

const taskTitleSchema = z.string().min(1, "Task title is required").max(200, "Task title must be 200 characters or less").trim();

export type TaskCategory = 'daily' | 'weekly' | 'special';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  exp_reward: number;
  is_special: boolean;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  category: TaskCategory;
  deadline: string | null;
}

const CATEGORY_EXP: Record<TaskCategory, number> = {
  daily: 1,
  weekly: 3,
  special: 5,
};

export const useTasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { triggerTaskComplete } = useScreenEffects();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      setTasks((data || []) as Task[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("tasks_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTasks((prev) => [payload.new as Task, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setTasks((prev) =>
              prev.map((t) => (t.id === (payload.new as Task).id ? (payload.new as Task) : t))
            );
          } else if (payload.eventType === "DELETE") {
            setTasks((prev) => prev.filter((t) => t.id !== (payload.old as Task).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addTask = async (title: string, category: TaskCategory = 'daily') => {
    if (!user) return;

    // Validate input with zod
    const validationResult = taskTitleSchema.safeParse(title);
    if (!validationResult.success) {
      toast({
        title: "Invalid Quest Title",
        description: validationResult.error.errors[0]?.message || "Please enter a valid title",
        variant: "destructive",
      });
      return;
    }

    const validatedTitle = validationResult.data;
    const expReward = CATEGORY_EXP[category];
    const isSpecial = category === 'special';
    
    // Calculate deadline based on category
    let deadline: string | null = null;
    const now = new Date();
    if (category === 'daily') {
      deadline = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
    } else if (category === 'weekly') {
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
      endOfWeek.setHours(23, 59, 59);
      deadline = endOfWeek.toISOString();
    }

    const { error } = await supabase.from("tasks").insert({
      user_id: user.id,
      title: validatedTitle,
      exp_reward: expReward,
      is_special: isSpecial,
      category,
      deadline,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    } else {
      soundManager.playClick();
      const categoryLabels = { daily: '📅 Daily', weekly: '📆 Weekly', special: '⭐ Special' };
      toast({
        title: `${categoryLabels[category]} Quest Created!`,
        description: `+${expReward} EXP on completion`,
      });
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const wasCompleted = task.is_completed;
    const newCompleted = !wasCompleted;

    const { error } = await supabase
      .from("tasks")
      .update({ is_completed: newCompleted })
      .eq("id", taskId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    } else {
      if (newCompleted) {
        soundManager.playTaskComplete();
        triggerTaskComplete();
        toast({
          title: task.is_special ? "⭐ Special Quest Complete!" : "✅ Quest Complete!",
          description: `+${task.exp_reward} EXP earned!`,
        });
      } else {
        soundManager.playClick();
        toast({
          title: "↩️ Quest Undone",
          description: `-${task.exp_reward} EXP removed. The journey continues!`,
        });
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // If task was completed, it will lose EXP when deleted
    if (task.is_completed) {
      // First uncomplete to remove EXP
      await supabase
        .from("tasks")
        .update({ is_completed: false })
        .eq("id", taskId);
    }

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    } else {
      soundManager.playClick();
      toast({
        title: "🗑️ Quest Removed",
        description: "The quest has been abandoned.",
      });
    }
  };

  const completedTasks = tasks.filter((t) => t.is_completed);
  const pendingTasks = tasks.filter((t) => !t.is_completed);
  const specialTasks = tasks.filter((t) => t.is_special);
  const completedSpecialTasks = specialTasks.filter((t) => t.is_completed);
  
  // Category-based filtering
  const dailyTasks = tasks.filter((t) => t.category === 'daily');
  const weeklyTasks = tasks.filter((t) => t.category === 'weekly');
  const specialCategoryTasks = tasks.filter((t) => t.category === 'special');

  return {
    tasks,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    completedTasks,
    pendingTasks,
    specialTasks,
    completedSpecialTasks,
    dailyTasks,
    weeklyTasks,
    specialCategoryTasks,
    refetch: fetchTasks,
  };
};
