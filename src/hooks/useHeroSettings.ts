import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Default video mapping for existing_default sources
const DEFAULT_VIDEOS: Record<string, { video: string; fallback: string; alt: string }> = {
  home: {
    video: '/src/assets/videos/hero-homepage.mp4',
    fallback: '/src/assets/hero-costa-rica.jpg',
    alt: 'Costa Rica architecture',
  },
  services: {
    video: '/src/assets/videos/hero-services.mp4',
    fallback: '/src/assets/services/interior-design.jpg',
    alt: 'Luxury interior design',
  },
  'west-gam-guide': {
    video: '/src/assets/videos/hero-west-gam.mp4',
    fallback: '/src/assets/west-gam-hero.jpg',
    alt: 'Luxury Costa Rica architecture with mountain views',
  },
};

export interface HeroMedia {
  id: string;
  page_slug: string;
  media_type: 'video' | 'image';
  video_source: 'existing_default' | 'upload' | 'url';
  video_file: string | null;
  video_url: string | null;
  image_file: string | null;
  poster_image: string | null;
  alt_text: string;
  headline: string | null;
  subheadline: string | null;
  cta_label: string | null;
  cta_url: string | null;
  is_enabled: boolean;
}

export interface HeroGlobalSettings {
  id: string;
  hero_height_mode: 'vh' | 'px';
  hero_height_value: number;
  overlay_enabled: boolean;
  overlay_type: 'solid' | 'gradient';
  overlay_opacity: number;
  gradient_direction: 'to_bottom' | 'to_top' | 'to_right' | 'to_left';
  gradient_start_color: string;
  gradient_end_color: string;
  gradient_start_stop: number;
  gradient_end_stop: number;
}

const DEFAULT_GLOBAL_SETTINGS: Omit<HeroGlobalSettings, 'id'> = {
  hero_height_mode: 'vh',
  hero_height_value: 70,
  overlay_enabled: true,
  overlay_type: 'solid',
  overlay_opacity: 0.5,
  gradient_direction: 'to_bottom',
  gradient_start_color: '#000000',
  gradient_end_color: '#000000',
  gradient_start_stop: 0,
  gradient_end_stop: 70,
};

// Fetch global settings singleton
export function useHeroGlobalSettings() {
  return useQuery({
    queryKey: ['hero-global-settings'],
    queryFn: async (): Promise<HeroGlobalSettings> => {
      const { data, error } = await supabase
        .from('hero_global_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return { id: '', ...DEFAULT_GLOBAL_SETTINGS };

      return {
        id: data.id,
        hero_height_mode: data.hero_height_mode as 'vh' | 'px',
        hero_height_value: Number(data.hero_height_value),
        overlay_enabled: data.overlay_enabled,
        overlay_type: data.overlay_type as 'solid' | 'gradient',
        overlay_opacity: Number(data.overlay_opacity),
        gradient_direction: data.gradient_direction as HeroGlobalSettings['gradient_direction'],
        gradient_start_color: data.gradient_start_color,
        gradient_end_color: data.gradient_end_color,
        gradient_start_stop: data.gradient_start_stop,
        gradient_end_stop: data.gradient_end_stop,
      };
    },
  });
}

// Fetch hero media for a specific page
export function useHeroMedia(pageSlug: string) {
  return useQuery({
    queryKey: ['hero-media', pageSlug],
    queryFn: async (): Promise<HeroMedia | null> => {
      const { data, error } = await supabase
        .from('hero_media')
        .select('*')
        .eq('page_slug', pageSlug)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return data as unknown as HeroMedia;
    },
  });
}

// Fetch all hero media entries (for admin)
export function useAllHeroMedia() {
  return useQuery({
    queryKey: ['hero-media'],
    queryFn: async (): Promise<HeroMedia[]> => {
      const { data, error } = await supabase
        .from('hero_media')
        .select('*')
        .order('page_slug');

      if (error) throw error;
      return (data || []) as unknown as HeroMedia[];
    },
  });
}

// Update global settings
export function useUpdateHeroGlobalSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<HeroGlobalSettings> & { id: string }) => {
      const { id, ...updates } = settings;
      const { error } = await supabase
        .from('hero_global_settings')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-global-settings'] });
    },
  });
}

// Upsert hero media for a page
export function useUpsertHeroMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (media: Partial<HeroMedia> & { page_slug: string }) => {
      const { error } = await supabase
        .from('hero_media')
        .upsert(media as any, { onConflict: 'page_slug' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-media'] });
    },
  });
}

// Helper: Build overlay style from global settings
export function buildOverlayStyle(settings: HeroGlobalSettings | undefined) {
  if (!settings || !settings.overlay_enabled) return { background: 'transparent' };

  if (settings.overlay_type === 'solid') {
    return { background: hexToRgba(settings.gradient_start_color, settings.overlay_opacity) };
  }

  const dirMap: Record<string, string> = {
    to_bottom: 'to bottom',
    to_top: 'to top',
    to_right: 'to right',
    to_left: 'to left',
  };

  const dir = dirMap[settings.gradient_direction] || 'to bottom';
  const startColor = hexToRgba(settings.gradient_start_color, settings.overlay_opacity);
  const endColor = hexToRgba(settings.gradient_end_color, settings.overlay_opacity * 0.3);

  return {
    background: `linear-gradient(${dir}, ${startColor} ${settings.gradient_start_stop}%, ${endColor} ${settings.gradient_end_stop}%)`,
  };
}

// Helper: Build height class string from global settings
export function buildHeightStyle(settings: HeroGlobalSettings | undefined) {
  if (!settings) return 'min-h-[70vh]';
  const unit = settings.hero_height_mode;
  const value = settings.hero_height_value;
  return `min-h-[${value}${unit}]`;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export { DEFAULT_VIDEOS };
