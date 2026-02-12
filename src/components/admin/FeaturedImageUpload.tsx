import { useState, useRef } from 'react';
import { Upload, X, Loader2, ImageIcon, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/imageCompression';
import ImageCropper from './ImageCropper';
import { cn } from '@/lib/utils';

interface FeaturedImageUploadProps {
  /** Array of exactly 5 featured image URLs (can have empty strings) */
  images: string[];
  onImagesChange: (images: string[]) => void;
}

const SLOT_LABELS = [
  { label: 'Hero Image (Image 1)', description: 'Main cover image shown large on detail page' },
  { label: 'Image 2', description: 'Top-left grid image' },
  { label: 'Image 3', description: 'Top-right grid image' },
  { label: 'Image 4', description: 'Bottom-left grid image' },
  { label: 'Image 5', description: 'Bottom-right grid image' },
];

export default function FeaturedImageUpload({ images, onImagesChange }: FeaturedImageUploadProps) {
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ url: string; slotIndex: number } | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  // Ensure we always have exactly 5 slots
  const normalizedImages = [...images];
  while (normalizedImages.length < 5) {
    normalizedImages.push('');
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      // Compress image before upload (1920px max for property images)
      const compressedFile = await compressImage(file, 1920, 1920, 0.85);

      // Generate unique filename
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `properties/${fileName}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('property-images')
        .upload(filePath, compressedFile);

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    // Show cropper
    const imageUrl = URL.createObjectURL(file);
    setPendingImage({ url: imageUrl, slotIndex });
    setCropperOpen(true);

    // Reset input
    if (fileInputRefs.current[slotIndex]) {
      fileInputRefs.current[slotIndex]!.value = '';
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (!pendingImage) return;

    const { slotIndex } = pendingImage;
    setUploadingSlot(slotIndex);
    
    // Clean up pending image URL
    URL.revokeObjectURL(pendingImage.url);
    setPendingImage(null);
    setCropperOpen(false);

    const url = await uploadFile(croppedFile);
    
    if (url) {
      const newImages = [...normalizedImages];
      newImages[slotIndex] = url;
      onImagesChange(newImages);
      
      toast({
        title: 'Image uploaded',
        description: `${SLOT_LABELS[slotIndex].label} updated successfully.`,
      });
    } else {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    }
    
    setUploadingSlot(null);
  };

  const handleCropperClose = () => {
    if (pendingImage) {
      URL.revokeObjectURL(pendingImage.url);
      setPendingImage(null);
    }
    setCropperOpen(false);
  };

  const handleRemove = (slotIndex: number) => {
    const newImages = [...normalizedImages];
    newImages[slotIndex] = '';
    onImagesChange(newImages);
  };

  const triggerFileSelect = (slotIndex: number) => {
    fileInputRefs.current[slotIndex]?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Star className="w-4 h-4 text-primary" />
        <span>These 5 images appear in the main gallery on the property page.</span>
      </div>

      {/* Hero Image (larger slot) */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">1</span>
          {SLOT_LABELS[0].label}
          <span className="text-xs font-normal text-muted-foreground ml-2">— {SLOT_LABELS[0].description}</span>
        </label>
        <input
          ref={(el) => (fileInputRefs.current[0] = el)}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e, 0)}
          className="hidden"
        />
        <div
          onClick={() => !uploadingSlot && triggerFileSelect(0)}
          className={cn(
            "relative aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group",
            normalizedImages[0]
              ? "border-border hover:border-primary/50"
              : "border-muted-foreground/30 hover:border-primary/50 bg-muted/30"
          )}
        >
          {uploadingSlot === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : normalizedImages[0] ? (
            <>
              <img
                src={normalizedImages[0]}
                alt="Hero"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerFileSelect(0);
                  }}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Replace
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(0);
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
              <span className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full font-medium">
                HERO
              </span>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
              <span className="text-sm font-medium">Click to upload Hero Image</span>
              <span className="text-xs">Recommended: 16:9 aspect ratio</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid Images (2x2) */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((slotIndex) => (
          <div key={slotIndex} className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center font-semibold">
                {slotIndex + 1}
              </span>
              {SLOT_LABELS[slotIndex].label}
            </label>
            <input
              ref={(el) => (fileInputRefs.current[slotIndex] = el)}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, slotIndex)}
              className="hidden"
            />
            <div
              onClick={() => !uploadingSlot && triggerFileSelect(slotIndex)}
              className={cn(
                "relative aspect-[4/3] rounded-lg border-2 border-dashed transition-all cursor-pointer overflow-hidden group",
                normalizedImages[slotIndex]
                  ? "border-border hover:border-primary/50"
                  : "border-muted-foreground/30 hover:border-primary/50 bg-muted/30"
              )}
            >
              {uploadingSlot === slotIndex ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : normalizedImages[slotIndex] ? (
                <>
                  <img
                    src={normalizedImages[slotIndex]}
                    alt={`Image ${slotIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerFileSelect(slotIndex);
                      }}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(slotIndex);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                  <span className="text-xs">Image {slotIndex + 1}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Empty slots will be auto-filled from the additional gallery below when viewing the property.
      </p>

      {/* Cropper Dialog */}
      {pendingImage && (
        <ImageCropper
          open={cropperOpen}
          onClose={handleCropperClose}
          imageSrc={pendingImage.url}
          onCropComplete={handleCropComplete}
          aspectRatio={pendingImage.slotIndex === 0 ? 16 / 9 : 4 / 3}
        />
      )}
    </div>
  );
}
