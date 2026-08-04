'use client';

import clsx from 'clsx';
import { Copy, Download, FileDown, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';
import { downloadBlob, daysUntil, fmtDate, fmtPKR } from '@/lib/format';
import { replyToPDF } from '@/lib/pdf';
import type { Settings, StoredNotice } from '@/lib/types';

const riskTone: Record<StoredNotice['riskLevel'], string> = {
  Low: 'border-forest-100 bg-forest-100/70 text-forest-800',
  Medium: 'border-brass-100 bg-brass-50 text-brass-700',
  High: 'border-clay-600/25 bg-clay-100 text-clay-700',
  Critical: 'border-clay-600/40 bg-clay-600 text-white',
};

export function NoticeCard({
  notice,
  settings,
  onDelete,
  onReplyChange,
}: {
  notice: StoredNotice;
  settings: Settings;
  onDelete?: () => void;
  onReplyChange?: (text: string) => void;
}) {
  const { toast } = useToast();
  const [reply, setReply] = useState(notice.replyDraft);
  const days = daysUntil(notice.deadline);

  function updateReply(text: string) {
    setReply(text);
    onReplyChange?.(text);
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-semibold leading-snug">{notice.noticeType}</h2>
            <p className="mt-1 text-[13.5px] text-ink-soft">
              {notice.authority}
              {notice.fileName ? ` · ${notice.fileName}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={clsx(
                'rounded-md border px-2.5 py-1 text-[12.5px] font-medium',
                riskTone[notice.riskLevel],
              )}
            >
              {notice.riskLevel} risk
            </span>
            {onDelete ? (
              <button
                onClick={onDelete}
                aria-label="Delete notice"
                className="rounded-lg border border-line p-1.5 text-ink-muted transition-colors hover:border-clay-600/40 hover:bg-clay-100 hover:text-clay-700"
              >
                <Trash2 size={14} />
              </button>
            ) : null}
          </div>
        </div>

        <dl className="grid gap-x-6 gap-y-3 text-[14px] sm:grid-cols-2">
          {[
            ['Section', notice.section || 'Not stated'],
            ['Tax year', notice.taxYear || 'Not stated'],
            ['Amount at stake', notice.amountDemanded ? fmtPKR(notice.amountDemanded) : 'None stated'],
            [
              'Reply due',
              notice.deadline
                ? `${fmtDate(notice.deadline)}${days !== null ? ` (${days < 0 ? `${Math.abs(days)} days ago` : `${days} days left`})` : ''}`
                : 'Not stated',
            ],
          ].map(([label, value]) => (
            <div key={label} className="border-b border-line pb-2.5">
              <dt className="text-[12.5px] text-ink-soft">{label}</dt>
              <dd
                className={clsx(
                  'mt-0.5 font-medium',
                  label === 'Reply due' && days !== null && days <= 7 ? 'text-clay-700' : 'text-ink',
                )}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {notice.summary ? (
          <div className="mt-5">
            <h3 className="text-[13px] font-medium uppercase tracking-wide text-ink-soft">
              What it says
            </h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">{notice.summary}</p>
          </div>
        ) : null}

        {notice.actions.length ? (
          <div className="mt-5">
            <h3 className="text-[13px] font-medium uppercase tracking-wide text-ink-soft">
              What to do next
            </h3>
            <ol className="mt-2.5 space-y-2.5">
              {notice.actions.map((action, i) => (
                <li key={action} className="flex gap-3 text-[14.5px] leading-relaxed text-ink-muted">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-paper-sunken font-mono text-[11px] text-ink-muted">
                    {i + 1}
                  </span>
                  {action}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </Card>

      {reply ? (
        <Card>
          <CardTitle
            title="Draft reply"
            hint="Edit it into your own words, then print it on your letterhead and file it through IRIS or by hand."
          />
          <textarea
            value={reply}
            onChange={(e) => updateReply(e.target.value)}
            className="field scroll-thin min-h-[260px] resize-y whitespace-pre-wrap font-sans text-[14px] leading-relaxed"
          />
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(reply);
                  toast('Reply copied');
                } catch {
                  toast('Could not copy', { body: 'Select the text and copy it manually.', tone: 'error' });
                }
              }}
            >
              <Copy size={14} />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                downloadBlob('taxfillr-reply.txt', reply, 'text/plain;charset=utf-8');
                toast('Downloaded as text');
              }}
            >
              <Download size={14} />
              Text file
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={async () => {
                try {
                  await replyToPDF({ ...notice, replyDraft: reply }, settings);
                  toast('PDF ready');
                } catch (err) {
                  toast('Could not build the PDF', {
                    body: err instanceof Error ? err.message : undefined,
                    tone: 'error',
                  });
                }
              }}
            >
              <FileDown size={14} />
              Download PDF
            </Button>
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">
            Anything in square brackets needs filling in. Check the section number and the notice
            reference against the original before this leaves your hands.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
