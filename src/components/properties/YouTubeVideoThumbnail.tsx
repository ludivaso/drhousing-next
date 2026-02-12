import { useState } from 'react';
import { Play, MapPin } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface YouTubeVideoThumbnailProps {
  youtubeUrl: string;
  label?: string;
  locationOverlay: {
    buildingName?: string | null;
    locationName: string;
  };
  className?: string;
}

/**
 * Extracts YouTube video ID from various URL formats
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Gets the high-quality thumbnail URL for a YouTube video
 */
function getYouTubeThumbnail(videoId: string): string {
  // Try maxresdefault first (highest quality)
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function YouTubeVideoThumbnail({ 
  youtubeUrl, 
  label = 'Video Tour',
  locationOverlay,
  className 
}: YouTubeVideoThumbnailProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  
  const videoId = extractYouTubeId(youtubeUrl);
  
  if (!videoId) return null;
  
  const thumbnailUrl = thumbnailError 
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` 
    : getYouTubeThumbnail(videoId);
  
  // Build location text
  const locationParts: string[] = [];
  if (locationOverlay.buildingName) {
    locationParts.push(locationOverlay.buildingName);
  }
  locationParts.push(locationOverlay.locationName);
  const locationText = locationParts.join(' • ');

  return (
    <>
      <div 
        className={cn(
          "relative aspect-video rounded-xl overflow-hidden cursor-pointer group",
          className
        )}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Thumbnail Image */}
        <img
          src={thumbnailUrl}
          alt={label}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setThumbnailError(true)}
        />
        
        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110">
            <Play className="w-10 h-10 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>
        
        {/* Label Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 bg-background/90 backdrop-blur-sm text-foreground text-sm font-medium rounded-full shadow-lg">
            {label}
          </span>
        </div>
        
        {/* Location Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
          <div className="flex items-center gap-2 text-white">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="font-medium text-sm sm:text-base truncate">
              {locationText}
            </span>
          </div>
        </div>
      </div>
      
      {/* Video Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden bg-black border-none">
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={label}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { extractYouTubeId };
