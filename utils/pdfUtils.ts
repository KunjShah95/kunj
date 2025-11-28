import { Stroke } from '../types';
import { jsPDF } from 'jspdf';

/**
 * Loads an image from a source string
 */
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Generates a multi-page PDF where each page corresponds to a user's annotated version of the image.
 */
export const generateMultiUserPDF = async (
  imageSrc: string,
  userDrawings: Record<string, Stroke[]>,
  users: string[],
  originalWidth: number,
  originalHeight: number
): Promise<void> => {
  // Determine orientation based on aspect ratio
  const orientation = originalWidth > originalHeight ? 'l' : 'p';
  
  // Initialize PDF with the exact dimensions of the image to maintain quality
  // We use 'px' as unit to match canvas dimensions
  const doc = new jsPDF({
    orientation,
    unit: 'px',
    format: [originalWidth, originalHeight],
    compress: true
  });

  const baseImage = await loadImage(imageSrc);

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const drawings = userDrawings[user] || [];

    // Create a temporary canvas for the FINAL composite
    const canvas = document.createElement('canvas');
    canvas.width = originalWidth;
    canvas.height = originalHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) continue;

    // 1. Draw original image on the main canvas
    ctx.drawImage(baseImage, 0, 0, originalWidth, originalHeight);

    // 2. Create a separate canvas for drawings (strokes layer)
    // We do this to ensure "Eraser" strokes only erase other strokes, 
    // NOT the base image.
    const strokesCanvas = document.createElement('canvas');
    strokesCanvas.width = originalWidth;
    strokesCanvas.height = originalHeight;
    const strokesCtx = strokesCanvas.getContext('2d');

    if (strokesCtx && drawings.length > 0) {
      strokesCtx.lineCap = 'round';
      strokesCtx.lineJoin = 'round';

      drawings.forEach((stroke) => {
        if (stroke.points.length < 2) return;

        strokesCtx.globalCompositeOperation = stroke.isEraser ? 'destination-out' : 'source-over';
        strokesCtx.beginPath();
        strokesCtx.strokeStyle = stroke.color;
        strokesCtx.lineWidth = stroke.width;

        const startX = stroke.points[0].x * originalWidth;
        const startY = stroke.points[0].y * originalHeight;

        strokesCtx.moveTo(startX, startY);

        for (let j = 1; j < stroke.points.length; j++) {
          strokesCtx.lineTo(
            stroke.points[j].x * originalWidth,
            stroke.points[j].y * originalHeight
          );
        }
        strokesCtx.stroke();
      });

      // 3. Draw the strokes layer on top of the base image
      ctx.drawImage(strokesCanvas, 0, 0);
    }

    // 4. Add Watermark/Label for the user (Optional, but good for "Combined PDF")
    ctx.font = `bold ${Math.max(20, originalHeight * 0.05)}px Arial`;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillText(user, 20, Math.max(40, originalHeight * 0.08));

    // 5. Convert to Data URL
    // Use JPEG for better compression if photos, PNG for graphics
    const pageData = canvas.toDataURL('image/jpeg', 0.85);

    // 6. Add to PDF
    if (i > 0) {
      doc.addPage([originalWidth, originalHeight], orientation);
    }
    
    doc.addImage(pageData, 'JPEG', 0, 0, originalWidth, originalHeight);
  }

  doc.save('team-annotations.pdf');
};