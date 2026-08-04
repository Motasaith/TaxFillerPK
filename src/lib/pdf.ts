import type { Settings, StoredNotice } from './types';
import { fmtDate, fmtPKR } from './format';

/** Renders a notice reply as a printable A4 letter. */
export async function replyToPDF(notice: StoredNotice, settings: Settings) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const marginX = 56;
  const marginTop = 64;
  const width = doc.internal.pageSize.getWidth() - marginX * 2;
  const bottom = doc.internal.pageSize.getHeight() - 60;
  let y = marginTop;

  function ensureRoom(lineHeight: number) {
    if (y + lineHeight > bottom) {
      doc.addPage();
      y = marginTop;
    }
  }

  function block(text: string, size: number, style: 'normal' | 'bold' = 'normal', gap = 14) {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, width) as string[];
    lines.forEach((line) => {
      ensureRoom(size + 4);
      doc.text(line, marginX, y);
      y += size + 4;
    });
    y += gap;
  }

  // Sender block
  block(settings.name || '[Your name]', 12, 'bold', 2);
  if (settings.ntn) block(`NTN or CNIC: ${settings.ntn}`, 10, 'normal', 2);
  block(new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }), 10, 'normal', 18);

  // Reference line
  doc.setDrawColor(210);
  doc.line(marginX, y - 8, marginX + width, y - 8);
  y += 8;

  const reference = [
    notice.noticeType,
    notice.section ? `Section ${notice.section}` : '',
    notice.taxYear ? `Tax year ${notice.taxYear}` : '',
    notice.amountDemanded ? `Amount ${fmtPKR(notice.amountDemanded)}` : '',
    notice.deadline ? `Due ${fmtDate(notice.deadline)}` : '',
  ]
    .filter(Boolean)
    .join('  |  ');

  block(`Subject: Reply to ${reference}`, 11, 'bold', 6);
  if (notice.authority) block(`To: ${notice.authority}`, 10, 'normal', 18);

  block(notice.replyDraft || 'No draft was generated.', 11, 'normal', 20);

  // Footer note on every page
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.text(
      `Draft prepared with TaxFillr. Review before sending.  Page ${i} of ${pages}`,
      marginX,
      doc.internal.pageSize.getHeight() - 32,
    );
    doc.setTextColor(0);
  }

  const safeName = (notice.noticeType || 'notice').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  doc.save(`taxfillr-reply-${safeName}.pdf`);
}
