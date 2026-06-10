-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_key VARCHAR(50) NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_key)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for achievements
CREATE POLICY "Users can view their own achievements"
ON public.achievements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
ON public.achievements FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to initialize user role on signup (fix missing roles)
CREATE OR REPLACE FUNCTION public.ensure_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'hunter')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to ensure role exists when profile is created
DROP TRIGGER IF EXISTS on_profile_created_ensure_role ON public.profiles;
CREATE TRIGGER on_profile_created_ensure_role
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.ensure_user_role();

-- Insert missing roles for existing users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'hunter'::public.app_role
FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT (user_id, role) DO NOTHING;

-- Function to unlock an achievement
CREATE OR REPLACE FUNCTION public.unlock_achievement(p_user_id UUID, p_achievement_key VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.achievements (user_id, achievement_key)
  VALUES (p_user_id, p_achievement_key)
  ON CONFLICT (user_id, achievement_key) DO NOTHING;
  RETURN TRUE;
END;
$$;

-- Function to get user achievements
CREATE OR REPLACE FUNCTION public.get_user_achievements(p_user_id UUID)
RETURNS TABLE(achievement_key VARCHAR, unlocked_at TIMESTAMP WITH TIME ZONE)
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT achievement_key, unlocked_at
  FROM public.achievements
  WHERE user_id = p_user_id;
$$;