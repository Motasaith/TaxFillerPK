export type ExtractKind = 'image' | 'pdf' | 'spreadsheet' | 'csv' | 'text';

export interface ExtractResult {
  text: string;
  kind: ExtractKind;
  pages?: number;
  usedOCR: boolean;
}

export interface ExtractProgress {
  pct: number;
  stage: string;
}

type OnProgress = (p: ExtractProgress) => void;

const PDF_WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

export const ACCEPTED_FILES = 'image/*,.pdf,.csv,.xlsx,.xls,.txt,.json';
export const MAX_FILE_MB = 25;

function extOf(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

async function ocr(
  image: Blob | string,
  languages: string,
  onProgress: OnProgress | undefined,
  base: number,
  span: number,
): Promise<string> {
  const { createWorker } = await import('tesseract.js');
  // Worker, core and language data all resolve to jsDelivr at the versions this
  // package was built against, so no paths are hardcoded here.
  const worker = await createWorker(languages, 1, {
    logger: (m: { status: string; progress: number }) => {
      if (!onProgress) return;
      const label = m.status === 'recognizing text' ? 'Reading the image' : 'Loading the OCR engine';
      onProgress({ pct: Math.round(base + (m.progress || 0) * span), stage: label });
    },
  });
  try {
    const { data } = await worker.recognize(image);
    return data.text || '';
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
    onProgress?.({ pct: Math.round((i / pdf.numPages) * 70), stage: `Reading page ${i} of ${pdf.numPages}` });
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .concat('\n');
  }

  // Scanned PDFs carry no text layer, so fall back to OCR on the first pages.
  if (text.replace(/\s/g, '').length < 60) {
    const pageCount = Math.min(pdf.numPages, 3);
    let ocrText = '';
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');
      if (!context) break;
      await page.render({ canvasContext: context, viewport }).promise;
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) break;
      const span = 70 / pageCount;
      ocrText += `${await ocr(blob, languages, onProgress, 25 + (i - 1) * span, span)}\n`;
    }
    return { text: ocrText, kind: 'pdf', pages: pdf.numPages, usedOCR: true };
  }

  return { text, kind: 'pdf', pages: pdf.numPages, usedOCR: false };
}

async function readSpreadsheet(file: File): Promise<ExtractResult> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const book = XLSX.read(buffer, { type: 'array' });
  const text = book.SheetNames.map(
    (name) => `Sheet: ${name}\n${XLSX.utils.sheet_to_csv(book.Sheets[name])}`,
  ).join('\n\n');
  return { text, kind: 'spreadsheet', usedOCR: false };
}

/**
 * Turns any supported upload into plain text, entirely inside the browser.
 * Nothing is uploaded to a server at this stage.
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
    return { text: await file.text(), kind: 'csv', usedOCR: false };
  }

  if (['xlsx', 'xls'].includes(ext) || mime.includes('spreadsheet') || mime.includes('excel')) {
    return readSpreadsheet(file);
  }

  if (ext === 'pdf' || mime === 'application/pdf') {
    return readPdf(file, languages, onProgress);
  }

  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'tif', 'tiff'].includes(ext)) {
    const text = await ocr(file, languages, onProgress, 5, 95);
    return { text, kind: 'image', usedOCR: true };
  }

  return { text: await file.text(), kind: 'text', usedOCR: false };
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
