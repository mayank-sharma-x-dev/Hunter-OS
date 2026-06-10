-- Fix PUBLIC_DATA_EXPOSURE: Restrict profiles to owner-only access
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);