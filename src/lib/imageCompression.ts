/**
 * Compresses an image file using Canvas API
 * @param file - The image file to compress
 * @param maxWidth - Maximum width (default 1920px)
 * @param maxHeight - Maximum height (default 1920px)
 * @param quality - JPEG quality 0-1 (default 0.8)
 * @returns Compressed file
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.8
): Promise<File> {
  // Skip compression for small files (< 500KB) or non-image files
  if (file.size < 500 * 1024 || !file.type.startsWith('image/')) {
    return file;
  }

  // Skip compression for GIFs (loses animation)
  if (file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      URL.revokeObjectURL(img.src);

      let { width, height } = img;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        resolve(file);
        return;
      }

      // Draw image with white background (for PNGs with transparency)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // Only use compressed version if it's actually smaller
          if (blob.size >= file.size) {
            resolve(file);
            return;
          }

          // Preserve original filename but change extension to jpg
          const originalName = file.name.replace(/\.[^/.]+$/, '');
          const compressedFile = new File([blob], `${originalName}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          console.log(
            `Image compressed: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB (${Math.round((1 - compressedFile.size / file.size) * 100)}% reduction)`
          );

          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve(file); // Fall back to original on error
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Compresses multiple images in parallel
 */
export async function compressImages(
  files: File[],
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.8
): Promise<File[]> {
  return Promise.all(
    files.map((file) => compressImage(file, maxWidth, maxHeight, quality))
  );
}
