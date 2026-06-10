-- Add category and deadline columns to tasks table
ALTER TABLE public.tasks 
ADD COLUMN category TEXT NOT NULL DEFAULT 'daily' CHECK (category IN ('daily', 'weekly', 'special')),
ADD COLUMN deadline TIMESTAMP WITH TIME ZONE;

-- Update exp_reward defaults based on category (will be handled in app logic)
-- daily = 1 EXP, weekly = 3 EXP, special = 5 EXP

-- Create index for faster category filtering
CREATE INDEX idx_tasks_category ON public.tasks(category);
CREATE INDEX idx_tasks_deadline ON public.tasks(deadline);