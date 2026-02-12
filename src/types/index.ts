// DR Housing Data Models

// Re-export property types from dedicated module
export * from './property';

// Import types for use in this file
import type { PropertyStatus, PropertyType, PropertyTier } from './property';

export type AgentRole = 'listing_agent' | 'sales_rep' | 'admin';

export interface Agent {
  id: string;
  fullName: string;
  role: AgentRole;
  bio: string;
  phone: string;
  email: string;
  photoUrl: string | null;
  languages: string[];
  serviceAreas: string[];
  activePropertyIds: string[];
}

export type LeadType = 
  | 'relocation' 
  | 'investor' 
  | 'property_management' 
  | 'development' 
  | 'legal_immigration' 
  | 'family_affairs' 
  | 'general';

export type PreferredContactMethod = 'email' | 'phone' | 'whatsapp';

export type Timeline = 'asap' | '1_3_months' | '3_6_months' | '6_12_months' | 'exploring';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'negotiating' | 'closed_won' | 'closed_lost' | 'archived';

export interface Lead {
  id: string;
  leadType: LeadType;
  fullName: string;
  email: string;
  phone: string;
  preferredContactMethod: PreferredContactMethod;
  countryOfOrigin: string | null;
  timeline: Timeline;
  budgetMin: number | null;
  budgetMax: number | null;
  interestedAreas: string[];
  interestedPropertyType: string | null;
  propertyId: string | null;
  message: string | null;
  notes: string | null;
  status: LeadStatus;
  assignedAgentId: string | null;
  lastContactedAt: string | null;
  createdAt: string;
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  negotiating: 'Negotiating',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
  archived: 'Archived',
};

// UI Helper types
export interface PropertyFilters {
  status: PropertyStatus | 'all';
  propertyType: PropertyType | 'all';
  tier: PropertyTier | 'all';
  bedroomsMin: number | null;
  bathroomsMin: number | null;
  priceMin: number | null;
  priceMax: number | null;
  searchQuery: string;
}

export const DEFAULT_FILTERS: PropertyFilters = {
  status: 'all',
  propertyType: 'all',
  tier: 'all',
  bedroomsMin: null,
  bathroomsMin: null,
  priceMin: null,
  priceMax: null,
  searchQuery: '',
};

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  relocation: 'Family Relocation',
  investor: 'Investment Advisory',
  property_management: 'Property Oversight',
  development: 'Development & Remodeling',
  legal_immigration: 'Legal & Residency',
  family_affairs: 'Private Advisory',
  general: 'General Inquiry',
};

export const TIMELINE_LABELS: Record<Timeline, string> = {
  asap: 'As soon as possible',
  '1_3_months': '1-3 months',
  '3_6_months': '3-6 months',
  '6_12_months': '6-12 months',
  exploring: 'Just exploring',
};

export const CONTACT_METHOD_LABELS: Record<PreferredContactMethod, string> = {
  email: 'Email',
  phone: 'Phone Call',
  whatsapp: 'WhatsApp',
};
