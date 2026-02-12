
-- Phase 1: Add bilingual columns to properties table
-- English columns get existing data; Spanish columns start NULL (to be auto-translated later)

-- Title
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS title_es TEXT;

-- Description
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS description_es TEXT;

-- Features (array)
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS features_en TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS features_es TEXT[] DEFAULT '{}'::TEXT[];

-- Amenities (array)
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS amenities_en TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS amenities_es TEXT[] DEFAULT '{}'::TEXT[];

-- YouTube label
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS youtube_label_en TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS youtube_label_es TEXT;

-- Migrate existing data into _en columns
UPDATE public.properties SET
  title_en = title,
  description_en = description,
  features_en = features,
  amenities_en = amenities,
  youtube_label_en = youtube_label
WHERE title_en IS NULL;
