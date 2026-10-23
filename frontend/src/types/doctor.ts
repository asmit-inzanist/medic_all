export interface Doctor {
  id: string;
  name: string;
  area: string | null;
  clinic_name: string | null;
  fees: number; // 0 for free consultation
  department: string | null;
  experience: number; // Years of experience
  contact_type: string | null; // 'Contact Clinic' or 'Contact Hospital'
  image_url: string | null;
  description: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}