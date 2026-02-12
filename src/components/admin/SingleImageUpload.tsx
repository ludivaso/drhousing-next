import { useState, useRef } from 'react';
import { Upload, X, Loader2, User, Crop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/imageCompression';
import ImageCropper from './ImageCropper';

interface SingleImageUploadProps {
  imageUrl: string | null;
  onImageChange: (url: string | null) => void;
  bucket: string;
  folder: string;
  placeholder?: React.ReactNode;
  enableCrop?: boolean;
  cropAspectRatio?: number;
  cropCircular?: boolean;
}

export default function SingleImageUpload({ 
  imageUrl, 
  onImageChange, 
  bucket, 
  folder,
  placeholder,
  enableCrop = true,
  cropAspectRatio = 1,
  cropCircular = true,
}: SingleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // If cropping enabled, show cropper first
    if (enableCrop) {
      const imageUrl = URL.createObjectURL(file);
      setPendingImage(imageUrl);
      setCropperOpen(true);
    } else {
      await uploadFile(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);

    try {
      // Compress image before upload (512x512 for avatars)
      const compressedFile = await compressImage(file, 512, 512, 0.85);

      // Generate unique filename
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, compressedFile);

      if (error) {
        console.error('Upload error:', error);
        toast({
          title: 'Upload failed',
          description: 'Failed to upload image.',
          variant: 'destructive',
        });
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onImageChange(urlData.publicUrl);
      toast({
        title: 'Image uploaded',
        description: 'Photo uploaded successfully.',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'An error occurred while uploading.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (pendingImage) {
      URL.revokeObjectURL(pendingImage);
      setPendingImage(null);
    }
    await uploadFile(croppedFile);
  };

  const handleCropperClose = () => {
    if (pendingImage) {
      URL.revokeObjectURL(pendingImage);
      setPendingImage(null);
    }
    setCropperOpen(false);
  };

  const addUrlImage = () => {
    if (urlInput.trim()) {
      onImageChange(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  const removeImage = () => {
    onImageChange(null);
  };

  return (
    <div className="space-y-3">
      {/* Image preview */}
      <div className="relative w-32 h-32 mx-auto">
        {imageUrl ? (
          <div className="relative group w-full h-full">
            <img
              src={imageUrl}
              alt="Uploaded"
              className="w-full h-full object-cover rounded-full border-2 border-border"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-1 -right-1 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-full h-full rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
            {placeholder || <User className="w-12 h-12 text-muted-foreground" />}
          </div>
        )}
      </div>

      {/* Upload controls */}
      <div className="flex flex-col items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              {enableCrop ? <Crop className="w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              {imageUrl ? 'Change Photo' : 'Upload Photo'}
            </>
          )}
        </Button>

        {!showUrlInput ? (
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Or paste URL
          </button>
        ) : (
          <div className="flex gap-2 w-full max-w-xs">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste image URL..."
              className="text-xs"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrlImage())}
            />
            <Button type="button" variant="outline" size="sm" onClick={addUrlImage}>
              Add
            </Button>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {enableCrop ? 'Crop & upload. Max 10MB.' : 'Max 10MB. JPG, PNG, or WebP.'}
      </p>

      {/* Cropper Dialog */}
      {pendingImage && (
        <ImageCropper
          open={cropperOpen}
          onClose={handleCropperClose}
          imageSrc={pendingImage}
          onCropComplete={handleCropComplete}
          aspectRatio={cropAspectRatio}
          circular={cropCircular}
        />
      )}
    </div>
  );
}
