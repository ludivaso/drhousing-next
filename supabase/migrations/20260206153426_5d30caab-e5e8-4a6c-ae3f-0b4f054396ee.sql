
-- Hero Media (per-page hero configuration)
CREATE TABLE public.hero_media (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug text NOT NULL UNIQUE,
  media_type text NOT NULL DEFAULT 'video' CHECK (media_type IN ('video', 'image')),
  video_source text NOT NULL DEFAULT 'existing_default' CHECK (video_source IN ('existing_default', 'upload', 'url')),
  video_file text,
  video_url text,
  image_file text,
  poster_image text,
  alt_text text NOT NULL DEFAULT '',
  headline text,
  subheadline text,
  cta_label text,
  cta_url text,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hero_media" ON public.hero_media FOR SELECT USING (true);
CREATE POLICY "Admins can manage hero_media" ON public.hero_media FOR ALL USING (is_admin());

CREATE TRIGGER update_hero_media_updated_at
  BEFORE UPDATE ON public.hero_media
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Hero Global Settings (singleton)
CREATE TABLE public.hero_global_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_height_mode text NOT NULL DEFAULT 'vh' CHECK (hero_height_mode IN ('vh', 'px')),
  hero_height_value numeric NOT NULL DEFAULT 70,
  overlay_enabled boolean NOT NULL DEFAULT true,
  overlay_type text NOT NULL DEFAULT 'gradient' CHECK (overlay_type IN ('solid', 'gradient')),
  overlay_opacity numeric NOT NULL DEFAULT 0.45 CHECK (overlay_opacity >= 0 AND overlay_opacity <= 1),
  gradient_direction text NOT NULL DEFAULT 'to_bottom' CHECK (gradient_direction IN ('to_bottom', 'to_top', 'to_right', 'to_left')),
  gradient_start_color text NOT NULL DEFAULT '#000000',
  gradient_end_color text NOT NULL DEFAULT '#000000',
  gradient_start_stop integer NOT NULL DEFAULT 0 CHECK (gradient_start_stop >= 0 AND gradient_start_stop <= 100),
  gradient_end_stop integer NOT NULL DEFAULT 70 CHECK (gradient_end_stop >= 0 AND gradient_end_stop <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_global_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hero_global_settings" ON public.hero_global_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage hero_global_settings" ON public.hero_global_settings FOR ALL USING (is_admin());

CREATE TRIGGER update_hero_global_settings_updated_at
  BEFORE UPDATE ON public.hero_global_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default global settings singleton
INSERT INTO public.hero_global_settings (hero_height_mode, hero_height_value, overlay_enabled, overlay_type, overlay_opacity, gradient_direction, gradient_start_color, gradient_end_color, gradient_start_stop, gradient_end_stop)
VALUES ('vh', 70, true, 'solid', 0.50, 'to_bottom', '#000000', '#000000', 0, 70);

-- Seed default hero_media for existing pages
INSERT INTO public.hero_media (page_slug, media_type, video_source, alt_text) VALUES
  ('home', 'video', 'existing_default', 'Costa Rica architecture'),
  ('services', 'video', 'existing_default', 'Luxury interior design'),
  ('west-gam-guide', 'video', 'existing_default', 'Luxury Costa Rica architecture with mountain views');

-- Storage bucket for hero uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('hero-media', 'hero-media', true);

CREATE POLICY "Anyone can view hero media files" ON storage.objects FOR SELECT USING (bucket_id = 'hero-media');
CREATE POLICY "Admins can manage hero media files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hero-media' AND public.is_admin());
CREATE POLICY "Admins can update hero media files" ON storage.objects FOR UPDATE USING (bucket_id = 'hero-media' AND public.is_admin());
CREATE POLICY "Admins can delete hero media files" ON storage.objects FOR DELETE USING (bucket_id = 'hero-media' AND public.is_admin());
