import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types';

// Map database row to Property type
function mapDbToProperty(row: any): Property {
  return {
    id: row.id,
    title: row.title,
    status: row.status as Property['status'],
    priceSale: row.price_sale,
    priceRentMonthly: row.price_rent_monthly,
    currency: row.currency,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    garageSpaces: row.garage_spaces,
    landSizeSqm: row.land_size_sqm,
    constructionSizeSqm: row.construction_size_sqm,
    locationName: row.location_name,
    lat: row.lat,
    lng: row.lng,
    propertyType: row.property_type as Property['propertyType'],
    tier: row.tier as Property['tier'],
    amenities: row.amenities || [],
    features: row.features || [],
    description: row.description || '',
    images: row.images || [],
    featured: row.featured,
    listingAgentId: row.listing_agent_id,
    salesAgentIds: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Featured Images & Video
    featuredImages: row.featured_images || [],
    youtubeUrl: row.youtube_url,
    youtubeEnabled: row.youtube_enabled || false,
    youtubeLabel: row.youtube_label || 'Video Tour',
    // New fields
    buildingName: row.building_name,
    unitNumber: row.unit_number,
    towerName: row.tower_name,
    floorNumber: row.floor_number,
    internalReference: row.internal_reference,
    yearBuilt: row.year_built,
    yearRenovated: row.year_renovated,
    propertyCondition: row.property_condition || 'good',
    levels: row.levels || 1,
    terraceSqm: row.terrace_sqm,
    gardenSqm: row.garden_sqm,
    storageSqm: row.storage_sqm,
    areaSource: row.area_source,
    depositAmount: row.deposit_amount,
    minLeaseMonths: row.min_lease_months,
    includedServices: row.included_services || [],
    petPolicy: row.pet_policy || 'not_allowed',
    hoaMonthly: row.hoa_monthly,
    annualPropertyTax: row.annual_property_tax,
    folioReal: row.folio_real,
    planoCatastrado: row.plano_catastrado,
    ownershipType: row.ownership_type || 'person',
    condoRegulationsAvailable: row.condo_regulations_available || false,
    hasEncumbrances: row.has_encumbrances || false,
    encumbrancesNotes: row.encumbrances_notes,
    availabilityDate: row.availability_date,
    furnished: row.furnished || 'no',
    appliancesIncluded: row.appliances_included || [],
    parkingType: row.parking_type,
    hasStorage: row.has_storage || false,
    internalNotes: row.internal_notes,
    // Listing Source
    listingSource: row.listing_source || 'direct',
    // Visibility
    hidden: row.hidden || false,
    // Price Improvement
    originalPrice: row.original_price ?? null,
    priceUpdatedAt: row.price_updated_at ?? null,
    priceNote: row.price_note ?? null,
    // Featured Ordering
    featuredOrder: row.featured_order ?? 0,
    // Bilingual fields
    titleEn: row.title_en,
    titleEs: row.title_es,
    descriptionEn: row.description_en,
    descriptionEs: row.description_es,
    featuresEn: row.features_en || [],
    featuresEs: row.features_es || [],
    amenitiesEn: row.amenities_en || [],
    amenitiesEs: row.amenities_es || [],
    youtubeLabelEn: row.youtube_label_en,
    youtubeLabelEs: row.youtube_label_es,
  };
}

// Map Property to database format
function mapPropertyToDb(property: Partial<Property>) {
  return {
    title: property.title,
    status: property.status,
    price_sale: property.priceSale,
    price_rent_monthly: property.priceRentMonthly,
    currency: property.currency,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    garage_spaces: property.garageSpaces,
    land_size_sqm: property.landSizeSqm,
    construction_size_sqm: property.constructionSizeSqm,
    location_name: property.locationName,
    lat: property.lat,
    lng: property.lng,
    property_type: property.propertyType,
    tier: property.tier,
    amenities: property.amenities,
    features: property.features,
    description: property.description,
    images: property.images,
    featured: property.featured,
    listing_agent_id: property.listingAgentId,
    // Featured Images & Video
    featured_images: property.featuredImages,
    youtube_url: property.youtubeUrl,
    youtube_enabled: property.youtubeEnabled,
    youtube_label: property.youtubeLabel,
    // New fields
    building_name: property.buildingName,
    unit_number: property.unitNumber,
    tower_name: property.towerName,
    floor_number: property.floorNumber,
    internal_reference: property.internalReference,
    year_built: property.yearBuilt,
    year_renovated: property.yearRenovated,
    property_condition: property.propertyCondition,
    levels: property.levels,
    terrace_sqm: property.terraceSqm,
    garden_sqm: property.gardenSqm,
    storage_sqm: property.storageSqm,
    area_source: property.areaSource,
    deposit_amount: property.depositAmount,
    min_lease_months: property.minLeaseMonths,
    included_services: property.includedServices,
    pet_policy: property.petPolicy,
    hoa_monthly: property.hoaMonthly,
    annual_property_tax: property.annualPropertyTax,
    folio_real: property.folioReal,
    plano_catastrado: property.planoCatastrado,
    ownership_type: property.ownershipType,
    condo_regulations_available: property.condoRegulationsAvailable,
    has_encumbrances: property.hasEncumbrances,
    encumbrances_notes: property.encumbrancesNotes,
    availability_date: property.availabilityDate,
    furnished: property.furnished,
    appliances_included: property.appliancesIncluded,
    parking_type: property.parkingType,
    has_storage: property.hasStorage,
    internal_notes: property.internalNotes,
    // Listing Source
    listing_source: property.listingSource,
    // Visibility
    hidden: property.hidden,
    // Price Improvement
    original_price: property.originalPrice,
    price_updated_at: property.priceUpdatedAt,
    price_note: property.priceNote,
    // Featured Ordering
    featured_order: property.featuredOrder,
    // Bilingual: always write _en fields from the primary content
    title_en: property.title,
    description_en: property.description,
    features_en: property.features,
    amenities_en: property.amenities,
    youtube_label_en: property.youtubeLabel,
  };
}

export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(mapDbToProperty);
    },
  });
}

export function usePublicProperties() {
  return useQuery({
    queryKey: ['properties', 'public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('hidden', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(mapDbToProperty);
    },
  });
}

// Check if id looks like a valid UUID
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Legacy ID to property title mapping for backwards compatibility
const LEGACY_PROPERTY_MAP: Record<string, string> = {
  'prop-1': 'Modern Family Home in Escazú Hills',
  'prop-2': 'Oceanfront Villa in Tamarindo',
  'prop-3': 'Charming Condo in Santa Ana',
  'prop-4': 'Development Land in Manuel Antonio',
  'prop-5': 'Contemporary Penthouse in Sabana',
  'prop-6': 'Beachfront Boutique Hotel in Nosara',
};

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      if (!id) return null;

      // If it's a legacy ID, find property by title
      if (!isValidUUID(id) && LEGACY_PROPERTY_MAP[id]) {
        const legacyTitle = LEGACY_PROPERTY_MAP[id];
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .ilike('title', legacyTitle)
          .maybeSingle();
        
        if (error) throw error;
        return data ? mapDbToProperty(data) : null;
      }

      // If it's not a valid UUID and not a known legacy ID, return null
      if (!isValidUUID(id)) {
        return null;
      }

      // Normal UUID lookup
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data ? mapDbToProperty(data) : null;
    },
    enabled: !!id,
  });
}

export function useFeaturedProperties() {
  return useQuery({
    queryKey: ['properties', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('featured', true)
        .eq('hidden', false)
        .order('featured_order', { ascending: true })
        .limit(4);

      if (error) throw error;
      return data.map(mapDbToProperty);
    },
  });
}

export function useAllFeaturedProperties() {
  return useQuery({
    queryKey: ['properties', 'all-featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('featured', true)
        .order('featured_order', { ascending: true });

      if (error) throw error;
      return data.map(mapDbToProperty);
    },
  });
}

export function useUpdateFeaturedOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orders: { id: string; featured_order: number }[]) => {
      for (const { id, featured_order } of orders) {
        const { error } = await supabase
          .from('properties')
          .update({ featured_order })
          .eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

// Fire-and-forget translation of _en → _es fields
function triggerPropertyTranslation(propertyId: string) {
  supabase.functions.invoke('translate-property', {
    body: { propertyId },
  }).then(({ error }) => {
    if (error) console.error('Auto-translate failed:', error);
    else console.log('Auto-translate triggered for', propertyId);
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (property: Partial<Property>) => {
      const { data, error } = await supabase
        .from('properties')
        .insert(mapPropertyToDb(property))
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToProperty(data);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      // Trigger async translation
      triggerPropertyTranslation(result.id);
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...property }: Partial<Property> & { id: string }) => {
      const { data, error } = await supabase
        .from('properties')
        .update(mapPropertyToDb(property))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToProperty(data);
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
      // Trigger async translation
      triggerPropertyTranslation(variables.id);
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useBulkUpdateProperties() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Partial<Property> }) => {
      const { error } = await supabase
        .from('properties')
        .update(mapPropertyToDb(updates))
        .in('id', ids);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
