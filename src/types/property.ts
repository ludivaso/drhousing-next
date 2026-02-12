// Extended Property Types for enhanced listing form

export type PropertyStatus = 'for_sale' | 'for_rent' | 'both' | 'presale' | 'under_contract' | 'sold' | 'rented';
export type ListingSource = 'direct' | 'colleague' | 'referral' | 'mls';
export type PropertyType = 'house' | 'condo' | 'land' | 'commercial' | 'other';
export type PropertyTier = 'mid' | 'high_end' | 'ultra_luxury';
export type PropertyCondition = 'new' | 'excellent' | 'good' | 'needs_updates';
export type OwnershipType = 'person' | 'company';
export type FurnishedStatus = 'yes' | 'no' | 'partial';
export type PetPolicy = 'allowed' | 'not_allowed' | 'restricted';
export type ParkingType = 'covered' | 'uncovered' | 'street' | 'none';
export type AreaSource = 'owner' | 'municipality' | 'registry' | 'measured';

export interface Property {
  id: string;
  title: string;
  status: PropertyStatus;
  priceSale: number | null;
  priceRentMonthly: number | null;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  garageSpaces: number;
  landSizeSqm: number | null;
  constructionSizeSqm: number | null;
  locationName: string;
  lat: number | null;
  lng: number | null;
  propertyType: PropertyType;
  tier: PropertyTier;
  amenities: string[];
  features: string[];
  description: string;
  images: string[];
  featured: boolean;
  listingAgentId: string | null;
  salesAgentIds: string[];
  createdAt: string;
  updatedAt: string;
  
  // Featured Images (5 main gallery images)
  featuredImages: string[];
  
  // YouTube Video
  youtubeUrl: string | null;
  youtubeEnabled: boolean;
  youtubeLabel: string;
  
  // Property Identity (new)
  buildingName: string | null;
  unitNumber: string | null;
  towerName: string | null;
  floorNumber: number | null;
  internalReference: string | null;
  
  // Property Specs (new)
  yearBuilt: number | null;
  yearRenovated: number | null;
  propertyCondition: PropertyCondition;
  levels: number;
  
  // Areas (new)
  terraceSqm: number | null;
  gardenSqm: number | null;
  storageSqm: number | null;
  areaSource: AreaSource | null;
  
  // Rent Details (new)
  depositAmount: number | null;
  minLeaseMonths: number | null;
  includedServices: string[];
  petPolicy: PetPolicy;
  
  // Sale Details (new)
  hoaMonthly: number | null;
  annualPropertyTax: number | null;
  
  // Legal - Costa Rica (new)
  folioReal: string | null;
  planoCatastrado: string | null;
  ownershipType: OwnershipType;
  condoRegulationsAvailable: boolean;
  hasEncumbrances: boolean;
  encumbrancesNotes: string | null;
  
  // Operations / Marketing (new)
  availabilityDate: string | null;
  furnished: FurnishedStatus;
  appliancesIncluded: string[];
  parkingType: ParkingType | null;
  hasStorage: boolean;
  internalNotes: string | null;

  // Listing Source
  listingSource: ListingSource;

  // Visibility
  hidden: boolean;

  // Price Improvement
  originalPrice: number | null;
  priceUpdatedAt: string | null;
  priceNote: string | null;

  // Featured Ordering
  featuredOrder: number;

  // Bilingual fields
  titleEn: string | null;
  titleEs: string | null;
  descriptionEn: string | null;
  descriptionEs: string | null;
  featuresEn: string[];
  featuresEs: string[];
  amenitiesEn: string[];
  amenitiesEs: string[];
  youtubeLabelEn: string | null;
  youtubeLabelEs: string | null;
}

// Labels
export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  for_sale: 'For Sale',
  for_rent: 'For Rent',
  both: 'Sale & Rent',
  presale: 'Pre-Sale',
  under_contract: 'Under Contract',
  sold: 'Sold',
  rented: 'Rented',
};

export const LISTING_SOURCE_LABELS: Record<ListingSource, string> = {
  direct: 'Direct Listing',
  colleague: 'Colleague',
  referral: 'Referral',
  mls: 'MLS / External',
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  house: 'House',
  condo: 'Condo',
  land: 'Land',
  commercial: 'Commercial',
  other: 'Other',
};

export const PROPERTY_TIER_LABELS: Record<PropertyTier, string> = {
  mid: 'Mid-Range',
  high_end: 'High-End',
  ultra_luxury: 'Luxury',
};

export const PROPERTY_CONDITION_LABELS: Record<PropertyCondition, string> = {
  new: 'New Construction',
  excellent: 'Excellent',
  good: 'Good',
  needs_updates: 'Needs Updates',
};

export const OWNERSHIP_TYPE_LABELS: Record<OwnershipType, string> = {
  person: 'Individual',
  company: 'Corporation/Company',
};

export const FURNISHED_LABELS: Record<FurnishedStatus, string> = {
  yes: 'Fully Furnished',
  no: 'Unfurnished',
  partial: 'Partially Furnished',
};

export const PET_POLICY_LABELS: Record<PetPolicy, string> = {
  allowed: 'Pets Allowed',
  not_allowed: 'No Pets',
  restricted: 'Restricted (case by case)',
};

export const PARKING_TYPE_LABELS: Record<ParkingType, string> = {
  covered: 'Covered Parking',
  uncovered: 'Uncovered Parking',
  street: 'Street Parking',
  none: 'No Parking',
};

export const AREA_SOURCE_LABELS: Record<AreaSource, string> = {
  owner: 'Owner Provided',
  municipality: 'Municipality Records',
  registry: 'Property Registry',
  measured: 'Professionally Measured',
};

// Common included services for rent
export const COMMON_INCLUDED_SERVICES = [
  'hoa',
  'water',
  'electricity',
  'internet',
  'cable',
  'gardening',
  'pool_maintenance',
  'security',
  'trash',
  'gas',
];

// Common appliances
export const COMMON_APPLIANCES = [
  'refrigerator',
  'stove',
  'oven',
  'microwave',
  'dishwasher',
  'washer',
  'dryer',
  'water_heater',
  'air_conditioner',
  'range_hood',
];
