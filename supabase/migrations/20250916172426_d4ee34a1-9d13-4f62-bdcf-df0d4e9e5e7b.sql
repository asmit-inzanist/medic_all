-- Create video_calls table for managing video call sessions
CREATE TABLE public.video_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  caller_email TEXT NOT NULL,
  receiver_email TEXT NOT NULL,
  caller_name TEXT,
  receiver_name TEXT,
  room_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'ringing' CHECK (status IN ('ringing', 'accepted', 'declined', 'ended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view calls they are part of" 
ON public.video_calls 
FOR SELECT 
USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create calls as caller" 
ON public.video_calls 
FOR INSERT 
WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Users can update calls they are part of" 
ON public.video_calls 
FOR UPDATE 
USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_video_calls_updated_at
BEFORE UPDATE ON public.video_calls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_calls;