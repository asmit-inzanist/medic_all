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