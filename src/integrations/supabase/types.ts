export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AppRole = 'admin' | 'user' | 'listing_editor' | 'agent'

export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          slug: string | null
          reference_id: string | null
          title: string
          title_en: string | null
          title_es: string | null
          subtitle: string | null
          subtitle_en: string | null
          description: string | null
          description_en: string | null
          description_es: string | null
          status: string
          property_type: string
          tier: string
          currency: string
          price_sale: number | null
          price_rent_monthly: number | null
          original_price: number | null
          price_note: string | null
          price_updated_at: string | null
          bedrooms: number
          bathrooms: number
          garage_spaces: number
          levels: number | null
          floor_number: number | null
          construction_size_sqm: number | null
          land_size_sqm: number | null
          terrace_sqm: number | null
          garden_sqm: number | null
          storage_sqm: number | null
          area_source: string | null
          year_built: number | null
          year_renovated: number | null
          property_condition: string | null
          location_name: string
          lat: number | null
          lng: number | null
          building_name: string | null
          tower_name: string | null
          unit_number: string | null
          images: string[] | null
          featured_images: string[] | null
          youtube_url: string | null
          youtube_enabled: boolean | null
          youtube_label: string | null
          youtube_label_en: string | null
          youtube_label_es: string | null
          amenities: string[] | null
          amenities_en: string[] | null
          amenities_es: string[] | null
          features: string[] | null
          features_en: string[] | null
          features_es: string[] | null
          appliances_included: string[] | null
          included_services: string[] | null
          furnished: string | null
          pet_policy: string | null
          deposit_amount: number | null
          min_lease_months: number | null
          hoa_monthly: number | null
          annual_property_tax: number | null
          parking_type: string | null
          has_storage: boolean | null
          folio_real: string | null
          plano_catastrado: string | null
          ownership_type: string | null
          condo_regulations_available: boolean | null
          has_encumbrances: boolean | null
          encumbrances_notes: string | null
          availability_date: string | null
          listing_agent_id: string | null
          listing_source: string
          external_agent_name: string | null
          external_agent_phone: string | null
          external_listing_id: string | null
          external_listing_url: string | null
          external_firm_id: string | null
          featured: boolean
          featured_order: number | null
          hidden: boolean
          visibility: string
          internal_notes: string | null
          internal_reference: string | null
          ai_raw_input: string | null
          ai_generated_title_es: string | null
          ai_generated_title_en: string | null
          ai_generated_description_es: string | null
          ai_generated_description_en: string | null
          plusvalia_notes: string | null
          facebook_published: boolean
          encuentra24_published: boolean
          meta_title: string | null
          meta_title_en: string | null
          meta_description: string | null
          meta_description_en: string | null
          zone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug?: string | null
          reference_id?: string | null
          title: string
          title_en?: string | null
          title_es?: string | null
          subtitle?: string | null
          subtitle_en?: string | null
          description?: string | null
          description_en?: string | null
          description_es?: string | null
          status?: string
          property_type?: string
          tier?: string
          currency?: string
          price_sale?: number | null
          price_rent_monthly?: number | null
          original_price?: number | null
          price_note?: string | null
          price_updated_at?: string | null
          bedrooms?: number
          bathrooms?: number
          garage_spaces?: number
          levels?: number | null
          floor_number?: number | null
          construction_size_sqm?: number | null
          land_size_sqm?: number | null
          terrace_sqm?: number | null
          garden_sqm?: number | null
          storage_sqm?: number | null
          area_source?: string | null
          year_built?: number | null
          year_renovated?: number | null
          property_condition?: string | null
          location_name: string
          lat?: number | null
          lng?: number | null
          building_name?: string | null
          tower_name?: string | null
          unit_number?: string | null
          images?: string[] | null
          featured_images?: string[] | null
          youtube_url?: string | null
          youtube_enabled?: boolean | null
          youtube_label?: string | null
          youtube_label_en?: string | null
          youtube_label_es?: string | null
          amenities?: string[] | null
          amenities_en?: string[] | null
          amenities_es?: string[] | null
          features?: string[] | null
          features_en?: string[] | null
          features_es?: string[] | null
          appliances_included?: string[] | null
          included_services?: string[] | null
          furnished?: string | null
          pet_policy?: string | null
          deposit_amount?: number | null
          min_lease_months?: number | null
          hoa_monthly?: number | null
          annual_property_tax?: number | null
          parking_type?: string | null
          has_storage?: boolean | null
          folio_real?: string | null
          plano_catastrado?: string | null
          ownership_type?: string | null
          condo_regulations_available?: boolean | null
          has_encumbrances?: boolean | null
          encumbrances_notes?: string | null
          availability_date?: string | null
          listing_agent_id?: string | null
          listing_source?: string
          external_agent_name?: string | null
          external_agent_phone?: string | null
          external_listing_id?: string | null
          external_listing_url?: string | null
          external_firm_id?: string | null
          featured?: boolean
          featured_order?: number | null
          hidden?: boolean
          visibility?: string
          internal_notes?: string | null
          internal_reference?: string | null
          ai_raw_input?: string | null
          ai_generated_title_es?: string | null
          ai_generated_title_en?: string | null
          ai_generated_description_es?: string | null
          ai_generated_description_en?: string | null
          plusvalia_notes?: string | null
          facebook_published?: boolean
          encuentra24_published?: boolean
          meta_title?: string | null
          meta_title_en?: string | null
          meta_description?: string | null
          meta_description_en?: string | null
          zone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string | null
          reference_id?: string | null
          title?: string
          title_en?: string | null
          title_es?: string | null
          subtitle?: string | null
          subtitle_en?: string | null
          description?: string | null
          description_en?: string | null
          description_es?: string | null
          status?: string
          property_type?: string
          tier?: string
          currency?: string
          price_sale?: number | null
          price_rent_monthly?: number | null
          original_price?: number | null
          price_note?: string | null
          price_updated_at?: string | null
          bedrooms?: number
          bathrooms?: number
          garage_spaces?: number
          levels?: number | null
          floor_number?: number | null
          construction_size_sqm?: number | null
          land_size_sqm?: number | null
          terrace_sqm?: number | null
          garden_sqm?: number | null
          storage_sqm?: number | null
          area_source?: string | null
          year_built?: number | null
          year_renovated?: number | null
          property_condition?: string | null
          location_name?: string
          lat?: number | null
          lng?: number | null
          building_name?: string | null
          tower_name?: string | null
          unit_number?: string | null
          images?: string[] | null
          featured_images?: string[] | null
          youtube_url?: string | null
          youtube_enabled?: boolean | null
          youtube_label?: string | null
          youtube_label_en?: string | null
          youtube_label_es?: string | null
          amenities?: string[] | null
          amenities_en?: string[] | null
          amenities_es?: string[] | null
          features?: string[] | null
          features_en?: string[] | null
          features_es?: string[] | null
          appliances_included?: string[] | null
          included_services?: string[] | null
          furnished?: string | null
          pet_policy?: string | null
          deposit_amount?: number | null
          min_lease_months?: number | null
          hoa_monthly?: number | null
          annual_property_tax?: number | null
          parking_type?: string | null
          has_storage?: boolean | null
          folio_real?: string | null
          plano_catastrado?: string | null
          ownership_type?: string | null
          condo_regulations_available?: boolean | null
          has_encumbrances?: boolean | null
          encumbrances_notes?: string | null
          availability_date?: string | null
          listing_agent_id?: string | null
          listing_source?: string
          external_agent_name?: string | null
          external_agent_phone?: string | null
          external_listing_id?: string | null
          external_listing_url?: string | null
          external_firm_id?: string | null
          featured?: boolean
          featured_order?: number | null
          hidden?: boolean
          visibility?: string
          internal_notes?: string | null
          internal_reference?: string | null
          ai_raw_input?: string | null
          ai_generated_title_es?: string | null
          ai_generated_title_en?: string | null
          ai_generated_description_es?: string | null
          ai_generated_description_en?: string | null
          plusvalia_notes?: string | null
          facebook_published?: boolean
          encuentra24_published?: boolean
          meta_title?: string | null
          meta_title_en?: string | null
          meta_description?: string | null
          meta_description_en?: string | null
          zone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'properties_listing_agent_id_fkey'
            columns: ['listing_agent_id']
            referencedRelation: 'agents'
            referencedColumns: ['id']
          }
        ]
      }
      agents: {
        Row: {
          id: string
          full_name: string
          role: string
          bio: string | null
          phone: string | null
          email: string | null
          photo_url: string | null
          languages: string[] | null
          service_areas: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          role?: string
          bio?: string | null
          phone?: string | null
          email?: string | null
          photo_url?: string | null
          languages?: string[] | null
          service_areas?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: string
          bio?: string | null
          phone?: string | null
          email?: string | null
          photo_url?: string | null
          languages?: string[] | null
          service_areas?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          lead_type: string
          full_name: string
          email: string
          phone: string | null
          preferred_contact_method: string
          country_of_origin: string | null
          timeline: string
          budget_min: number | null
          budget_max: number | null
          interested_areas: string[] | null
          interested_property_type: string | null
          message: string | null
          property_id: string | null
          status: string
          assigned_agent_id: string | null
          notes: string | null
          looking_for: string | null
          desired_bedrooms: number | null
          desired_bathrooms: number | null
          second_full_name: string | null
          second_email: string | null
          second_phone: string | null
          source_campaign: string | null
          follow_up_at: string | null
          last_contacted_at: string | null
          external_links: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_type?: string
          full_name: string
          email: string
          phone?: string | null
          preferred_contact_method?: string
          country_of_origin?: string | null
          timeline?: string
          budget_min?: number | null
          budget_max?: number | null
          interested_areas?: string[] | null
          interested_property_type?: string | null
          message?: string | null
          property_id?: string | null
          status?: string
          assigned_agent_id?: string | null
          notes?: string | null
          looking_for?: string | null
          desired_bedrooms?: number | null
          desired_bathrooms?: number | null
          second_full_name?: string | null
          second_email?: string | null
          second_phone?: string | null
          source_campaign?: string | null
          follow_up_at?: string | null
          last_contacted_at?: string | null
          external_links?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_type?: string
          full_name?: string
          email?: string
          phone?: string | null
          preferred_contact_method?: string
          country_of_origin?: string | null
          timeline?: string
          budget_min?: number | null
          budget_max?: number | null
          interested_areas?: string[] | null
          interested_property_type?: string | null
          message?: string | null
          property_id?: string | null
          status?: string
          assigned_agent_id?: string | null
          notes?: string | null
          looking_for?: string | null
          desired_bedrooms?: number | null
          desired_bathrooms?: number | null
          second_full_name?: string | null
          second_email?: string | null
          second_phone?: string | null
          source_campaign?: string | null
          follow_up_at?: string | null
          last_contacted_at?: string | null
          external_links?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'leads_assigned_agent_id_fkey'
            columns: ['assigned_agent_id']
            referencedRelation: 'agents'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'leads_property_id_fkey'
            columns: ['property_id']
            referencedRelation: 'properties'
            referencedColumns: ['id']
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          email: string | null
          avatar_url: string | null
          language_preference: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          language_preference?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          language_preference?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: AppRole
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: AppRole
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: AppRole
          created_at?: string
        }
        Relationships: []
      }
      amenities_master: {
        Row: {
          id: string
          name: string
          type: string
          category: string
          icon: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          type: string
          category?: string
          icon?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: string
          category?: string
          icon?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          id: string
          title: string
          type: 'bug' | 'feature' | 'task' | 'other'
          description: string | null
          status: 'open' | 'in_progress' | 'done' | 'closed'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          screenshot_url: string | null
          created_by: string | null
          assigned_to: string | null
          comments: Json[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          type?: 'bug' | 'feature' | 'task' | 'other'
          description?: string | null
          status?: 'open' | 'in_progress' | 'done' | 'closed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          screenshot_url?: string | null
          created_by?: string | null
          assigned_to?: string | null
          comments?: Json[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          type?: 'bug' | 'feature' | 'task' | 'other'
          description?: string | null
          status?: 'open' | 'in_progress' | 'done' | 'closed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          screenshot_url?: string | null
          created_by?: string | null
          assigned_to?: string | null
          comments?: Json[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      curated_lists: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          property_ids: string[]
          client_name: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_name: string | null
          message: string | null
          language: string
          is_private: boolean
          visibility: string
          password_hash: string | null
          accent_color: string
          created_by: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          property_ids?: string[]
          client_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_name?: string | null
          message?: string | null
          language?: string
          is_private?: boolean
          visibility?: string
          password_hash?: string | null
          accent_color?: string
          created_by: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          property_ids?: string[]
          client_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_name?: string | null
          message?: string | null
          language?: string
          is_private?: boolean
          visibility?: string
          password_hash?: string | null
          accent_color?: string
          created_by?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      has_role: {
        Args: { user_id: string; role: AppRole }
        Returns: boolean
      }
      has_any_role: {
        Args: { user_id: string; roles: AppRole[] }
        Returns: boolean
      }
      can_edit_listings: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_view_leads: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_edit_leads: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: AppRole
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type PropertyRow = Tables<'properties'>
export type AgentRow = Tables<'agents'>
export type LeadRow = Tables<'leads'>
export type ProfileRow = Tables<'profiles'>
export type AmenityRow = Tables<'amenities_master'>
export type CuratedListRow = Tables<'curated_lists'>
export type TicketRow = Tables<'support_tickets'>
