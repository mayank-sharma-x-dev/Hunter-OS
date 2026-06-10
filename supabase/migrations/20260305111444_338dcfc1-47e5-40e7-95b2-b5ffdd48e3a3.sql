
CREATE TABLE public.life_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  skill_category text NOT NULL,
  skill_key text NOT NULL,
  current_level integer NOT NULL DEFAULT 0,
  max_level integer NOT NULL DEFAULT 5,
  practice_log jsonb DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_key)
);

ALTER TABLE public.life_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own life skills" ON public.life_skills FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own life skills" ON public.life_skills FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own life skills" ON public.life_skills FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own life skills" ON public.life_skills FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.character_story (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'My Story',
  content text NOT NULL DEFAULT '',
  chapter integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.character_story ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own story" ON public.character_story FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own story" ON public.character_story FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own story" ON public.character_story FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own story" ON public.character_story FOR DELETE TO authenticated USING (auth.uid() = user_id);
