-- Add missing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create video_calls table
CREATE TABLE IF NOT EXISTS public.video_calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  caller_email TEXT NOT NULL,
  receiver_email TEXT NOT NULL,
  caller_name TEXT,
  receiver_name TEXT,
  room_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'ringing' CHECK (status IN ('ringing', 'accepted', 'declined', 'ended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;

-- Create policies for video_calls
DROP POLICY IF EXISTS "Users can view their own video calls" ON public.video_calls;
DROP POLICY IF EXISTS "Users can create video calls" ON public.video_calls;
DROP POLICY IF EXISTS "Users can update their video calls" ON public.video_calls;

CREATE POLICY "Users can view their own video calls" 
ON public.video_calls 
FOR SELECT 
USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create video calls" 
ON public.video_calls 
FOR INSERT 
WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Users can update their video calls" 
ON public.video_calls 
FOR UPDATE 
USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_video_calls_caller_id ON public.video_calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_receiver_id ON public.video_calls(receiver_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_status ON public.video_calls(status);
CREATE INDEX IF NOT EXISTS idx_video_calls_room_id ON public.video_calls(room_id);

-- Update existing profiles to have names
UPDATE public.profiles 
SET name = COALESCE(name, email)
WHERE name IS NULL OR name = '';

-- Insert profiles for users without them (include user_id)
INSERT INTO public.profiles (id, user_id, email, name) 
SELECT 
  u.id, 
  u.id,
  u.email, 
  COALESCE(u.raw_user_meta_data->>'name', u.email)
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM public.profiles WHERE id IS NOT NULL)
ON CONFLICT (id) DO NOTHING;