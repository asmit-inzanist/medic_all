export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bed_bookings: {
        Row: {
          admission_type: string
          booking_date: string
          created_at: string | null
          hospital_id: string | null
          id: string
          patient_age: number
          patient_name: string
          patient_phone: string
          special_requirements: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admission_type: string
          booking_date: string
          created_at?: string | null
          hospital_id?: string | null
          id?: string
          patient_age: number
          patient_name: string
          patient_phone: string
          special_requirements?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admission_type?: string
          booking_date?: string
          created_at?: string | null
          hospital_id?: string | null
          id?: string
          patient_age?: number
          patient_name?: string
          patient_phone?: string
          special_requirements?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bed_bookings_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          accepts_emergency: boolean | null
          address: string
          available_beds: number | null
          created_at: string | null
          emergency_beds: number | null
          google_maps_url: string
          id: string
          insurance_accepted: string[] | null
          is_24_hours: boolean | null
          name: string
          operating_hours: string | null
          phone: string | null
          rating: number | null
          review_count: number | null
          specialties: string[] | null
          total_beds: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          accepts_emergency?: boolean | null
          address: string
          available_beds?: number | null
          created_at?: string | null
          emergency_beds?: number | null
          google_maps_url: string
          id?: string
          insurance_accepted?: string[] | null
          is_24_hours?: boolean | null
          name: string
          operating_hours?: string | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          specialties?: string[] | null
          total_beds?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          accepts_emergency?: boolean | null
          address?: string
          available_beds?: number | null
          created_at?: string | null
          emergency_beds?: number | null
          google_maps_url?: string
          id?: string
          insurance_accepted?: string[] | null
          is_24_hours?: boolean | null
          name?: string
          operating_hours?: string | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          specialties?: string[] | null
          total_beds?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      medical_documents: {
        Row: {
          created_at: string
          description: string | null
          document_name: string
          document_type: string
          file_path: string
          file_size: number
          file_url: string | null
          id: string
          mime_type: string
          updated_at: string
          upload_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_name: string
          document_type: string
          file_path: string
          file_size: number
          file_url?: string | null
          id?: string
          mime_type: string
          updated_at?: string
          upload_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          document_name?: string
          document_type?: string
          file_path?: string
          file_size?: number
          file_url?: string | null
          id?: string
          mime_type?: string
          updated_at?: string
          upload_date?: string
          user_id?: string
        }
        Relationships: []
      }
      medicines: {
        Row: {
          brand: string | null
          category: string
          created_at: string
          description: string | null
          form: string | null
          generic_name: string | null
          id: string
          manufacturer: string | null
          name: string
          requires_prescription: boolean | null
          strength: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category: string
          created_at?: string
          description?: string | null
          form?: string | null
          generic_name?: string | null
          id?: string
          manufacturer?: string | null
          name: string
          requires_prescription?: boolean | null
          strength?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string
          description?: string | null
          form?: string | null
          generic_name?: string | null
          id?: string
          manufacturer?: string | null
          name?: string
          requires_prescription?: boolean | null
          strength?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pharmacies: {
        Row: {
          address: string
          created_at: string
          delivery_time: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          latitude: number
          longitude: number
          name: string
          phone: string | null
          rating: number | null
          total_reviews: number | null
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          delivery_time?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude: number
          longitude: number
          name: string
          phone?: string | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          delivery_time?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          phone?: string | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      pharmacy_inventory: {
        Row: {
          created_at: string
          expiry_date: string | null
          id: string
          is_available: boolean | null
          medicine_id: string
          original_price: number | null
          pharmacy_id: string
          price: number
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_available?: boolean | null
          medicine_id: string
          original_price?: number | null
          pharmacy_id: string
          price: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_available?: boolean | null
          medicine_id?: string
          original_price?: number | null
          pharmacy_id?: string
          price?: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_inventory_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_inventory_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          allergies: string[] | null
          blood_type: string | null
          created_at: string
          current_medications: string[] | null
          date_of_birth: string | null
          email: string | null
          emergency_contact: string | null
          first_name: string | null
          gender: string | null
          height: string | null
          id: string
          insurance_info: string | null
          last_name: string | null
          medical_conditions: string[] | null
          phone: string | null
          updated_at: string
          user_id: string
          weight: string | null
        }
        Insert: {
          allergies?: string[] | null
          blood_type?: string | null
          created_at?: string
          current_medications?: string[] | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          first_name?: string | null
          gender?: string | null
          height?: string | null
          id?: string
          insurance_info?: string | null
          last_name?: string | null
          medical_conditions?: string[] | null
          phone?: string | null
          updated_at?: string
          user_id: string
          weight?: string | null
        }
        Update: {
          allergies?: string[] | null
          blood_type?: string | null
          created_at?: string
          current_medications?: string[] | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          first_name?: string | null
          gender?: string | null
          height?: string | null
          id?: string
          insurance_info?: string | null
          last_name?: string | null
          medical_conditions?: string[] | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          weight?: string | null
        }
        Relationships: []
      }
      video_calls: {
        Row: {
          caller_email: string
          caller_id: string
          caller_name: string | null
          created_at: string
          id: string
          receiver_email: string
          receiver_id: string
          receiver_name: string | null
          room_id: string
          status: string
          updated_at: string
        }
        Insert: {
          caller_email: string
          caller_id: string
          caller_name?: string | null
          created_at?: string
          id?: string
          receiver_email: string
          receiver_id: string
          receiver_name?: string | null
          room_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          caller_email?: string
          caller_id?: string
          caller_name?: string | null
          created_at?: string
          id?: string
          receiver_email?: string
          receiver_id?: string
          receiver_name?: string | null
          room_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
