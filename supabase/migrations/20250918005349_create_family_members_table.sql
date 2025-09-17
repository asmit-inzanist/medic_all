-- Create family_members table
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    relationship TEXT NOT NULL,
    gender TEXT,
    blood_type TEXT,
    height TEXT,
    weight TEXT,
    phone TEXT,
    email TEXT,
    date_of_birth DATE,
    emergency_contact TEXT,
    
    -- Health Information (optional)
    allergies TEXT[],
    current_medications TEXT[],
    medical_conditions TEXT[],
    insurance_info TEXT,
    
    -- Document attachments
    documents JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own family members
CREATE POLICY "Users can view their own family members" ON public.family_members
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own family members" ON public.family_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own family members" ON public.family_members
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own family members" ON public.family_members
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_family_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_family_members_updated_at
    BEFORE UPDATE ON public.family_members
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_family_members_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX idx_family_members_created_at ON public.family_members(created_at);