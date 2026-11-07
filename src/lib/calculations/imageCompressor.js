/**
 * Bulk Image Compressor Utilities
 * 100% Client-side in-browser canvas compression and JSZip batch packaging.
 */
import JSZip from 'jszip';

/**
 * Format bytes into human readable format (KB, MB)
 */
export const formatFileSize = (bytes) => {
   if (!bytes || bytes <= 0) return '0 B';
   const k = 1024;
   const sizes = ['B', 'KB', 'MB', 'GB'];
   const i = Math.floor(Math.log(bytes) / Math.log(k));
   return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Calculates new dimensions keeping aspect ratio within max bounds
 */
export const calculateAspectRatioFit = (srcWidth, srcHeight, maxWidth, maxHeight) => {
   if (!maxWidth && !maxHeight) return { width: srcWidth, height: srcHeight };
   const ratio = Math.min(
      maxWidth ? maxWidth / srcWidth : 1,
      maxHeight ? maxHeight / srcHeight : 1
   );
   return {
      width: Math.round(srcWidth * Math.min(1, ratio)),
      height: Math.round(srcHeight * Math.min(1, ratio)),
   };
};

/**
 * Compresses an image file in-browser using HTML5 Canvas
 */
export const compressImageFile = ({
   file,
   quality = 0.8,
   maxWidth = 1920,
   maxHeight = 1920,
   targetFormat = 'image/webp',
}) => {
   return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
         const img = new Image();
         img.onload = () => {
            try {
               const { width, height } = calculateAspectRatioFit(
                  img.width,
                  img.height,
                  maxWidth,
                  maxHeight
               );

               const canvas = document.createElement('canvas');
               canvas.width = width;
               canvas.height = height;

               const ctx = canvas.getContext('2d');
               if (!ctx) {
                  reject(new Error('Could not get canvas 2d context'));
                  return;
               }

               // Smooth scaling
               ctx.imageSmoothingEnabled = true;
               ctx.imageSmoothingQuality = 'high';

               // If outputting JPEG, fill white background for transparent PNGs
               if (targetFormat === 'image/jpeg') {
                  ctx.fillStyle = '#ffffff';
                  ctx.fillRect(0, 0, width, height);
               }

               ctx.drawImage(img, 0, 0, width, height);

               canvas.toBlob(
                  (blob) => {
                     if (!blob) {
                        reject(new Error('Canvas toBlob failed'));
                        return;
                     }

                     const compressedSize = blob.size;
                     const originalSize = file.size;
                     const savedBytes = Math.max(0, originalSize - compressedSize);
                     const percentageSaved =
                        originalSize > 0
                           ? Math.round((savedBytes / originalSize) * 100)
                           : 0;

                     // Determine extension
                     let ext = 'webp';
                     if (targetFormat === 'image/jpeg') ext = 'jpg';
                     else if (targetFormat === 'image/png') ext = 'png';

                     const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                     const fileName = `${baseName}-compressed.${ext}`;

                     resolve({
                        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                        name: fileName,
                        originalName: file.name,
                        blob,
                        previewUrl: URL.createObjectURL(blob),
                        originalSize,
                        compressedSize,
                        percentageSaved,
                        width,
                        height,
                        originalWidth: img.width,
                        originalHeight: img.height,
                        format: targetFormat,
                     });
                  },
                  targetFormat,
                  quality
               );
            } catch (err) {
               reject(err);
            }
         };

         img.onerror = () => reject(new Error('Failed to load image into canvas'));
         img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
   });
};

/**
 * Packages all compressed files into a single ZIP archive for one-click bulk download
 */
export const createZipArchive = async (compressedItems = [], zipName = 'klique-compressed-images.zip') => {
   const zip = new JSZip();

   compressedItems.forEach((item) => {
      zip.file(item.name, item.blob);
   });

   const content = await zip.generateAsync({ type: 'blob' });
   const downloadUrl = URL.createObjectURL(content);

   const a = document.createElement('a');
   a.href = downloadUrl;
   a.download = zipName;
   document.body.appendChild(a);
   a.click();
   document.body.removeChild(a);
   setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
};

