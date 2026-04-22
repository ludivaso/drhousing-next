-- Interior Design: projects + catalog items

-- ── interior_projects ────────────────────────────────────────────────────────
-- Each project has a cover image, optional before/after pairs for the slider,
-- and a gallery of additional images.

CREATE TABLE IF NOT EXISTS public.interior_projects (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text        NOT NULL,
  description         text,
  cover               text,
  before_after_pairs  jsonb       NOT NULL DEFAULT '[]',
  gallery             text[]      NOT NULL DEFAULT '{}',
  category            text,
  display_order       int,
  published           boolean     NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_interior_projects_updated_at
  BEFORE UPDATE ON public.interior_projects
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ── catalog_items ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.catalog_items (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL,
  description   text,
  image         text,
  category      text        CHECK (category IN ('furniture','finishes','lighting','other')),
  price         numeric,
  published     boolean     NOT NULL DEFAULT true,
  display_order int,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_catalog_items_updated_at
  BEFORE UPDATE ON public.catalog_items
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.interior_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interior_projects public read"
  ON public.interior_projects FOR SELECT USING (published = true);

CREATE POLICY "interior_projects authenticated all"
  ON public.interior_projects FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "catalog_items public read"
  ON public.catalog_items FOR SELECT USING (published = true);

CREATE POLICY "catalog_items authenticated all"
  ON public.catalog_items FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
