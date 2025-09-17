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