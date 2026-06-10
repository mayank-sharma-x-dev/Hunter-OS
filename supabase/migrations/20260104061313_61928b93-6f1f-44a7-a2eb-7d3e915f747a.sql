-- Create function to calculate role from level
CREATE OR REPLACE FUNCTION public.calculate_role_from_level(player_level integer)
RETURNS app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN CASE
    WHEN player_level >= 100 THEN 'shadow_monarch'::app_role
    WHEN player_level >= 50 THEN 'guild_master'::app_role
    WHEN player_level >= 25 THEN 'elite_hunter'::app_role
    ELSE 'hunter'::app_role
  END;
END;
$$;

-- Create function to upgrade user role based on level
CREATE OR REPLACE FUNCTION public.upgrade_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_role app_role;
  current_role app_role;
BEGIN
  -- Calculate the role based on new level
  new_role := public.calculate_role_from_level(NEW.level);
  
  -- Get current highest role
  SELECT role INTO current_role 
  FROM public.user_roles 
  WHERE user_id = NEW.user_id 
  ORDER BY 
    CASE role 
      WHEN 'shadow_monarch' THEN 4
      WHEN 'guild_master' THEN 3
      WHEN 'elite_hunter' THEN 2
      WHEN 'hunter' THEN 1
    END DESC
  LIMIT 1;
  
  -- If no role exists or new role is higher, insert/update
  IF current_role IS NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, new_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF new_role != current_role THEN
    -- Check if new role is higher
    IF (CASE new_role 
          WHEN 'shadow_monarch' THEN 4
          WHEN 'guild_master' THEN 3
          WHEN 'elite_hunter' THEN 2
          WHEN 'hunter' THEN 1
        END) > (CASE current_role 
          WHEN 'shadow_monarch' THEN 4
          WHEN 'guild_master' THEN 3
          WHEN 'elite_hunter' THEN 2
          WHEN 'hunter' THEN 1
        END) THEN
      -- Add new higher role
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.user_id, new_role)
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to upgrade role when level changes
DROP TRIGGER IF EXISTS on_player_level_change ON public.player_stats;
CREATE TRIGGER on_player_level_change
  AFTER UPDATE OF level ON public.player_stats
  FOR EACH ROW
  WHEN (NEW.level > OLD.level)
  EXECUTE FUNCTION public.upgrade_user_role();

-- Also run on insert to set initial role
DROP TRIGGER IF EXISTS on_player_stats_insert ON public.player_stats;
CREATE TRIGGER on_player_stats_insert
  AFTER INSERT ON public.player_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.upgrade_user_role();