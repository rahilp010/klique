/**
 * PDF Signer Engine
 * 100% Client-side PDF signing and manipulation using pdf-lib.
 */
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Converts a base64 Data URL to a Uint8Array
 */
export const dataUrlToUint8Array = (dataUrl) => {
   const base64 = dataUrl.split(',')[1];
   const binaryString = atob(base64);
   const len = binaryString.length;
   const bytes = new Uint8Array(len);
   for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
   }
   return bytes;
};

/**
 * Inspects a PDF file and returns its page count and dimensions
 */
export const inspectPdfFile = async (pdfFile) => {
   const arrayBuffer = await pdfFile.arrayBuffer();
   const pdfDoc = await PDFDocument.load(arrayBuffer);
   const pages = pdfDoc.getPages();

   const pageDetails = pages.map((page, index) => {
      const { width, height } = page.getSize();
      return {
         pageNumber: index + 1,
         width,
         height,
      };
   });

   return {
      pageCount: pages.length,
      pageDetails,
   };
};

/**
 * Stamps signature and optional text onto selected page of a PDF document
 */
export const stampSignatureOnPdf = async ({
   pdfFile,
   signatureDataUrl,
   pageIndex = 0,
   xPct = 0.5, // 0 to 1 horizontal relative position
   yPct = 0.7, // 0 to 1 vertical relative position from top
   sigWidth = 160,
   sigHeight = 70,
   signerName = '',
   dateStamp = '',
}) => {
   const arrayBuffer = await pdfFile.arrayBuffer();
   const pdfDoc = await PDFDocument.load(arrayBuffer);
   const pages = pdfDoc.getPages();

   const targetPage = pages[Math.max(0, Math.min(pageIndex, pages.length - 1))];
   const { width: pageWidth, height: pageHeight } = targetPage.getSize();

   // Embed the PNG signature
   const pngBytes = dataUrlToUint8Array(signatureDataUrl);
   const signatureImage = await pdfDoc.embedPng(pngBytes);

   // Calculate PDF coordinates (PDF origin is bottom-left)
   // xPct and yPct are percentage from top-left
   const targetX = Math.max(10, Math.min(pageWidth - sigWidth - 10, xPct * pageWidth - sigWidth / 2));
   const screenY = yPct * pageHeight;
   const targetY = Math.max(10, Math.min(pageHeight - sigHeight - 10, pageHeight - screenY - sigHeight / 2));

   // Draw signature image
   targetPage.drawImage(signatureImage, {
      x: targetX,
      y: targetY,
      width: sigWidth,
      height: sigHeight,
   });

   // Optionally draw signer metadata text below signature
   if (signerName || dateStamp) {
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      let textY = targetY - 12;

      if (signerName) {
         targetPage.drawText(`Signed by: ${signerName}`, {
            x: targetX,
            y: textY,
            size: 9,
            font,
            color: rgb(0.2, 0.2, 0.2),
         });
         textY -= 11;
      }

      if (dateStamp) {
         targetPage.drawText(`Date: ${dateStamp}`, {
            x: targetX,
            y: textY,
            size: 8,
            font,
            color: rgb(0.35, 0.35, 0.35),
         });
      }
   }

   // Export signed document bytes
   const pdfBytes = await pdfDoc.save();
   const signedBlob = new Blob([pdfBytes], { type: 'application/pdf' });
   return signedBlob;
};

