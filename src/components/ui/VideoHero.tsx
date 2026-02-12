import { ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import { Play } from 'lucide-react';

interface VideoHeroProps {
  videoSrc: string;
  fallbackImageSrc: string;
  fallbackImageAlt: string;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  overlayStyle?: React.CSSProperties;
  heightStyle?: React.CSSProperties;
  showGrid?: boolean;
  /** @deprecated No longer used — video now plays on all devices */
  staticOnMobile?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
}

export function VideoHero({
  videoSrc,
  fallbackImageSrc,
  fallbackImageAlt,
  children,
  className = '',
  overlayClassName = 'bg-black/50',
  overlayStyle,
  heightStyle,
  showGrid = true,
  preload = 'metadata',
}: VideoHeroProps) {
  const [videoError, setVideoError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasVideo = !!videoSrc && !videoError;

  // Intersection Observer — lazy load video
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', threshold: 0.01 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Attempt autoplay once video can play
  const attemptPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setVideoLoaded(true);
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay blocked (mobile policy) — show tap overlay
        setNeedsTap(true);
      });
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isInView || !hasVideo) return;

    const handleCanPlay = () => attemptPlay();

    video.addEventListener('canplay', handleCanPlay);

    // Already loaded (cached)
    if (video.readyState >= 3) {
      attemptPlay();
    }

    return () => video.removeEventListener('canplay', handleCanPlay);
  }, [isInView, hasVideo, attemptPlay]);

  // Tap-to-play handler
  const handleTapToPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().then(() => {
      setNeedsTap(false);
      setVideoLoaded(true);
    }).catch(() => {
      // Truly blocked — fall back to image
      setVideoError(true);
      setNeedsTap(false);
    });
  }, []);

  return (
    <section ref={containerRef} className={`relative flex items-center overflow-hidden ${className}`} style={heightStyle || { minHeight: '85vh' }}>
      <div className="absolute inset-0">
        {/* Fallback / poster image */}
        <img
          src={fallbackImageSrc}
          alt={fallbackImageAlt}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            videoLoaded && hasVideo ? 'opacity-0' : 'opacity-100'
          }`}
          loading="eager"
        />

        {/* Video — loads when in viewport */}
        {isInView && hasVideo && (
          <video
            ref={videoRef}
            muted
            autoPlay
            loop
            playsInline
            preload={preload}
            poster={fallbackImageSrc}
            onError={() => setVideoError(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}

        {/* Tap-to-play overlay (mobile fallback) */}
        {needsTap && hasVideo && (
          <button
            onClick={handleTapToPlay}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 cursor-pointer"
            aria-label="Tap to play video"
          >
            <div className="w-16 h-16 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Play className="w-7 h-7 text-foreground ml-0.5" />
            </div>
          </button>
        )}

        {/* Overlay */}
        <div className={`absolute inset-0 ${overlayStyle ? '' : overlayClassName}`} style={overlayStyle || undefined} />

        {/* Grid */}
        {showGrid && (
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }}
          />
        )}
      </div>

      <div className="container-wide relative z-10">
        {children}
      </div>
    </section>
  );
}