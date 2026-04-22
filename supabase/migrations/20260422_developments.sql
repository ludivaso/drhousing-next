-- Developments: project-level real-estate developments
-- Individual units can be tagged to a parent development via the FK on properties.

CREATE TABLE IF NOT EXISTS public.developments (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text        UNIQUE NOT NULL,
  name_en         text        NOT NULL,
  name_es         text,
  subtitle_en     text,
  subtitle_es     text,
  description_en  text,
  description_es  text,
  location        text,
  zone            text,
  status          text        NOT NULL DEFAULT 'pre_sale'
                              CHECK (status IN ('pre_sale','in_construction','delivered','sold_out')),
  delivery_date   date,
  price_from      numeric,
  price_to        numeric,
  unit_count      int,
  unit_types      jsonb       NOT NULL DEFAULT '[]',
  amenities       text[]      NOT NULL DEFAULT '{}',
  hero_image      text,
  gallery         text[]      NOT NULL DEFAULT '{}',
  developer_name  text,
  brochure_url    text,
  video_url       text,
  coordinates     jsonb,
  featured        boolean     NOT NULL DEFAULT false,
  display_order   int,
  published       boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_developments_updated_at
  BEFORE UPDATE ON public.developments
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Optional FK so individual property listings can belong to a development
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS development_id uuid
  REFERENCES public.developments(id) ON DELETE SET NULL;

-- ── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.developments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "developments public read"
  ON public.developments FOR SELECT
  USING (published = true);

CREATE POLICY "developments authenticated write"
  ON public.developments FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- Allow authenticated users to read unpublished too (admin needs full list)
CREATE POLICY "developments authenticated read all"
  ON public.developments FOR SELECT
  TO authenticated
  USING (true);
