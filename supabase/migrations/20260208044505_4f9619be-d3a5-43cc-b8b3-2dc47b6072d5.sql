
-- Part 1: Price improvement fields
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS original_price numeric;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS price_updated_at timestamp with time zone;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS price_note text;

-- Part 2: Featured ordering
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS featured_order integer DEFAULT 0;

-- Index for featured ordering
CREATE INDEX IF NOT EXISTS idx_properties_featured_order ON public.properties (featured, featured_order ASC);
