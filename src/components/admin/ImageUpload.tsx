import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Plus, Link, FolderOpen, GripVertical, Crop } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/imageCompression';
import ImageCropper from './ImageCropper';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  enableCrop?: boolean;
  cropAspectRatio?: number;
}

export default function ImageUpload({ 
  images, 
  onImagesChange,
  enableCrop = true,
  cropAspectRatio = 16 / 9,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [pendingImages, setPendingImages] = useState<{ file: File; url: string }[]>([]);
  const [currentCropIndex, setCurrentCropIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      // Compress image before upload
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

  const uploadFiles = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImageUrls: string[] = [];

    try {
      for (const file of files) {
        const url = await uploadFile(file);
        if (url) {
          newImageUrls.push(url);
        }
      }

      if (newImageUrls.length > 0) {
        onImagesChange([...images, ...newImageUrls]);
        toast({
          title: t('admin.imageUpload.uploadSuccess'),
          description: `${newImageUrls.length} ${t('admin.imageUpload.imagesUploaded')}`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: t('admin.imageUpload.uploadFailed'),
        description: t('admin.imageUpload.errorOccurred'),
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [images, onImagesChange, t, toast]);

  const validateAndPrepareFiles = (fileList: FileList | File[]): { file: File; url: string }[] => {
    const validFiles: { file: File; url: string }[] = [];

    for (const file of Array.from(fileList)) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('admin.imageUpload.invalidType'),
          description: `${file.name} ${t('admin.imageUpload.notImage')}`,
          variant: 'destructive',
        });
        continue;
      }

      // Validate file size (max 10MB before compression)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: t('admin.imageUpload.tooLarge'),
          description: `${file.name} ${t('admin.imageUpload.exceedsLimit')}`,
          variant: 'destructive',
        });
        continue;
      }

      validFiles.push({
        file,
        url: URL.createObjectURL(file),
      });
    }

    return validFiles;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (enableCrop) {
      const prepared = validateAndPrepareFiles(files);
      if (prepared.length > 0) {
        setPendingImages(prepared);
        setCurrentCropIndex(0);
        setCropperOpen(true);
      }
    } else {
      const validFiles = validateAndPrepareFiles(files).map(p => p.file);
      await uploadFiles(validFiles);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    // Upload the cropped file
    setIsUploading(true);
    const url = await uploadFile(croppedFile);
    setIsUploading(false);

    if (url) {
      onImagesChange([...images, url]);
      toast({
        title: t('admin.imageUpload.uploadSuccess'),
        description: t('admin.imageCropper.imageCropped'),
      });
    }

    // Move to next image or close
    const nextIndex = currentCropIndex + 1;
    if (nextIndex < pendingImages.length) {
      setCurrentCropIndex(nextIndex);
    } else {
      cleanupPendingImages();
    }
  };

  const cleanupPendingImages = () => {
    pendingImages.forEach(p => URL.revokeObjectURL(p.url));
    setPendingImages([]);
    setCurrentCropIndex(0);
    setCropperOpen(false);
  };

  const handleCropperClose = () => {
    // Skip current image and move to next, or close if done
    const nextIndex = currentCropIndex + 1;
    if (nextIndex < pendingImages.length) {
      setCurrentCropIndex(nextIndex);
    } else {
      cleanupPendingImages();
    }
  };

  // File drop zone handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (enableCrop) {
        const prepared = validateAndPrepareFiles(files);
        if (prepared.length > 0) {
          setPendingImages(prepared);
          setCurrentCropIndex(0);
          setCropperOpen(true);
        }
      } else {
        const validFiles = validateAndPrepareFiles(files).map(p => p.file);
        await uploadFiles(validFiles);
      }
    }
  }, [enableCrop, uploadFiles]);

  // Image reorder handlers
  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleImageDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleImageDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedImage);
    
    onImagesChange(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);

    toast({
      title: t('admin.imageUpload.reorderSuccess'),
      description: targetIndex === 0 
        ? t('admin.imageUpload.setCover') 
        : t('admin.imageUpload.imagesMoved'),
    });
  };

  const addUrlImage = () => {
    if (urlInput.trim()) {
      onImagesChange([...images, urlInput.trim()]);
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const setAsCover = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const [selectedImage] = newImages.splice(index, 1);
    newImages.unshift(selectedImage);
    onImagesChange(newImages);
    toast({
      title: t('admin.imageUpload.reorderSuccess'),
      description: t('admin.imageUpload.setCover'),
    });
  };

  const currentPendingImage = pendingImages[currentCropIndex];

  return (
    <div className="space-y-4">
      {/* Main upload area with drag-and-drop */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.02]'
            : 'border-border bg-muted/30 hover:bg-muted/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <FolderOpen className={`w-12 h-12 mx-auto mb-3 transition-colors ${
          isDragging ? 'text-primary' : 'text-muted-foreground'
        }`} />
        
        <h3 className={`font-medium mb-1 transition-colors ${
          isDragging ? 'text-primary' : 'text-foreground'
        }`}>
          {isDragging ? t('admin.imageUpload.dropHere') : t('admin.imageUpload.dragDrop')}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {enableCrop 
            ? t('admin.imageUpload.cropEnabled')
            : t('admin.imageUpload.supportedFormats')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            size="lg"
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('admin.imageUpload.uploading')}
              </>
            ) : (
              <>
                {enableCrop ? <Crop className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                {t('admin.imageUpload.browseFiles')}
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="gap-2"
          >
            <Link className="w-5 h-5" />
            {t('admin.imageUpload.pasteUrl')}
          </Button>
        </div>
      </div>

      {/* URL input (collapsible) */}
      {showUrlInput && (
        <div className="flex gap-2 p-4 bg-muted/30 rounded-lg border border-border">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={t('admin.imageUpload.urlPlaceholder')}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrlImage())}
          />
          <Button type="button" onClick={addUrlImage} disabled={!urlInput.trim()}>
            <Plus className="w-4 h-4 mr-1" />
            {t('admin.imageUpload.add')}
          </Button>
        </div>
      )}

      {/* Image preview grid with reordering */}
      {images.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            {t('admin.imageUpload.reorderHint')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((url, index) => (
              <div
                key={`${url}-${index}`}
                draggable
                onDragStart={(e) => handleImageDragStart(e, index)}
                onDragEnd={handleImageDragEnd}
                onDragOver={(e) => handleImageDragOver(e, index)}
                onDragLeave={handleImageDragLeave}
                onDrop={(e) => handleImageDrop(e, index)}
                className={`relative group aspect-video cursor-grab active:cursor-grabbing transition-all duration-200 ${
                  draggedIndex === index ? 'opacity-50 scale-95' : ''
                } ${
                  dragOverIndex === index 
                    ? 'ring-2 ring-primary ring-offset-2 scale-105' 
                    : ''
                }`}
              >
                <img
                  src={url}
                  alt={`${t('admin.imageUpload.propertyImage')} ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-border pointer-events-none"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                
                {/* Drag handle indicator */}
                <div className="absolute top-2 left-2 p-1 bg-background/80 backdrop-blur-sm rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>
                
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Set as cover button (for non-first images) */}
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => setAsCover(index)}
                    className="absolute bottom-2 right-2 px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-secondary/80"
                  >
                    {t('admin.imageUpload.setAsCover')}
                  </button>
                )}

                {/* Cover badge */}
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                    {t('admin.imageUpload.cover')}
                  </span>
                )}

                {/* Position number */}
                <span className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-background/80 backdrop-blur-sm text-foreground text-xs rounded-full font-medium">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        {t('admin.imageUpload.hint')}
      </p>

      {/* Cropper Dialog */}
      {currentPendingImage && (
        <ImageCropper
          open={cropperOpen}
          onClose={handleCropperClose}
          imageSrc={currentPendingImage.url}
          onCropComplete={handleCropComplete}
          aspectRatio={cropAspectRatio}
        />
      )}
    </div>
  );
}
