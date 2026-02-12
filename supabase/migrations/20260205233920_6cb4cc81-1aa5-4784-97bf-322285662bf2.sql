-- Add new columns to properties table for enhanced listing form

-- Property Identity
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS building_name TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS unit_number TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS tower_name TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS floor_number INTEGER;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS internal_reference TEXT;

-- Property Specs
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS year_built INTEGER;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS year_renovated INTEGER;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS property_condition TEXT DEFAULT 'good';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS levels INTEGER DEFAULT 1;

-- Areas (sqm)
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS terrace_sqm NUMERIC;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS garden_sqm NUMERIC;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS storage_sqm NUMERIC;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS area_source TEXT;

-- Rent Details
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS min_lease_months INTEGER;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS included_services TEXT[] DEFAULT '{}';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS pet_policy TEXT DEFAULT 'not_allowed';

-- Sale Details
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS hoa_monthly NUMERIC;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS annual_property_tax NUMERIC;

-- Legal (Costa Rica)
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS folio_real TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS plano_catastrado TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS ownership_type TEXT DEFAULT 'person';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS condo_regulations_available BOOLEAN DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS has_encumbrances BOOLEAN DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS encumbrances_notes TEXT;

-- Operations / Marketing
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS availability_date DATE;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS furnished TEXT DEFAULT 'no';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS appliances_included TEXT[] DEFAULT '{}';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS parking_type TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS has_storage BOOLEAN DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Add indexes for commonly queried new fields
CREATE INDEX IF NOT EXISTS idx_properties_building_name ON public.properties(building_name);
CREATE INDEX IF NOT EXISTS idx_properties_year_built ON public.properties(year_built);
CREATE INDEX IF NOT EXISTS idx_properties_availability_date ON public.properties(availability_date);