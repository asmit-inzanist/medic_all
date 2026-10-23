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