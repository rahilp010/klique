/**
 * Image to Text (OCR) Engine
 * 100% Client-side Optical Character Recognition powered by Tesseract.js Wasm.
 */
import { createWorker } from 'tesseract.js';

export const OCR_LANGUAGES = [
   { code: 'eng', name: 'English' },
   { code: 'spa', name: 'Spanish (Español)' },
   { code: 'fra', name: 'French (Français)' },
   { code: 'deu', name: 'German (Deutsch)' },
   { code: 'hin', name: 'Hindi (हिन्दी)' },
];

/**
 * Preprocesses an image on canvas with optional contrast boost and grayscale
 * to improve OCR recognition rates on scans and phone snapshots.
 */
export const preprocessImage = (imageElement, { grayscale = true, contrast = 1.2 } = {}) => {
   const canvas = document.createElement('canvas');
   canvas.width = imageElement.naturalWidth || imageElement.width;
   canvas.height = imageElement.naturalHeight || imageElement.height;
   const ctx = canvas.getContext('2d');
   if (!ctx) return imageElement.src;

   ctx.drawImage(imageElement, 0, 0);

   if (grayscale || contrast !== 1) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));

      for (let i = 0; i < data.length; i += 4) {
         let r = data[i];
         let g = data[i + 1];
         let b = data[i + 2];

         if (grayscale) {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            r = gray;
            g = gray;
            b = gray;
         }

         if (contrast !== 1) {
            r = Math.min(255, Math.max(0, factor * (r - 128) + 128));
            g = Math.min(255, Math.max(0, factor * (g - 128) + 128));
            b = Math.min(255, Math.max(0, factor * (b - 128) + 128));
         }

         data[i] = r;
         data[i + 1] = g;
         data[i + 2] = b;
      }

      ctx.putImageData(imgData, 0, 0);
   }

   return canvas.toDataURL('image/png');
};

/**
 * Executes Optical Character Recognition on an image file or URL
 */
export const performOCR = async ({
   imageSource,
   language = 'eng',
   onProgress = () => {},
}) => {
   const worker = await createWorker(language, 1, {
      logger: (m) => {
         if (m.status && typeof m.progress === 'number') {
            onProgress({
               status: m.status,
               progress: Math.round(m.progress * 100),
            });
         }
      },
   });

   try {
      const ret = await worker.recognize(imageSource);
      const text = ret.data.text || '';
      const confidence = Math.round(ret.data.confidence || 0);

      const wordsCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      const charactersCount = text.length;
      const linesCount = text ? text.split('\n').filter((l) => l.trim().length > 0).length : 0;

      await worker.terminate();

      return {
         text,
         confidence,
         wordsCount,
         charactersCount,
         linesCount,
      };
   } catch (err) {
      await worker.terminate();
      throw err;
   }
};

