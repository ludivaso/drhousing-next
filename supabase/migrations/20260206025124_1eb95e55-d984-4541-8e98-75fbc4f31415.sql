-- Add YouTube video fields to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS youtube_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS youtube_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS youtube_label TEXT DEFAULT 'Video Tour';

-- Add featured_images array to store the 5 main gallery images separately
-- This allows us to have explicit control over hero + grid images
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS featured_images TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.properties.youtube_url IS 'YouTube video URL for property video tour';
COMMENT ON COLUMN public.properties.youtube_enabled IS 'Toggle to show/hide video on property page';
COMMENT ON COLUMN public.properties.youtube_label IS 'Custom label for video (default: Video Tour)';
COMMENT ON COLUMN public.properties.featured_images IS 'Array of 5 featured image URLs: [0]=Hero, [1-4]=Grid images';