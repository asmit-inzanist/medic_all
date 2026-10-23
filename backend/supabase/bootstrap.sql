-- Medic-AL bootstrap for a new Supabase project
-- Run this once in your Supabase SQL Editor

-- ========== supabase/migrations/20250913144707_81ef1809-3a31-4863-9675-49773d3521b9.sql ==========
-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  emergency_contact TEXT,
  medical_conditions TEXT[],
  allergies TEXT[],
  current_medications TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ========== supabase/migrations/20250913144738_6bc65370-3e2b-42a1-8f60-2781d6d88514.sql ==========
-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix the update function as well
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ========== supabase/migrations/20250913151500_add_health_fields.sql ==========
-- Add additional health information fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN blood_type TEXT,
ADD COLUMN height TEXT,
ADD COLUMN weight TEXT,
ADD COLUMN insurance_info TEXT;

-- ========== supabase/migrations/20250914090612_bc056bdf-6d74-4fa1-8d69-b896ddc1238d.sql ==========
-- Create pharmacies table to store pharmacy locations and details
CREATE TABLE public.pharmacies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone TEXT,
  email TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  delivery_time TEXT DEFAULT '30 mins',
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medicines table to store medicine information
CREATE TABLE public.medicines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  generic_name TEXT,
  category TEXT NOT NULL,
  description TEXT,
  strength TEXT,
  form TEXT, -- tablet, capsule, syrup, etc.
  manufacturer TEXT,
  requires_prescription BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pharmacy_inventory table to store medicine availability and pricing
CREATE TABLE public.pharmacy_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(pharmacy_id, medicine_id)
);

-- Create indexes for better performance
CREATE INDEX idx_pharmacies_location ON public.pharmacies(latitude, longitude);
CREATE INDEX idx_pharmacy_inventory_pharmacy ON public.pharmacy_inventory(pharmacy_id);
CREATE INDEX idx_pharmacy_inventory_medicine ON public.pharmacy_inventory(medicine_id);
CREATE INDEX idx_medicines_category ON public.medicines(category);
CREATE INDEX idx_medicines_name ON public.medicines(name);

-- Enable RLS
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_inventory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - these are public data that everyone can read
CREATE POLICY "Pharmacies are publicly readable" 
ON public.pharmacies 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Medicines are publicly readable" 
ON public.medicines 
FOR SELECT 
USING (true);

CREATE POLICY "Inventory is publicly readable" 
ON public.pharmacy_inventory 
FOR SELECT 
USING (is_available = true);

-- Add triggers for updated_at
CREATE TRIGGER update_pharmacies_updated_at
BEFORE UPDATE ON public.pharmacies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medicines_updated_at
BEFORE UPDATE ON public.medicines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pharmacy_inventory_updated_at
BEFORE UPDATE ON public.pharmacy_inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for Kolkata area (based on user's location from network requests)
INSERT INTO public.pharmacies (name, address, latitude, longitude, phone, rating, total_reviews, delivery_time, is_verified, is_active) VALUES
('MedPlus Pharmacy', 'Kasai Bustee, Narkeldanga, Kolkata', 22.5771130, 88.3787323, '+91-9876543210', 4.8, 234, '20 mins', true, true),
('Apollo Pharmacy', 'Shyama Charan De Street, Kolkata', 22.5756, 88.3756, '+91-9876543211', 4.9, 456, '25 mins', true, true),
('Fortis Healthcare Pharmacy', 'VIP Road, Kolkata', 22.5790, 88.3820, '+91-9876543212', 4.7, 189, '35 mins', true, true),
('HealthBuddy Pharmacy', 'Salt Lake, Kolkata', 22.5820, 88.3850, '+91-9876543213', 4.6, 321, '40 mins', true, true),
('Wellness Forever', 'Park Street, Kolkata', 22.5726, 88.3639, '+91-9876543214', 4.5, 567, '45 mins', true, true);

-- Insert sample medicines
INSERT INTO public.medicines (name, brand, generic_name, category, strength, form, manufacturer, requires_prescription) VALUES
('Paracetamol', 'Crocin', 'Paracetamol', 'Pain Relief', '500mg', 'Tablet', 'GSK', false),
('Vitamin D3', 'D-Rise', 'Cholecalciferol', 'Vitamins', '1000 IU', 'Tablet', 'Sun Pharma', false),
('Amoxicillin', 'Amoxil', 'Amoxicillin', 'Antibiotics', '250mg', 'Capsule', 'GSK', true),
('Ibuprofen', 'Brufen', 'Ibuprofen', 'Pain Relief', '400mg', 'Tablet', 'Abbott', false),
('Omeprazole', 'Omez', 'Omeprazole', 'Gastro Health', '20mg', 'Capsule', 'Dr. Reddy', false),
('Metformin', 'Glycomet', 'Metformin', 'Diabetes', '500mg', 'Tablet', 'USV', true);

-- Insert sample inventory with varying prices and availability
INSERT INTO public.pharmacy_inventory (pharmacy_id, medicine_id, price, original_price, stock_quantity, is_available, expiry_date)
SELECT 
  p.id,
  m.id,
  CASE 
    WHEN m.name = 'Paracetamol' THEN 12.99 + (RANDOM() * 5)
    WHEN m.name = 'Vitamin D3' THEN 24.99 + (RANDOM() * 10)
    WHEN m.name = 'Amoxicillin' THEN 18.50 + (RANDOM() * 8)
    WHEN m.name = 'Ibuprofen' THEN 8.99 + (RANDOM() * 4)
    WHEN m.name = 'Omeprazole' THEN 15.99 + (RANDOM() * 6)
    ELSE 20.00 + (RANDOM() * 15)
  END as price,
  CASE 
    WHEN m.name = 'Paracetamol' THEN 15.99 + (RANDOM() * 5)
    WHEN m.name = 'Vitamin D3' THEN 29.99 + (RANDOM() * 10)
    WHEN m.name = 'Amoxicillin' THEN 22.00 + (RANDOM() * 8)
    WHEN m.name = 'Ibuprofen' THEN 10.99 + (RANDOM() * 4)
    WHEN m.name = 'Omeprazole' THEN 19.99 + (RANDOM() * 6)
    ELSE 25.00 + (RANDOM() * 15)
  END as original_price,
  FLOOR(RANDOM() * 100) + 10 as stock_quantity,
  CASE WHEN RANDOM() > 0.15 THEN true ELSE false END as is_available,
  CURRENT_DATE + INTERVAL '1 year' + (RANDOM() * INTERVAL '2 years') as expiry_date
FROM public.pharmacies p
CROSS JOIN public.medicines m
WHERE p.is_active = true;

-- ========== supabase/migrations/20250915130000_create_medical_documents.sql ==========
-- Create medical documents table
CREATE TABLE IF NOT EXISTS public.medical_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL, -- prescription, lab_report, medical_record, insurance, etc.
    file_path VARCHAR(500) NOT NULL, -- Supabase storage path
    file_url VARCHAR(500), -- Public URL if needed
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medical_documents_user_id ON public.medical_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_documents_type ON public.medical_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_medical_documents_active ON public.medical_documents(is_active);

-- Enable Row Level Security
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own documents" ON public.medical_documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON public.medical_documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON public.medical_documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON public.medical_documents
    FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for medical documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'medical-documents',
    'medical-documents',
    false, -- Private bucket
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their own medical documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'medical-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own medical documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'medical-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own medical documents" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'medical-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own medical documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'medical-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_medical_documents_updated_at
    BEFORE UPDATE ON public.medical_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========== supabase/migrations/20250916172426_d4ee34a1-9d13-4f62-bdcf-df0d4e9e5e7b.sql ==========
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

-- ========== supabase/migrations/20250917120000_setup_video_calls.sql ==========
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

-- ========== supabase/migrations/20250917180000_create_hospitals.sql ==========
-- Create hospitals table to store hospital information
CREATE TABLE public.hospitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  email TEXT,
  website TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  operating_hours TEXT,
  is_24_hours BOOLEAN DEFAULT false,
  specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
  insurance_accepted TEXT[] DEFAULT ARRAY[]::TEXT[],
  google_maps_url TEXT,
  image_url TEXT,
  beds_available INTEGER DEFAULT 0,
  total_beds INTEGER DEFAULT 0,
  average_wait_time TEXT,
  emergency_services BOOLEAN DEFAULT false,
  parking_available BOOLEAN DEFAULT false,
  wheelchair_accessible BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_hospitals_location ON public.hospitals(latitude, longitude);
CREATE INDEX idx_hospitals_type ON public.hospitals(type);
CREATE INDEX idx_hospitals_rating ON public.hospitals(rating DESC);
CREATE INDEX idx_hospitals_specialties ON public.hospitals USING GIN(specialties);
CREATE INDEX idx_hospitals_name ON public.hospitals(name);

-- Enable RLS
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - hospitals are public data that everyone can read
CREATE POLICY "Hospitals are publicly readable" 
ON public.hospitals 
FOR SELECT 
USING (is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_hospitals_updated_at
BEFORE UPDATE ON public.hospitals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample hospital data for Mumbai/Delhi/Kolkata areas
INSERT INTO public.hospitals (
  name, type, address, latitude, longitude, phone, rating, review_count, 
  operating_hours, is_24_hours, specialties, insurance_accepted, 
  google_maps_url, beds_available, total_beds, average_wait_time, 
  emergency_services, parking_available, wheelchair_accessible, is_verified, is_active
) VALUES 
-- Mumbai Hospitals
(
  'Sir H. N. Reliance Foundation Hospital',
  'Multi-Specialty Hospital',
  'Raja Ram Mohan Roy Road, Prarthana Samaj, Girgaon, Mumbai, Maharashtra 400004',
  18.9575, 72.8153,
  '+91-22-3098-6666',
  4.8, 2156,
  '24/7',
  true,
  ARRAY['Cardiology', 'Oncology', 'Neurology', 'Emergency', 'ICU', 'Transplant'],
  ARRAY['CGHS', 'ESIC', 'Mediclaim', 'Cashless', 'All Major Insurance'],
  'https://www.google.com/maps/place/Sir+H.+N.+Reliance+Foundation+Hospital/@18.9575,72.8153',
  45, 345,
  '15 mins',
  true, true, true, true, true
),
(
  'Kokilaben Dhirubhai Ambani Hospital',
  'Multi-Specialty Hospital', 
  'Rao Saheb Achutrao Patwardhan Marg, Four Bunglows, Andheri West, Mumbai, Maharashtra 400053',
  19.1136, 72.8697,
  '+91-22-4269-6969',
  4.7, 1834,
  '24/7',
  true,
  ARRAY['Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Emergency', 'Robotic Surgery'],
  ARRAY['All Major Insurance', 'Cashless', 'Mediclaim', 'International Insurance'],
  'https://www.google.com/maps/place/Kokilaben+Dhirubhai+Ambani+Hospital/@19.1136,72.8697',
  67, 750,
  '12 mins',
  true, true, true, true, true
),
(
  'Lilavati Hospital and Research Centre',
  'Multi-Specialty Hospital',
  'A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra 400050',
  19.0521, 72.8206,
  '+91-22-2675-1000',
  4.6, 1567,
  '24/7', 
  true,
  ARRAY['Cardiology', 'Neurosurgery', 'Orthopedics', 'Emergency', 'ICU', 'Trauma'],
  ARRAY['CGHS', 'ESIC', 'All Major Insurance', 'Cashless'],
  'https://www.google.com/maps/place/Lilavati+Hospital/@19.0521,72.8206',
  89, 323,
  '18 mins',
  true, true, true, true, true
),

-- Delhi Hospitals
(
  'All India Institute of Medical Sciences (AIIMS)',
  'Government Hospital',
  'Sri Aurobindo Marg, Ansari Nagar East, New Delhi, Delhi 110029',
  28.5672, 77.2100,
  '+91-11-2658-8500',
  4.9, 3245,
  '24/7',
  true,
  ARRAY['All Specialties', 'Emergency', 'Trauma', 'Research', 'Teaching'],
  ARRAY['CGHS', 'ESIC', 'Free Treatment', 'All Government Schemes'],
  'https://www.google.com/maps/place/AIIMS+New+Delhi/@28.5672,77.2100',
  156, 2478,
  '45 mins',
  true, true, true, true, true
),
(
  'Fortis Escorts Heart Institute',
  'Specialty Hospital',
  'Okhla Road, New Friends Colony, New Delhi, Delhi 110025', 
  28.5355, 77.2733,
  '+91-11-4713-5000',
  4.8, 2891,
  '24/7',
  true,
  ARRAY['Cardiology', 'Cardiac Surgery', 'Emergency', 'ICU'],
  ARRAY['All Major Insurance', 'Cashless', 'International Insurance'],
  'https://www.google.com/maps/place/Fortis+Escorts+Heart+Institute/@28.5355,77.2733',
  34, 310,
  '20 mins',
  true, true, true, true, true
),
(
  'Apollo Hospital Delhi',
  'Multi-Specialty Hospital',
  'Sarita Vihar, Mathura Road, New Delhi, Delhi 110076',
  28.5355, 77.2951,
  '+91-11-7179-1090',
  4.7, 2134,
  '24/7',
  true,
  ARRAY['Cardiology', 'Oncology', 'Neurology', 'Transplant', 'Emergency'],
  ARRAY['Apollo Insurance', 'All Major Insurance', 'Cashless', 'International'],
  'https://www.google.com/maps/place/Apollo+Hospital+Delhi/@28.5355,77.2951',
  78, 695,
  '25 mins',
  true, true, true, true, true
),

-- Kolkata Hospitals  
(
  'AMRI Hospital Dhakuria',
  'Multi-Specialty Hospital',
  '97, Andul Road, Chunavati, Panchpota, Howrah, West Bengal 711103',
  22.5193, 88.2847,
  '+91-33-6680-8000',
  4.6, 1456,
  '24/7',
  true,
  ARRAY['Cardiology', 'Neurology', 'Orthopedics', 'Emergency', 'ICU'],
  ARRAY['All Major Insurance', 'Mediclaim', 'Cashless'],
  'https://www.google.com/maps/place/AMRI+Hospital+Dhakuria/@22.5193,88.2847',
  45, 400,
  '22 mins',
  true, true, true, true, true
),
(
  'Apollo Gleneagles Hospital',
  'Multi-Specialty Hospital',
  '58, Canal Circular Road, Kadapara, Phool Bagan, Kolkata, West Bengal 700054',
  22.5568, 88.3711,
  '+91-33-2320-3040',
  4.7, 1789,
  '24/7',
  true,
  ARRAY['Cardiology', 'Oncology', 'Neurology', 'Transplant', 'Emergency'],
  ARRAY['Apollo Insurance', 'All Major Insurance', 'Cashless'],
  'https://www.google.com/maps/place/Apollo+Gleneagles+Hospital/@22.5568,88.3711',
  67, 675,
  '18 mins',
  true, true, true, true, true
),
(
  'Fortis Hospital Anandapur',
  'Multi-Specialty Hospital',
  '730, Anandapur, EM Bypass Rd, Anandapur, Kolkata, West Bengal 700107',
  22.5129, 88.3984,
  '+91-33-6628-4444',
  4.5, 1234,
  '24/7',
  true,
  ARRAY['Cardiology', 'Neurology', 'Orthopedics', 'Emergency'],
  ARRAY['All Major Insurance', 'Cashless', 'Mediclaim'],
  'https://www.google.com/maps/place/Fortis+Hospital+Anandapur/@22.5129,88.3984',
  23, 280,
  '30 mins',
  true, true, true, true, true
);

-- ========== supabase/migrations/20250918005349_create_family_members_table.sql ==========
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

-- ========== create_doctors_table.sql ==========
-- Create doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    area TEXT,
    clinic_name TEXT,
    fees INTEGER, -- Store fees as integer (removing ₹ symbol, 0 for free consultation)
    department TEXT,
    experience INTEGER, -- Years of experience
    contact_type TEXT, -- 'Contact Clinic' or 'Contact Hospital'
    image_url TEXT,
    description TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read doctors data
CREATE POLICY "Anyone can view doctors" ON public.doctors
    FOR SELECT USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_doctors_updated_at
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- Insert all doctors data from nabha1.csv
INSERT INTO public.doctors (name, area, clinic_name, fees, department, experience, contact_type, image_url, description, phone) VALUES
('Dr. Sukhjinder Singh Yogi', 'Patiala City', 'Yogi''s Ayurveda', 900, 'Ayurveda', 22, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-sukhjinder-singh-yogi-ayurveda-chandigarh-507f9a8c-1d0c-435a-b45b-e30ae633851e.jpg?i_type=t_70x70-3x-webp', 'Dr. Sukhjinder Singh Yogi Ayurveda in Patiala', '01141193968'),
('Dr. Onkar Hothi', 'Model Town', 'The Holistic Care Clinic', 400, 'General Practitioner', 0, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-onkar-hothi-general-practitioner-pune-98e1a148-24d8-4bc7-8c4b-93dfde9ca3bb.jpg?i_type=t_70x70-3x-webp', 'Dr. Onkar Hothi General Practitioner in Patiala', '01143078632'),
('Mr. Harish Chandra Behera', 'Patiala City', 'Indian Hearing Care & Research Centre', 500, 'Audiologist', 15, 'Contact Clinic', 'https://imagesx.practo.com/providers/mr-harish-chandra-behera-audiologist-patiala-2119e769-4381-4a24-b9db-9eacf8bb4b01.jpg?i_type=t_70x70-3x-webp', 'Mr. Harish Chandra Behera Audiologist in Patiala', '01140849699'),
('Dr. Manpreet Singh', 'Nabha', 'Maan Homoeopathic Clinic', 200, 'Homoeopath', 4, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-manpreet-singh-homoeopath-patiala-0943298a-4457-4573-b276-26577291cddf.jpg?i_type=t_70x70-3x-webp', 'Dr. Manpreet Singh Homoeopath in Patiala', '01140848439'),
('Dr. Rahul Bansal', 'Nabha', 'Bansal Hospital', 450, 'Psychiatrist', 5, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-rahul-bansal-addiction-psychiatrist-patiala-6ac621e4-bd71-46d0-b976-26e0a91e0ea3.jpg?i_type=t_70x70-3x-webp', 'Dr. Rahul Bansal Psychiatrist in Patiala', '01141193997'),
('Dr. Megha Garg', 'Nabha', 'Jiwan Nursing Home', 200, 'Gynecologist/Obstetrician', 9, 'Contact Clinic', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Megha Garg Gynecologist/Obstetrician in Patiala', '01140845976'),
('Dr. Arpit Garg', 'Nabha', 'Jiwan Nursing Home', 400, 'Endocrinologist', 13, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-arpit-garg-endocrinologist-patiala-e431b30a-241b-4ff4-b6bd-b5878dd9b248.jpg?i_type=t_70x70-3x-webp', 'Dr. Arpit Garg Endocrinologist in Patiala', '01140845976'),
('Dr. Binny Dhingra', 'Nabha', 'Kapoor Multi-Specialty Dental Care', 50, 'Dentist', 8, 'Contact Clinic', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Binny Dhingra Dentist in Patiala', '01161262036'),
('Dr. Akshit Sharma', 'Nabha', 'Nirvana Homoeo Clinic', 500, 'Homoeopath', 2, '', 'https://imagesx.practo.com/providers/dr-akshit-sharma-general-physician-patiala-7b788542-ad92-4b7b-8daa-755d8de2edbe.jpg?i_type=t_70x70-3x-webp', 'Dr. Akshit Sharma Homoeopath in Patiala', ''),
('Dr. Rav Sharan', 'Tripri', 'Gursharan Hospital', 200, 'General Physician', 16, 'Contact Hospital', 'https://imagesx.practo.com/providers/dr-rav-sharan-general-physician-patiala-269dbc17-56f6-498e-ad1e-1ebd8955ed16.jpg?i_type=t_70x70-3x-webp', 'Dr. Rav Sharan General Physician in Patiala', '01161260153'),
('Dr. N. S. Nagpal', 'Tripri', 'Dr. Nagpal''s Clinic', 200, 'Homoeopath', 20, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-n-s-nagpal-homoeopath-patiala-978085f6-51c4-4dc8-b7ae-79ae919ed4cf.jpg?i_type=t_70x70-3x-webp', 'Dr. N. S. Nagpal Homoeopath in Patiala', '01140036794'),
('Dr. Sandeep Cheema Sohi', 'Patiala City', 'Cheema Infertility Clinic', 500, 'Infertility Specialist', 18, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-sandeep-cheema-sohi-infertility-specialist-chandigarh-282f2419-a82c-425a-89bb-fb0cb44a70ef.jpg?i_type=t_70x70-3x-webp', 'Dr. Sandeep Cheema Sohi Infertility Specialist in Patiala', '01161191001'),
('Dr. Kuldeep Singh', 'Urban Estate', 'Dental And Physiotherapy Clinic', 200, 'Dentist', 18, 'Contact Clinic', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Kuldeep Singh Dentist in Patiala', '01141169672'),
('Dr. Yogesh Arora', 'Rajpura', 'Sanjivni Multyspeciality Hospital', 325, 'Internal Medicine', 30, 'Contact Hospital', 'https://imagesx.practo.com/providers/dr-yogesh-arora-internal-medicine-patiala-50c80fe8-5d85-4ed0-932e-65de8c38566b.jpg?i_type=t_70x70-3x-webp', 'Dr. Yogesh Arora Internal Medicine in Patiala', '01140036794'),
('Dr. Rajneet Kaur', 'Tripri', 'Alpha Homoeo Clinic', 250, 'Homoeopath', 19, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-rajneet-kaur-homoeopath-patiala-f90d30f1-fcd1-4164-85ec-fd6ed4f88d91.jpg?i_type=t_70x70-3x-webp', 'Dr. Rajneet Kaur Homoeopath in Patiala', '01141169692'),
('Dr. Harsimran Singh', 'Patiala', 'Simran ENT Centre', 150, 'Ear-Nose-Throat (ENT) Specialist', 19, 'Contact Hospital', 'https://imagesx.practo.com/providers/dr-harsimran-singh-ent-otorhinolaryngologist-patiala-3de83603-94bc-4a39-81ff-934863c7145a.jpg?i_type=t_70x70-3x-webp', 'Dr. Harsimran Singh Ear-Nose-Throat (ENT) Specialist in Patiala', '01161262025'),
('Dr. Vikas Nagi', 'Patiala City', 'Dr. Nagi Clinic', 200, 'Ayurveda', 21, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-vikas-nagi-ayurveda-ambala-a402771f-d054-4e3a-a875-b8e96422a94a.jpg?i_type=t_70x70-3x-webp', 'Dr. Vikas Nagi Ayurveda in Patiala', '01141169692'),
('Dr. Preet Kanwar Singh Sodhi', 'Urban Estate', 'Sodhi Eye Hospital', 400, 'Ophthalmologist', 14, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-preet-kanwar-singh-sodhi-ophthalmologist-eye-surgeon-patiala-3d3cb5df-8ae8-4c0e-9bb8-2b904726ab79.jpg?i_type=t_70x70-3x-webp', 'Dr. Preet Kanwar Singh Sodhi Ophthalmologist in Patiala', '01140849367'),
('Dr. Brajnish Kumar', 'Urban Estate', 'Honey Homeo Clinic', 200, 'Homoeopath', 33, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-brajnish-kumar-homoeopath-patiala-b5462330-9a91-47c9-a5ab-02e938eecf1b.jpg?i_type=t_70x70-3x-webp', 'Dr. Brajnish Kumar Homoeopath in Patiala', '01140036792'),
('Dr. Ankita', 'Rajpura', '32 Smile Dental Clinic', 100, 'Dentist', 7, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-ankita-dental-surgeon-patiala-ded47569-3d47-49e1-9f71-697278f7b778.jpg?i_type=t_70x70-3x-webp', 'Dr. Ankita Dentist in Patiala', '01161266276'),
('Dr. G P Singh', 'Patiala City', 'Prime Multispeciality Hospital', 400, 'Plastic Surgeon', 44, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-g-p-singh-plastic-surgeon-patiala-8739f3ad-9550-4acb-98b9-9ceefcacc3df.jpg?i_type=t_70x70-3x-webp', 'Dr. G P Singh Plastic Surgeon in Patiala', '01141169672'),
('Dr. Napinder Singh Chahal', 'Patiala City', 'Dr. Chahal''s Clinic', 25, 'General Physician', 50, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-napinder-singh-chahal-general-physician-patiala-4b4a0c3b-30e0-4e9c-a2d6-58fe012fddf3.jpg?i_type=t_70x70-3x-webp', 'Dr. Napinder Singh Chahal General Physician in Patiala', '01161262759'),
('Dr. Meghna Sharma', 'Rajpura', 'Neo Skinlaser Clinic', 150, 'General Physician', 20, 'Contact Clinic', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Meghna Sharma General Physician in Patiala', '01141169570'),
('Dr. J P Goyal', 'Patiala City', 'Prime Multispeciality Hospital', 200, 'Ear-Nose-Throat (ENT) Specialist', 49, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-j-p-goyal-ent-otorhinolaryngologist-patiala-fd6c4f7e-8b0d-497e-8b7d-8c6f5ae42def.jpg?i_type=t_70x70-3x-webp', 'Dr. J P Goyal Ear-Nose-Throat (ENT) Specialist in Patiala', '01141169672'),
('Dr. Rajan Shonek', 'Urban Estate', 'Rama Atray Memorial Eye Hospital', 200, 'Ophthalmologist', 30, 'Contact Hospital', 'https://imagesx.practo.com/providers/dr-rajan-shonek-ophthalmologist-eye-surgeon-patiala-11563066-e303-47ae-b59c-400c00f23c24.jpg?i_type=t_70x70-3x-webp', 'Dr. Rajan Shonek Ophthalmologist in Patiala', '01141169570'),
('Dr. Kamalpreet Singh', 'Guruteghbahadurgarh', 'Dr. Kamalpreet Singh Clinic', 600, 'General Physician', 9, '', 'https://imagesx.practo.com/providers/dr-kamalpreet-singh-general-physician-pune-68f37a3e-4fd7-45b0-ac97-73f995f28529.jpg?i_type=t_70x70-3x-webp', 'Dr. Kamalpreet Singh General Physician in Patiala', ''),
('Dr. Karan Shabad Singh', 'Model Town', 'Raikhy Polyclinic and Hospital', 500, 'Pediatrician', 6, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-karan-shabad-singh-pediatrician-patiala-5818fd11-4f6a-4f03-8d86-6e5ee3921ff3.jpg?i_type=t_70x70-3x-webp', 'Dr. Karan Shabad Singh Pediatrician in Patiala', '01140845776'),
('Dr. Mallick', 'Nsnis', 'Dept Of Sports Medicine', 300, 'Sports Medicine Specialist', 18, 'Contact Clinic', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Mallick Sports Medicine Specialist in Patiala', '01141169692'),
('Dr. Tejinder Rishi', 'Patiala City', 'Rishi Ayurveda Centre', 200, 'Ayurveda', 15, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-tejinder-rishi-ayurveda-patiala-e9c9bc69-85a1-4fae-889c-4b6118f2f5b1.jpg?i_type=t_70x70-3x-webp', 'Dr. Tejinder Rishi Ayurveda in Patiala', '01140848838'),
('Dr. Upinder Singh', 'Patiala City', 'Prime Multispeciality Hospital', 300, 'Orthopedist', 24, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-upinder-singh-orthopedic-surgeon-patiala-4b0bf873-c169-4892-b00c-cad18b77aeba.jpg?i_type=t_70x70-3x-webp', 'Dr. Upinder Singh Orthopedist in Patiala', '01141169672'),
('Dr. Harloveleen Ghuman', 'Rajpura Township', 'Dr. Harloveleen Ghuman Medicare Clinic', 100, 'General Practitioner', 13, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-harloveleen-ghuman-general-practitioner-patiala-faa2ecc3-3982-4771-bb6a-922a96178c10.jpg?i_type=t_70x70-3x-webp', 'Dr. Harloveleen Ghuman General Practitioner in Patiala', ''),
('Dr. Pancham Pal', 'Patiala City', 'Prime Multispeciality Hospital', 200, 'General Surgeon', 21, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-pancham-pal-general-surgeon-patiala-0361c0b3-4646-44c5-bcb6-b0c68998bdcd.jpg?i_type=t_70x70-3x-webp', 'Dr. Pancham Pal General Surgeon in Patiala', '01140036794'),
('Dr. Harjinder Kaur', 'Patiala City', 'Prime Multispeciality Hospital', 300, 'Gynecologist/Obstetrician', 53, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-harjinder-kaur-obstetrician-patiala-8d680c72-c06a-4f7d-994c-f15c8db9a2ac.jpg?i_type=t_70x70-3x-webp', 'Dr. Harjinder Kaur Gynecologist/Obstetrician in Patiala', '01141169672'),
('Dr. Inderpreet Kaur', 'Patiala City', 'Homeopathic Health Clinic', 200, 'Homoeopath', 17, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-inderpreet-kaur-homoeopath-patiala-e1168313-d446-4236-8058-ab5de0bc6bc0.jpg?i_type=t_70x70-3x-webp', 'Dr. Inderpreet Kaur Homoeopath in Patiala', '01161191084'),
('Dr. Aaeeyna Sood', 'Patiala City', 'Prime Multispeciality Hospital', 200, 'Gynecologist/Obstetrician', 24, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-aaeeyna-sood-obstetrician-patiala-ddf6a5b5-0899-4d4e-a014-58226160659c.jpg?i_type=t_70x70-3x-webp', 'Dr. Aaeeyna Sood Gynecologist/Obstetrician in Patiala', '01140036794'),
('Dr. Ankur Bansal', 'Patiala City', 'Janak Surgicare & Advanced Ankur Urology Centre', 500, 'Urologist', 12, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-ankur-bansal-urologist-patiala-6ba3d0e0-2772-4ef0-9349-e1e29b9c7d60.jpg?i_type=t_70x70-3x-webp', 'Dr. Ankur Bansal Urologist in Patiala', '01161264863'),
('Dr. Ashapritpal Kaur', 'Patiala City', 'Guru Teg Bahadur Eye Hospital', 100, 'Ophthalmologist', 15, 'Contact Hospital', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Ashapritpal Kaur Ophthalmologist in Patiala', '01141169692'),
('Dr. Navdeep Kaur', 'Patiala City', 'Maanya Healthcare', 150, 'Ayurveda', 5, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-navdeep-kaur-ayurveda-amritsar-47979c61-e017-42c2-a747-198ad620421c.jpg?i_type=t_70x70-3x-webp', 'Dr. Navdeep Kaur Ayurveda in Patiala', '08045687903'),
('Dr. Sudhir Gupta', 'Urban Estate', 'Dr Sudhir''s Spine Clinic', 300, 'Spine Surgeon', 16, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-sudhir-gupta-spine-surgeon-ortho-patiala-bc819166-43d5-444b-adea-bdd9812f9a47.jpg?i_type=t_70x70-3x-webp', 'Dr. Sudhir Gupta Spine Surgeon in Patiala', '01141169692'),
('Dr. Heena Sindhi (Physiotherapist)', 'Rajpura', 'Heena Sindhi Physiotherapy Clinic', 100, 'Physiotherapist', 15, 'Contact Clinic', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Heena Sindhi (Physiotherapist) Physiotherapist in Patiala', '01141169672'),
('Dr. Vipanpreet Kaur Bhullar', 'Patiala City', 'Sekhon Medicine Clinic', 200, 'Internal Medicine', 4, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-vipanpreet-kaur-bhullar-internal-medicine-patiala-bc1501fc-6688-4296-8aee-5b285bb61d20.jpg?i_type=t_70x70-3x-webp', 'Dr. Vipanpreet Kaur Bhullar Internal Medicine in Patiala', '01140849998'),
('Dr. Madan Lal', 'Rajpura Township', 'Dr Madan Clinic', 200, 'Ayurveda', 26, 'Contact Clinic', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Madan Lal Ayurveda in Patiala', '01161264863'),
('Dr. Vishal Sharma', 'Urban Estate', 'Sharma ENT Clinic', 150, 'Ear-Nose-Throat (ENT) Specialist', 10, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-vishal-sharma-ent-otorhinolaryngologist-patiala-184dfb8a-3e5c-4354-a975-2deddd3907c9.jpg?i_type=t_70x70-3x-webp', 'Dr. Vishal Sharma Ear-Nose-Throat (ENT) Specialist in Patiala', '01161264863'),
('Dr. Priyanka Yadav', 'Banur', 'Dr Kalra Homeopathic Clinic', 350, 'Homoeopath', 4, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-priyanka-yadav-homoeopath-chandigarh-549b97b7-5c4f-4652-a1e7-457cafe2739f.jpg?i_type=t_70x70-3x-webp', 'Dr. Priyanka Yadav Homoeopath in Patiala', '01141168386'),
('Dr. Atul Gupta', 'Model Town', 'GUPTA HOSPITAL SCG MEMORIAL', 500, 'Laparoscopic Surgeon', 30, 'Contact Clinic', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Atul Gupta Laparoscopic Surgeon in Patiala', '01140845776'),
('Dr. Dinkar Sood', 'Tripri', 'Gursharan Hospital', 600, 'Plastic Surgeon', 17, 'Contact Hospital', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Dinkar Sood Plastic Surgeon in Patiala', '01161262759'),
('Dr. Saurabh Verma', 'Patiala City', 'SK Multispeciality Dental Clinic & Implant Centre', 200, 'Dentist', 11, 'Contact Clinic', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Saurabh Verma Dentist in Patiala', '01141169692'),
('Dr. Bharat Singla', 'Shahi Samadhan', 'AB Advanced Ortho Care', 200, 'Orthopedist', 11, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-bharat-singla-orthopedic-surgeon-patiala-7f13d8c3-cb63-4a42-9464-aede65c433e1.jpg?i_type=t_70x70-3x-webp', 'Dr. Bharat Singla Orthopedist in Patiala', '01140844817'),
('Dr. Pearl Mehta', 'Tripri', 'Sehaj Homoeopathy', 200, 'Homoeopath', 15, 'Contact Clinic', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Pearl Mehta Homoeopath in Patiala', '01161264863'),
('Dr. Parmjit Singh Chahal', 'Patiala City', 'Dr. Chahal''s Clinic', 0, 'Orthopedist', 23, 'Contact Clinic', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Parmjit Singh Chahal Orthopedist in Patiala', '01161262799'),
('Dr. Ankit Singla', 'Bhadson', 'chest care clinic', 500, 'General Surgeon', 17, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-ankit-singla-general-surgeon-patiala-0026e293-a24a-4d05-a7db-b988131b6577.jpg?i_type=t_70x70-3x-webp', 'Dr. Ankit Singla General Surgeon in Patiala', '01141169399'),
('Dr. Sarbjot Kaur', 'Tripri', 'Hope Clinic', 300, 'General Practitioner', 15, '', 'https://imagesx.practo.com/providers/dr-sarbjot-kaur-general-practitioner-patiala-7c1647e9-fd96-4f38-9ba6-08a8457f0ae3.jpg?i_type=t_70x70-3x-webp', 'Dr. Sarbjot Kaur General Practitioner in Patiala', ''),
('Mr. Mishi Manrai', 'Patiala City', 'Sehaj Mind Clinic', 1000, 'Psychologist', 2, 'Contact Clinic', 'https://imagesx.practo.com/providers/mr-mishi-manrai-clinical-psychologist-patiala-c9d73f91-ba72-4b6f-84e2-2b7f17b1ae49.jpg?i_type=t_70x70-3x-webp', 'Mr. Mishi Manrai Psychologist in Patiala', '08037296355'),
('Dr. Somia Singla', 'Patran', 'Singla Nursing Home', 200, 'Ayurveda', 31, 'Contact Clinic', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Somia Singla Ayurveda in Patiala', ''),
('Dr. Rishabh Garg', 'Patiala City', 'Prime Hospital', 350, 'Urologist', 13, 'Contact Clinic', 'https://imagesx.practo.com/providers/dr-rishabh-garg-urological-surgeon-patiala-1cd96b56-9a27-4ed7-83d3-da8647a9c5d9.jpg?i_type=t_70x70-3x-webp', 'Dr. Rishabh Garg Urologist in Patiala', ''),
('Dr. Jastej Singh Kular', 'Patiala City', 'Kular Chest Clinic', 150, 'Pulmonologist', 28, 'Contact Clinic', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Jastej Singh Kular Pulmonologist in Patiala', ''),
('Dr. Gurpartap Singh', 'Sheran Wala Gate Patiala', 'Dr. Gurpartap Singh Dental Clinic', 100, 'Dentist', 11, 'Contact Clinic', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Gurpartap Singh Dentist in Patiala', ''),
('Dr. Ashmeet Kaur', 'Rajpura Township', 'Dr Paul Clinic', 500, 'Gynecologist/Obstetrician', 5, 'Contact Clinic', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Ashmeet Kaur Gynecologist/Obstetrician in Patiala', ''),
('Dr. Lalit Kumar', 'Rajpura', 'Gian Sagar Medical College & Hospital', 300, 'Internal Medicine', 20, 'Contact Hospital', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Lalit Kumar Internal Medicine in Patiala', ''),
('Dr. Manpreet Singh', 'Patiala City', 'Arihant Hospital', 300, 'General Physician', 20, 'Contact Clinic', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Manpreet Singh General Physician in Patiala', ''),
('Dr. Ravitej Singh Bal', 'Patiala', 'Manipal Hospital, Patiala', 0, 'Pediatric Surgeon', 8, 'Contact Hospital', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Ravitej Singh Bal Pediatric Surgeon in Patiala', ''),
('Dr. Bachan Lal', 'Patiala', 'Manipal Hospital, Patiala', 0, 'General Physician', 35, 'Contact Hospital', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Bachan Lal General Physician in Patiala', ''),
('Dr. Mohita Nangia', 'Urban Estate', 'Honey Homeo Clinic', 200, 'Homoeopath', 3, 'Contact Clinic', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Mohita Nangia Homoeopath in Patiala', ''),
('Dr. Aditya Duggal', 'Patiala City', 'arsh clinic', 300, 'General Physician', 8, 'Contact Clinic', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Aditya Duggal General Physician in Patiala', ''),
('Dr. Yashpal Goyal', 'Patiala City', 'Prime Multispeciality Hospital', 500, 'General Physician', 0, 'Contact Clinic', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Yashpal Goyal General Physician in Patiala', ''),
('Dr. Punashish Kaur', 'Patiala', 'Manipal Hospital, Patiala', 0, 'General Physician', 15, 'Contact Hospital', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Punashish Kaur General Physician in Patiala', ''),
('Dr. Lipsy Bansal', 'Patiala', 'Manipal Hospital, Patiala', 0, 'General Physician', 11, 'Contact Hospital', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Lipsy Bansal General Physician in Patiala', ''),
('Dr. Manpreet Singh (Physiotherapist)', 'Patiala City', 'Prime Multispeciality Hospital', 100, 'Physiotherapist', 12, 'Contact Clinic', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Manpreet Singh (Physiotherapist) Physiotherapist in Patiala', ''),
('Dr. Avind Kumar Alias Hussan Lal', 'Patiala', 'Manipal Hospital, Patiala', 0, 'General Physician', 50, 'Contact Hospital', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Avind Kumar Alias Hussan Lal General Physician in Patiala', ''),
('Dr. Singh Guliani Manjit', 'Patiala', 'Manipal Hospital, Patiala', 0, 'General Physician', 44, 'Contact Hospital', 'https://www.practostatic.com/web-assets/images/default_doctor.bcc11225c5c5.png', 'Dr. Singh Guliani Manjit General Physician in Patiala', '');

-- Copy and run this entire file in your Supabase SQL editor to create the doctors table and populate it with all 70 doctors

-- ========== tmp/extra-storage-and-realtime.sql ==========
-- Realtime for video calls (safe if already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'video_calls'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.video_calls;
  END IF;
END $$;

GRANT SELECT ON public.video_calls TO anon;
GRANT SELECT ON public.video_calls TO authenticated;

-- Family document storage used by the app
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'family-documents',
  'family-documents',
  true,
  10485760,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload family documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view family documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update family documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete family documents" ON storage.objects;

CREATE POLICY "Users can upload family documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'family-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view family documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'family-documents');

CREATE POLICY "Users can update family documents" ON storage.objects
  FOR UPDATE USING (bucket_id = 'family-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete family documents" ON storage.objects
  FOR DELETE USING (bucket_id = 'family-documents' AND auth.uid() IS NOT NULL);
