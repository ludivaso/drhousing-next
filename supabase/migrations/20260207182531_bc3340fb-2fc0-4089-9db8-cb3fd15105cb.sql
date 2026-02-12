-- Add listing_source column to track whether a property is our direct listing or from a colleague
ALTER TABLE public.properties
ADD COLUMN listing_source text NOT NULL DEFAULT 'direct';

-- Add an index for filtering by source
CREATE INDEX idx_properties_listing_source ON public.properties(listing_source);