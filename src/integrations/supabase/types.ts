export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          amenities: string[] | null
          bathrooms: number
          bedrooms: number
          construction_size_sqm: number | null
          created_at: string
          currency: string
          description: string | null
          description_en: string | null
          encuentra24_published: boolean
          facebook_published: boolean
          featured: boolean
          hidden: boolean
          id: string
          images: string[] | null
          land_size_sqm: number | null
          location_name: string
          meta_description: string | null
          meta_description_en: string | null
          meta_title: string | null
          meta_title_en: string | null
          plusvalia_notes: string | null
          price_rent_monthly: number | null
          price_sale: number | null
          property_type: string
          slug: string
          status: string
          subtitle_en: string | null
          subtitle_es: string | null
          title: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          bathrooms?: number
          bedrooms?: number
          construction_size_sqm?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          description_en?: string | null
          encuentra24_published?: boolean
          facebook_published?: boolean
          featured?: boolean
          hidden?: boolean
          id?: string
          images?: string[] | null
          land_size_sqm?: number | null
          location_name: string
          meta_description?: string | null
          meta_description_en?: string | null
          meta_title?: string | null
          meta_title_en?: string | null
          plusvalia_notes?: string | null
          price_rent_monthly?: number | null
          price_sale?: number | null
          property_type?: string
          slug: string
          status?: string
          subtitle_en?: string | null
          subtitle_es?: string | null
          title: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          bathrooms?: number
          bedrooms?: number
          construction_size_sqm?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          description_en?: string | null
          encuentra24_published?: boolean
          facebook_published?: boolean
          featured?: boolean
          hidden?: boolean
          id?: string
          images?: string[] | null
          land_size_sqm?: number | null
          location_name?: string
          meta_description?: string | null
          meta_description_en?: string | null
          meta_title?: string | null
          meta_title_en?: string | null
          plusvalia_notes?: string | null
          price_rent_monthly?: number | null
          price_sale?: number | null
          property_type?: string
          slug?: string
          status?: string
          subtitle_en?: string | null
          subtitle_es?: string | null
          title?: string
          title_en?: string | null
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

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type PropertyRow = Tables<'properties'>
