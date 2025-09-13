-- Add additional health information fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN blood_type TEXT,
ADD COLUMN height TEXT,
ADD COLUMN weight TEXT,
ADD COLUMN insurance_info TEXT;
