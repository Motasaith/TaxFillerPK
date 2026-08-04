import { prepareCanvas, prepareImage } from './image';

export type ExtractKind = 'image' | 'pdf' | 'spreadsheet' | 'csv' | 'text';

export interface ExtractResult {
  text: string;
  kind: ExtractKind;
  pages?: number;
  usedOCR: boolean;
  /** Tesseract's own score for the page, 0 to 100. Absent when no OCR ran. */
  confidence?: number;
  /** Base64 page images for a vision model, empty when the file had real text. */
  images: string[];
}

export interface ExtractProgress {
  pct: number;
  stage: string;
}

type OnProgress = (p: ExtractProgress) => void;

const PDF_WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

/** Pages sent for reading when a PDF turns out to be a scan. */
const MAX_SCAN_PAGES = 3;

export const ACCEPTED_FILES = 'image/*,.pdf,.csv,.xlsx,.xls,.txt,.json';
export const MAX_FILE_MB = 25;

/** Below this, treat the OCR text as unreliable and lean on the image instead. */
export const LOW_CONFIDENCE = 70;

function extOf(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

async function ocr(
  image: Blob,
  languages: string,
  onProgress: OnProgress | undefined,
  base: number,
  span: number,
): Promise<{ text: string; confidence: number }> {
  const { createWorker } = await import('tesseract.js');
  // Worker, core and language data resolve to jsDelivr at the versions this
  // package was built against, so no paths are hardcoded here.
  const worker = await createWorker(languages, 1, {
    logger: (m: { status: string; progress: number }) => {
      if (!onProgress) return;
      const label = m.status === 'recognizing text' ? 'Reading the page' : 'Loading the reader';
      onProgress({ pct: Math.round(base + (m.progress || 0) * span), stage: label });
    },
  });
  try {
    await worker.setParameters({
      // Let the engine find columns and blocks rather than assuming one column.
      tessedit_pageseg_mode: '3' as never,
      preserve_interword_spaces: '1',
    });
    const { data } = await worker.recognize(image);
    return { text: data.text || '', confidence: data.confidence ?? 0 };
  } finally {
    await worker.terminate();
  }
}

async function readPdf(
  file: File,
  languages: string,
  onProgress?: OnProgress,
): Promise<ExtractResult> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER;

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;

  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.({
      pct: Math.round((i / pdf.numPages) * 60),
      stage: `Reading page ${i} of ${pdf.numPages}`,
    });
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .concat('\n');
  }

  // A real text layer needs no reading and no image.
  if (text.replace(/\s/g, '').length >= 60) {
    return { text, kind: 'pdf', pages: pdf.numPages, usedOCR: false, images: [] };
  }

  const pageCount = Math.min(pdf.numPages, MAX_SCAN_PAGES);
  const images: string[] = [];
  let scanned = '';
  let confidenceTotal = 0;
  let read = 0;

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    // Render well above display size so the threshold pass has detail to work with.
    const viewport = page.getViewport({ scale: 2.5 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    if (!context) break;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport }).promise;

    const prepared = await prepareCanvas(canvas);
    images.push(prepared.vision);

    const span = 40 / pageCount;
    const result = await ocr(prepared.ocr, languages, onProgress, 60 + (i - 1) * span, span);
    scanned += `${result.text}\n`;
    confidenceTotal += result.confidence;
    read++;
  }

  return {
    text: scanned,
    kind: 'pdf',
    pages: pdf.numPages,
    usedOCR: true,
    confidence: read ? confidenceTotal / read : 0,
    images,
  };
}

async function readSpreadsheet(file: File): Promise<ExtractResult> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const book = XLSX.read(buffer, { type: 'array' });
  const text = book.SheetNames.map(
    (name) => `Sheet: ${name}\n${XLSX.utils.sheet_to_csv(book.Sheets[name])}`,
  ).join('\n\n');
  return { text, kind: 'spreadsheet', usedOCR: false, images: [] };
}

/**
 * Turns any supported upload into text, and where the source is a picture, into
 * page images a vision model can read directly. Everything happens in the
 * browser; nothing is uploaded at this stage.
 */
export async function extractText(
  file: File,
  options?: { urdu?: boolean; onProgress?: OnProgress },
): Promise<ExtractResult> {
  const onProgress = options?.onProgress;
  const languages = options?.urdu ? 'eng+urd' : 'eng';
  const ext = extOf(file.name);
  const mime = file.type || '';

  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    throw new Error(`That file is larger than ${MAX_FILE_MB} MB. Try a smaller scan or a single page.`);
  }

  onProgress?.({ pct: 5, stage: 'Opening the file' });

  if (ext === 'csv' || mime.includes('csv')) {
    return { text: await file.text(), kind: 'csv', usedOCR: false, images: [] };
  }

  if (['xlsx', 'xls'].includes(ext) || mime.includes('spreadsheet') || mime.includes('excel')) {
    return readSpreadsheet(file);
  }

  if (ext === 'pdf' || mime === 'application/pdf') {
    return readPdf(file, languages, onProgress);
  }

  if (
    mime.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'tif', 'tiff'].includes(ext)
  ) {
    onProgress?.({ pct: 10, stage: 'Straightening and sharpening the page' });
    const prepared = await prepareImage(file);
    const { text, confidence } = await ocr(prepared.ocr, languages, onProgress, 15, 85);
    return { text, kind: 'image', usedOCR: true, confidence, images: [prepared.vision] };
  }

  return { text: await file.text(), kind: 'text', usedOCR: false, images: [] };
}

export function describeKind(kind: ExtractKind): string {
  switch (kind) {
    case 'image':
      return 'image';
    case 'pdf':
      return 'PDF';
    case 'spreadsheet':
      return 'spreadsheet';
    case 'csv':
      return 'CSV';
    default:
      return 'text file';
  }
}
