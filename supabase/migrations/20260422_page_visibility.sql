-- Page visibility + preview PIN
-- A 1:1 admin tool for gating work-in-progress pages behind a shared PIN.

-- ── page_visibility ─────────────────────────────────────────────────────────
-- One row per managed path. Default behavior: paths not listed are public.
-- Rows exist only for paths that have been explicitly toggled.

CREATE TABLE IF NOT EXISTS public.page_visibility (
  path        text PRIMARY KEY,
  status      text NOT NULL CHECK (status IN ('public', 'private')),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_page_visibility_updated_at
  BEFORE UPDATE ON public.page_visibility
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ── preview_pin ─────────────────────────────────────────────────────────────
-- Single-row table holding the current PIN hash. `id = 1` convention.

CREATE TABLE IF NOT EXISTS public.preview_pin (
  id          int PRIMARY KEY DEFAULT 1,
  pin_hash    text,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT preview_pin_singleton CHECK (id = 1)
);

INSERT INTO public.preview_pin (id, pin_hash) VALUES (1, NULL)
ON CONFLICT (id) DO NOTHING;

CREATE TRIGGER update_preview_pin_updated_at
  BEFORE UPDATE ON public.preview_pin
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ── RLS ─────────────────────────────────────────────────────────────────────
-- page_visibility: anyone can read (middleware needs it on every request).
-- preview_pin:     only authenticated admins can read/write the hash.

ALTER TABLE public.page_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preview_pin     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_visibility read for everyone"
  ON public.page_visibility FOR SELECT
  USING (true);

CREATE POLICY "page_visibility write for authenticated"
  ON public.page_visibility FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "preview_pin read for authenticated"
  ON public.preview_pin FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "preview_pin write for authenticated"
  ON public.preview_pin FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);
