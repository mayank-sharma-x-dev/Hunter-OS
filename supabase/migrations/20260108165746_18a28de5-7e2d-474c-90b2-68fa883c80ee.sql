-- Create skill_trees table to store user's unlocked skills and spent points
CREATE TABLE public.skill_trees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_key VARCHAR(50) NOT NULL,
  skill_level INTEGER NOT NULL DEFAULT 1,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_key)
);

-- Enable RLS
ALTER TABLE public.skill_trees ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own skills"
ON public.skill_trees FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skills"
ON public.skill_trees FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills"
ON public.skill_trees FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills"
ON public.skill_trees FOR DELETE
USING (auth.uid() = user_id);

-- Add talent_points column to player_stats
ALTER TABLE public.player_stats 
ADD COLUMN IF NOT EXISTS available_talent_points INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_talent_points INTEGER NOT NULL DEFAULT 0;

-- Function to calculate talent points based on level (1 point every 5 levels)
CREATE OR REPLACE FUNCTION public.calculate_talent_points(player_level INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN FLOOR(player_level / 5);
END;
$$;

-- Trigger to update talent points when level changes
CREATE OR REPLACE FUNCTION public.update_talent_points_on_level()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total_points INTEGER;
  spent_points INTEGER;
BEGIN
  -- Calculate total talent points based on new level
  new_total_points := public.calculate_talent_points(NEW.level);
  
  -- Get spent points (sum of skill levels)
  SELECT COALESCE(SUM(skill_level), 0) INTO spent_points
  FROM public.skill_trees
  WHERE user_id = NEW.user_id;
  
  -- Update available and total talent points
  NEW.total_talent_points := new_total_points;
  NEW.available_talent_points := GREATEST(0, new_total_points - spent_points);
  
  RETURN NEW;
END;
$$;

-- Create trigger for talent points update
CREATE TRIGGER on_level_change_update_talent_points
  BEFORE UPDATE OF level ON public.player_stats
  FOR EACH ROW
  WHEN (OLD.level IS DISTINCT FROM NEW.level)
  EXECUTE FUNCTION public.update_talent_points_on_level();

-- Initialize talent points for existing users
UPDATE public.player_stats
SET 
  total_talent_points = public.calculate_talent_points(level),
  available_talent_points = public.calculate_talent_points(level);

-- Enable realtime for skill_trees
ALTER PUBLICATION supabase_realtime ADD TABLE public.skill_trees;