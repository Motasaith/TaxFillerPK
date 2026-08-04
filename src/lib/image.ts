/**
 * Image preparation for document reading.
 *
 * Tesseract wants a flat, high contrast page at roughly 300 DPI. A phone photo
 * of a notice is none of those things, so everything here exists to close that
 * gap: correct the rotation the camera recorded, scale to a useful size, drop
 * to grey, then threshold locally so a shadow across one corner does not swallow
 * the text under it.
 */

/** Long edge fed to the OCR engine. Below about 1600 accuracy falls away. */
const OCR_LONG_EDGE = 2400;
/** Long edge sent to a vision model. Detail beyond this buys nothing. */
const VISION_LONG_EDGE = 1600;

export interface PreparedImage {
  /** Cleaned up page for the OCR engine. */
  ocr: Blob;
  /** Compact JPEG of the original, base64 without the data prefix. */
  vision: string;
  width: number;
  height: number;
}

async function decode(source: Blob): Promise<ImageBitmap> {
  // Phone cameras record orientation in EXIF rather than rotating the pixels.
  return createImageBitmap(source, { imageOrientation: 'from-image' });
}

function canvasFor(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

function scaleTo(bitmap: ImageBitmap | HTMLCanvasElement, longEdge: number) {
  const w = 'width' in bitmap ? bitmap.width : 0;
  const h = 'height' in bitmap ? bitmap.height : 0;
  const factor = longEdge / Math.max(w, h);
  const canvas = canvasFor(w * factor, h * factor);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser refused to open a drawing surface.');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return { canvas, ctx };
}

/**
 * Bradley adaptive threshold. Each pixel is compared against the mean of the
 * window around it, computed in one pass from an integral image, so uneven
 * lighting across the page stops mattering.
 */
function threshold(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const image = ctx.getImageData(0, 0, width, height);
  const px = image.data;
  const grey = new Uint8ClampedArray(width * height);

  for (let i = 0, p = 0; i < px.length; i += 4, p++) {
    // Rec. 601 luma keeps stamps and blue ink legible.
    grey[p] = (px[i] * 299 + px[i + 1] * 587 + px[i + 2] * 114) / 1000;
  }

  // Stretch contrast before thresholding so faint toner still separates.
  let min = 255;
  let max = 0;
  for (let p = 0; p < grey.length; p++) {
    if (grey[p] < min) min = grey[p];
    if (grey[p] > max) max = grey[p];
  }
  const span = Math.max(1, max - min);
  if (span < 200) {
    for (let p = 0; p < grey.length; p++) {
      grey[p] = ((grey[p] - min) * 255) / span;
    }
  }

  const integral = new Float64Array((width + 1) * (height + 1));
  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    for (let x = 0; x < width; x++) {
      rowSum += grey[y * width + x];
      integral[(y + 1) * (width + 1) + (x + 1)] = integral[y * (width + 1) + (x + 1)] + rowSum;
    }
  }

  const window = Math.max(16, Math.floor(width / 16));
  const half = window >> 1;
  const bias = 0.86; // Pixels below 86% of the local mean become ink.

  for (let y = 0; y < height; y++) {
    const y1 = Math.max(0, y - half);
    const y2 = Math.min(height - 1, y + half);
    for (let x = 0; x < width; x++) {
      const x1 = Math.max(0, x - half);
      const x2 = Math.min(width - 1, x + half);
      const count = (x2 - x1 + 1) * (y2 - y1 + 1);
      const sum =
        integral[(y2 + 1) * (width + 1) + (x2 + 1)] -
        integral[y1 * (width + 1) + (x2 + 1)] -
        integral[(y2 + 1) * (width + 1) + x1] +
        integral[y1 * (width + 1) + x1];
      const value = grey[y * width + x] < (sum / count) * bias ? 0 : 255;
      const i = (y * width + x) * 4;
      px[i] = value;
      px[i + 1] = value;
      px[i + 2] = value;
      px[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('The page could not be encoded.'))),
      type,
      quality,
    );
  });
}

async function toBase64(blob: Blob): Promise<string> {
  const buffer = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  // Chunked so a large page does not blow the argument limit.
  for (let i = 0; i < buffer.length; i += 0x8000) {
    binary += String.fromCharCode(...buffer.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

/** Produces both the cleaned page for OCR and a compact copy for a vision model. */
export async function prepareImage(source: Blob): Promise<PreparedImage> {
  const bitmap = await decode(source);
  try {
    const { canvas, ctx } = scaleTo(bitmap, OCR_LONG_EDGE);
    threshold(ctx, canvas.width, canvas.height);
    const ocr = await toBlob(canvas, 'image/png');

    const vision = scaleTo(bitmap, VISION_LONG_EDGE);
    const visionBlob = await toBlob(vision.canvas, 'image/jpeg', 0.85);

    return {
      ocr,
      vision: await toBase64(visionBlob),
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    bitmap.close();
  }
}

/** Same treatment for a page already rendered onto a canvas, as PDFs are. */
export async function prepareCanvas(canvas: HTMLCanvasElement): Promise<PreparedImage> {
  const { canvas: scaled, ctx } = scaleTo(canvas, OCR_LONG_EDGE);
  threshold(ctx, scaled.width, scaled.height);
  const ocr = await toBlob(scaled, 'image/png');

  const vision = scaleTo(canvas, VISION_LONG_EDGE);
  const visionBlob = await toBlob(vision.canvas, 'image/jpeg', 0.85);

  return { ocr, vision: await toBase64(visionBlob), width: scaled.width, height: scaled.height };
}
