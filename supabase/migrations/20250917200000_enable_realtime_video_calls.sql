-- Enable real-time for video_calls table
-- This allows real-time subscriptions to work for call notifications

-- Enable real-time on the video_calls table
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_calls;

-- Ensure the table is properly configured for real-time
-- Grant necessary permissions for real-time subscriptions
GRANT SELECT ON public.video_calls TO anon;
GRANT SELECT ON public.video_calls TO authenticated;

-- Create a function to notify on video call changes (optional, for debugging)
CREATE OR REPLACE FUNCTION notify_video_call_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the change for debugging
  RAISE NOTICE 'Video call change detected: % on table %', TG_OP, TG_TABLE_NAME;
  
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for debugging (optional)
CREATE TRIGGER video_call_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.video_calls
  FOR EACH ROW EXECUTE FUNCTION notify_video_call_change();