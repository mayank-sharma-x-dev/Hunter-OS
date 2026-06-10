-- Create player_stats table to track level and EXP
CREATE TABLE public.player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  level INTEGER NOT NULL DEFAULT 1,
  current_exp INTEGER NOT NULL DEFAULT 0,
  total_exp INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_task_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  exp_reward INTEGER NOT NULL DEFAULT 1,
  is_special BOOLEAN NOT NULL DEFAULT false,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for player_stats
CREATE POLICY "Users can view own stats" ON public.player_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON public.player_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON public.player_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for tasks
CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Function to calculate rank based on level
CREATE OR REPLACE FUNCTION public.calculate_rank(player_level INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN CASE
    WHEN player_level >= 251 THEN 'S-RANK'
    WHEN player_level >= 201 THEN 'A-RANK'
    WHEN player_level >= 151 THEN 'B-RANK'
    WHEN player_level >= 101 THEN 'C-RANK'
    WHEN player_level >= 51 THEN 'D-RANK'
    ELSE 'E-RANK'
  END;
END;
$$;

-- Function to calculate level from total EXP (20 EXP per level)
CREATE OR REPLACE FUNCTION public.calculate_level(total_exp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN GREATEST(1, (total_exp / 20) + 1);
END;
$$;

-- Function to update player stats when task is completed/uncompleted
CREATE OR REPLACE FUNCTION public.update_player_stats_on_task()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  exp_change INTEGER;
  new_total_exp INTEGER;
  new_level INTEGER;
  new_rank TEXT;
BEGIN
  -- Calculate EXP change
  IF NEW.is_completed AND (OLD.is_completed IS NULL OR NOT OLD.is_completed) THEN
    -- Task was just completed - add EXP
    exp_change := NEW.exp_reward;
    NEW.completed_at := now();
  ELSIF NOT NEW.is_completed AND OLD.is_completed THEN
    -- Task was uncompleted - remove EXP
    exp_change := -OLD.exp_reward;
    NEW.completed_at := NULL;
  ELSE
    RETURN NEW;
  END IF;

  -- Update player stats
  UPDATE public.player_stats
  SET 
    total_exp = GREATEST(0, total_exp + exp_change),
    current_exp = CASE 
      WHEN exp_change > 0 THEN MOD(GREATEST(0, total_exp + exp_change), 20)
      ELSE MOD(GREATEST(0, total_exp + exp_change), 20)
    END,
    level = public.calculate_level(GREATEST(0, total_exp + exp_change)),
    updated_at = now()
  WHERE user_id = NEW.user_id;

  -- Update profile rank
  SELECT public.calculate_level(GREATEST(0, total_exp + exp_change)) INTO new_level
  FROM public.player_stats WHERE user_id = NEW.user_id;
  
  new_rank := public.calculate_rank(COALESCE(new_level, 1));
  
  UPDATE public.profiles
  SET rank = new_rank, updated_at = now()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Trigger for task completion changes
CREATE TRIGGER on_task_completion_change
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_player_stats_on_task();

-- Function to create player stats when user signs up
CREATE OR REPLACE FUNCTION public.create_player_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.player_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create player stats after profile is created
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_player_stats();

-- Update timestamps trigger for tasks
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update timestamps trigger for player_stats
CREATE TRIGGER update_player_stats_updated_at
  BEFORE UPDATE ON public.player_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();