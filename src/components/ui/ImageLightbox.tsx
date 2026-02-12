import { useState, useCallback, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function ImageLightbox({ images, initialIndex = 0, isOpen, onClose, title }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Touch gesture state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance to trigger navigation (in pixels)
  const minSwipeDistance = 50;

  // Reset state when opening or changing initial index
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setTouchStart(null);
      setTouchEnd(null);
    }
  }, [isOpen, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          resetZoom();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, currentIndex, images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    resetZoom();
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    resetZoom();
  }, [images.length]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.5, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) setPosition({ x: 0, y: 0 });
      return newZoom;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      setTouchEnd(null);
      setIsSwiping(true);
      
      // If zoomed in, also set up for panning
      if (zoom > 1) {
        setIsDragging(true);
        setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchStart) {
      const touch = e.touches[0];
      setTouchEnd({ x: touch.clientX, y: touch.clientY });
      
      // If zoomed in, handle panning
      if (zoom > 1 && isDragging) {
        setPosition({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y,
        });
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsSwiping(false);
      setIsDragging(false);
      return;
    }

    // Only process swipe if not zoomed in
    if (zoom === 1) {
      const distanceX = touchStart.x - touchEnd.x;
      const distanceY = touchStart.y - touchEnd.y;
      const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

      if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
        if (distanceX > 0) {
          // Swiped left - go to next image
          goToNext();
        } else {
          // Swiped right - go to previous image
          goToPrevious();
        }
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
    setIsDragging(false);
  };

  // Double tap to zoom (for mobile)
  const lastTapRef = useRef<number>(0);
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (zoom === 1) {
        setZoom(2);
      } else {
        resetZoom();
      }
    }
    lastTapRef.current = now;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (zoom === 1) {
      setZoom(2);
    } else {
      resetZoom();
    }
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </span>
          {title && (
            <span className="text-sm text-white/70 hidden sm:block">{title}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          <span className="text-sm min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 4}
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={resetZoom}
            disabled={zoom === 1}
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          <div className="w-px h-6 bg-white/30 mx-2" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main image area */}
      <div 
        ref={imageContainerRef}
        className="flex-1 flex items-center justify-center relative overflow-hidden touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleDoubleTap}
      >
        {/* Previous button */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-4 z-10 text-white hover:bg-white/20 h-12 w-12"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
        )}

        {/* Image */}
        <div
          className={cn(
            'max-w-[90%] max-h-[80vh] select-none',
            zoom > 1 ? 'cursor-grab' : 'cursor-zoom-in',
            isDragging && 'cursor-grabbing'
          )}
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
          onDoubleClick={handleDoubleClick}
        >
          <img
            src={images[currentIndex]}
            alt={title ? `${title} - Image ${currentIndex + 1}` : `Image ${currentIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            draggable={false}
          />
        </div>

        {/* Next button */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-4 z-10 text-white hover:bg-white/20 h-12 w-12"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="p-4 flex justify-center gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                resetZoom();
              }}
              className={cn(
                'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0',
                index === currentIndex
                  ? 'border-white opacity-100'
                  : 'border-transparent opacity-50 hover:opacity-80'
              )}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
