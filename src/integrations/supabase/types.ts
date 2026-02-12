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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_name: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_name?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_name?: string | null
          target_type?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          languages: string[] | null
          phone: string | null
          photo_url: string | null
          role: string
          service_areas: string[] | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          languages?: string[] | null
          phone?: string | null
          photo_url?: string | null
          role?: string
          service_areas?: string[] | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          languages?: string[] | null
          phone?: string | null
          photo_url?: string | null
          role?: string
          service_areas?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      hero_global_settings: {
        Row: {
          created_at: string
          gradient_direction: string
          gradient_end_color: string
          gradient_end_stop: number
          gradient_start_color: string
          gradient_start_stop: number
          hero_height_mode: string
          hero_height_value: number
          id: string
          overlay_enabled: boolean
          overlay_opacity: number
          overlay_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          gradient_direction?: string
          gradient_end_color?: string
          gradient_end_stop?: number
          gradient_start_color?: string
          gradient_start_stop?: number
          hero_height_mode?: string
          hero_height_value?: number
          id?: string
          overlay_enabled?: boolean
          overlay_opacity?: number
          overlay_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          gradient_direction?: string
          gradient_end_color?: string
          gradient_end_stop?: number
          gradient_start_color?: string
          gradient_start_stop?: number
          hero_height_mode?: string
          hero_height_value?: number
          id?: string
          overlay_enabled?: boolean
          overlay_opacity?: number
          overlay_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      hero_media: {
        Row: {
          alt_text: string
          created_at: string
          cta_label: string | null
          cta_url: string | null
          headline: string | null
          id: string
          image_file: string | null
          is_enabled: boolean
          media_type: string
          page_slug: string
          poster_image: string | null
          subheadline: string | null
          updated_at: string
          video_file: string | null
          video_source: string
          video_url: string | null
        }
        Insert: {
          alt_text?: string
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          headline?: string | null
          id?: string
          image_file?: string | null
          is_enabled?: boolean
          media_type?: string
          page_slug: string
          poster_image?: string | null
          subheadline?: string | null
          updated_at?: string
          video_file?: string | null
          video_source?: string
          video_url?: string | null
        }
        Update: {
          alt_text?: string
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          headline?: string | null
          id?: string
          image_file?: string | null
          is_enabled?: boolean
          media_type?: string
          page_slug?: string
          poster_image?: string | null
          subheadline?: string | null
          updated_at?: string
          video_file?: string | null
          video_source?: string
          video_url?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_agent_id: string | null
          budget_max: number | null
          budget_min: number | null
          country_of_origin: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          interested_areas: string[] | null
          interested_property_type: string | null
          last_contacted_at: string | null
          lead_type: string
          message: string | null
          notes: string | null
          phone: string | null
          preferred_contact_method: string
          property_id: string | null
          status: string
          timeline: string
        }
        Insert: {
          assigned_agent_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          country_of_origin?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          interested_areas?: string[] | null
          interested_property_type?: string | null
          last_contacted_at?: string | null
          lead_type?: string
          message?: string | null
          notes?: string | null
          phone?: string | null
          preferred_contact_method?: string
          property_id?: string | null
          status?: string
          timeline?: string
        }
        Update: {
          assigned_agent_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          country_of_origin?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          interested_areas?: string[] | null
          interested_property_type?: string | null
          last_contacted_at?: string | null
          lead_type?: string
          message?: string | null
          notes?: string | null
          phone?: string | null
          preferred_contact_method?: string
          property_id?: string | null
          status?: string
          timeline?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          language_preference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          language_preference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          language_preference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          amenities: string[] | null
          amenities_en: string[] | null
          amenities_es: string[] | null
          annual_property_tax: number | null
          appliances_included: string[] | null
          area_source: string | null
          availability_date: string | null
          bathrooms: number
          bedrooms: number
          building_name: string | null
          condo_regulations_available: boolean | null
          construction_size_sqm: number | null
          created_at: string
          currency: string
          deposit_amount: number | null
          description: string | null
          description_en: string | null
          description_es: string | null
          encumbrances_notes: string | null
          featured: boolean
          featured_images: string[] | null
          featured_order: number | null
          features: string[] | null
          features_en: string[] | null
          features_es: string[] | null
          floor_number: number | null
          folio_real: string | null
          furnished: string | null
          garage_spaces: number
          garden_sqm: number | null
          has_encumbrances: boolean | null
          has_storage: boolean | null
          hidden: boolean
          hoa_monthly: number | null
          id: string
          images: string[] | null
          included_services: string[] | null
          internal_notes: string | null
          internal_reference: string | null
          land_size_sqm: number | null
          lat: number | null
          levels: number | null
          listing_agent_id: string | null
          listing_source: string
          lng: number | null
          location_name: string
          min_lease_months: number | null
          original_price: number | null
          ownership_type: string | null
          parking_type: string | null
          pet_policy: string | null
          plano_catastrado: string | null
          price_note: string | null
          price_rent_monthly: number | null
          price_sale: number | null
          price_updated_at: string | null
          property_condition: string | null
          property_type: string
          status: string
          storage_sqm: number | null
          terrace_sqm: number | null
          tier: string
          title: string
          title_en: string | null
          title_es: string | null
          tower_name: string | null
          unit_number: string | null
          updated_at: string
          year_built: number | null
          year_renovated: number | null
          youtube_enabled: boolean | null
          youtube_label: string | null
          youtube_label_en: string | null
          youtube_label_es: string | null
          youtube_url: string | null
        }
        Insert: {
          amenities?: string[] | null
          amenities_en?: string[] | null
          amenities_es?: string[] | null
          annual_property_tax?: number | null
          appliances_included?: string[] | null
          area_source?: string | null
          availability_date?: string | null
          bathrooms?: number
          bedrooms?: number
          building_name?: string | null
          condo_regulations_available?: boolean | null
          construction_size_sqm?: number | null
          created_at?: string
          currency?: string
          deposit_amount?: number | null
          description?: string | null
          description_en?: string | null
          description_es?: string | null
          encumbrances_notes?: string | null
          featured?: boolean
          featured_images?: string[] | null
          featured_order?: number | null
          features?: string[] | null
          features_en?: string[] | null
          features_es?: string[] | null
          floor_number?: number | null
          folio_real?: string | null
          furnished?: string | null
          garage_spaces?: number
          garden_sqm?: number | null
          has_encumbrances?: boolean | null
          has_storage?: boolean | null
          hidden?: boolean
          hoa_monthly?: number | null
          id?: string
          images?: string[] | null
          included_services?: string[] | null
          internal_notes?: string | null
          internal_reference?: string | null
          land_size_sqm?: number | null
          lat?: number | null
          levels?: number | null
          listing_agent_id?: string | null
          listing_source?: string
          lng?: number | null
          location_name: string
          min_lease_months?: number | null
          original_price?: number | null
          ownership_type?: string | null
          parking_type?: string | null
          pet_policy?: string | null
          plano_catastrado?: string | null
          price_note?: string | null
          price_rent_monthly?: number | null
          price_sale?: number | null
          price_updated_at?: string | null
          property_condition?: string | null
          property_type?: string
          status?: string
          storage_sqm?: number | null
          terrace_sqm?: number | null
          tier?: string
          title: string
          title_en?: string | null
          title_es?: string | null
          tower_name?: string | null
          unit_number?: string | null
          updated_at?: string
          year_built?: number | null
          year_renovated?: number | null
          youtube_enabled?: boolean | null
          youtube_label?: string | null
          youtube_label_en?: string | null
          youtube_label_es?: string | null
          youtube_url?: string | null
        }
        Update: {
          amenities?: string[] | null
          amenities_en?: string[] | null
          amenities_es?: string[] | null
          annual_property_tax?: number | null
          appliances_included?: string[] | null
          area_source?: string | null
          availability_date?: string | null
          bathrooms?: number
          bedrooms?: number
          building_name?: string | null
          condo_regulations_available?: boolean | null
          construction_size_sqm?: number | null
          created_at?: string
          currency?: string
          deposit_amount?: number | null
          description?: string | null
          description_en?: string | null
          description_es?: string | null
          encumbrances_notes?: string | null
          featured?: boolean
          featured_images?: string[] | null
          featured_order?: number | null
          features?: string[] | null
          features_en?: string[] | null
          features_es?: string[] | null
          floor_number?: number | null
          folio_real?: string | null
          furnished?: string | null
          garage_spaces?: number
          garden_sqm?: number | null
          has_encumbrances?: boolean | null
          has_storage?: boolean | null
          hidden?: boolean
          hoa_monthly?: number | null
          id?: string
          images?: string[] | null
          included_services?: string[] | null
          internal_notes?: string | null
          internal_reference?: string | null
          land_size_sqm?: number | null
          lat?: number | null
          levels?: number | null
          listing_agent_id?: string | null
          listing_source?: string
          lng?: number | null
          location_name?: string
          min_lease_months?: number | null
          original_price?: number | null
          ownership_type?: string | null
          parking_type?: string | null
          pet_policy?: string | null
          plano_catastrado?: string | null
          price_note?: string | null
          price_rent_monthly?: number | null
          price_sale?: number | null
          price_updated_at?: string | null
          property_condition?: string | null
          property_type?: string
          status?: string
          storage_sqm?: number | null
          terrace_sqm?: number | null
          tier?: string
          title?: string
          title_en?: string | null
          title_es?: string | null
          tower_name?: string | null
          unit_number?: string | null
          updated_at?: string
          year_built?: number | null
          year_renovated?: number | null
          youtube_enabled?: boolean | null
          youtube_label?: string | null
          youtube_label_en?: string | null
          youtube_label_es?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_listing_agent_id_fkey"
            columns: ["listing_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_leads: { Args: never; Returns: boolean }
      can_edit_listings: { Args: never; Returns: boolean }
      can_view_leads: { Args: never; Returns: boolean }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user" | "listing_editor" | "agent"
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
    Enums: {
      app_role: ["admin", "user", "listing_editor", "agent"],
    },
  },
} as const
