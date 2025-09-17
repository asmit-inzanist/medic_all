export interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  age: number;
  relationship: string;
  gender?: string;
  blood_type?: string;
  height?: string;
  weight?: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  
  // Health Information (optional)
  allergies?: string[];
  current_medications?: string[];
  medical_conditions?: string[];
  insurance_info?: string;
  
  // Document attachments
  documents?: DocumentAttachment[];
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface DocumentAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploaded_at: string;
}

export interface CreateFamilyMemberData {
  name: string;
  age: number;
  relationship: string;
  gender?: string;
  blood_type?: string;
  height?: string;
  weight?: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  allergies?: string[];
  current_medications?: string[];
  medical_conditions?: string[];
  insurance_info?: string;
  documents?: DocumentAttachment[];
}

export interface UpdateFamilyMemberData extends Partial<CreateFamilyMemberData> {
  id: string;
}