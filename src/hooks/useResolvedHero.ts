import { useMemo } from 'react';
import { useHeroMedia, useHeroGlobalSettings, buildOverlayStyle, DEFAULT_VIDEOS, type HeroGlobalSettings } from '@/hooks/useHeroSettings';

// Static imports for existing defaults
import heroHomepageVideo from '@/assets/videos/hero-homepage.mp4';
import heroServicesVideo from '@/assets/videos/hero-services.mp4';
import heroWestGamVideo from '@/assets/videos/hero-west-gam.mp4';
import heroCostaRicaImg from '@/assets/hero-costa-rica.jpg';
import interiorDesignImg from '@/assets/services/interior-design.jpg';
import westGamHeroImg from '@/assets/west-gam-hero.jpg';

const EXISTING_DEFAULTS: Record<string, { video: string; fallback: string; alt: string }> = {
  home: { video: heroHomepageVideo, fallback: heroCostaRicaImg, alt: 'Costa Rica architecture' },
  services: { video: heroServicesVideo, fallback: interiorDesignImg, alt: 'Luxury interior design' },
  'west-gam-guide': { video: heroWestGamVideo, fallback: westGamHeroImg, alt: 'Luxury Costa Rica architecture with mountain views' },
};

export interface ResolvedHeroProps {
  videoSrc: string;
  fallbackImageSrc: string;
  fallbackImageAlt: string;
  heightStyle: React.CSSProperties;
  overlayStyle: React.CSSProperties;
  isLoading: boolean;
  isEnabled: boolean;
  headline: string | null;
  subheadline: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
}

export function useResolvedHero(pageSlug: string): ResolvedHeroProps {
  const { data: media, isLoading: mediaLoading } = useHeroMedia(pageSlug);
  const { data: globalSettings, isLoading: settingsLoading } = useHeroGlobalSettings();

  return useMemo(() => {
    const defaults = EXISTING_DEFAULTS[pageSlug] || EXISTING_DEFAULTS.home;
    const isLoading = mediaLoading || settingsLoading;

    // Resolve media source
    let videoSrc = defaults.video;
    let fallbackImageSrc = defaults.fallback;
    let fallbackImageAlt = defaults.alt;
    let isEnabled = true;

    if (media) {
      isEnabled = media.is_enabled;
      fallbackImageAlt = media.alt_text || defaults.alt;

      if (media.poster_image) fallbackImageSrc = media.poster_image;
      if (media.image_file && media.media_type === 'image') fallbackImageSrc = media.image_file;

      if (media.media_type === 'video') {
        if (media.video_source === 'upload' && media.video_file) {
          videoSrc = media.video_file;
        } else if (media.video_source === 'url' && media.video_url) {
          videoSrc = media.video_url;
        }
        // existing_default keeps the default videoSrc
      } else {
        // image mode — set videoSrc to empty so VideoHero shows fallback
        videoSrc = '';
      }
    }

    // Resolve height — use inline style (dynamic Tailwind classes don't work)
    let heightStyle: React.CSSProperties = { minHeight: '70vh' };
    if (globalSettings) {
      const v = globalSettings.hero_height_value;
      const u = globalSettings.hero_height_mode;
      heightStyle = { minHeight: `${v}${u}` };
    }

    // Resolve overlay
    const overlayStyle = buildOverlayStyle(globalSettings);

    return {
      videoSrc,
      fallbackImageSrc,
      fallbackImageAlt,
      heightStyle,
      overlayStyle,
      isLoading,
      isEnabled,
      headline: media?.headline || null,
      subheadline: media?.subheadline || null,
      ctaLabel: media?.cta_label || null,
      ctaUrl: media?.cta_url || null,
    };
  }, [media, globalSettings, mediaLoading, settingsLoading, pageSlug]);
}

