'use client';

import { Lightbulb } from 'lucide-react';
import { Field, Notice } from '@/components/ui/Primitives';
import { CATEGORIES, DOC_TYPES, type Category, type DocType } from '@/lib/types';
import type { DraftDoc } from '@/lib/ai';

export function DocForm({
  draft,
  onChange,
}: {
  draft: DraftDoc;
  onChange: (patch: Partial<DraftDoc>) => void;
}) {
  return (
    <div className="space-y-4">
      <Field label="Title">
        <input
          className="field"
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="What is this document"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Vendor, employer or issuer">
          <input
            className="field"
            value={draft.vendor}
            onChange={(e) => onChange({ vendor: e.target.value })}
            placeholder="Who issued it"
          />
        </Field>
        <Field label="Date">
          <input
            className="field"
            type="date"
            value={draft.date}
            onChange={(e) => onChange({ date: e.target.value })}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount in rupees">
          <input
            className="field tabular font-mono"
            type="number"
            min={0}
            value={draft.amount || ''}
            onChange={(e) => onChange({ amount: Number(e.target.value) || 0 })}
            placeholder="0"
          />
        </Field>
        <Field label="Tax deducted or paid" hint="Leave blank if no tax is shown">
          <input
            className="field tabular font-mono"
            type="number"
            min={0}
            value={draft.taxAmount ?? ''}
            onChange={(e) =>
              onChange({ taxAmount: e.target.value === '' ? null : Number(e.target.value) })
            }
            placeholder="0"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Head of account">
          <select
            className="field"
            value={draft.category}
            onChange={(e) => onChange({ category: e.target.value as Category })}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Document type">
          <select
            className="field"
            value={draft.docType}
            onChange={(e) => onChange({ docType: e.target.value as DocType })}
          >
            {DOC_TYPES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="NTN or CNIC on the document" hint="Optional">
        <input
          className="field font-mono"
          value={draft.ntnCnic}
          onChange={(e) => onChange({ ntnCnic: e.target.value })}
          placeholder="1234567-8"
        />
      </Field>

      <Field label="Summary">
        <textarea
          className="field min-h-[90px] resize-y"
          value={draft.summary}
          onChange={(e) => onChange({ summary: e.target.value })}
          placeholder="What this document shows and why it matters at filing time"
        />
      </Field>

      {draft.advice ? (
        <Notice tone="green" icon={<Lightbulb size={16} />}>
          <p className="font-medium">Worth knowing</p>
          <p className="mt-1 leading-relaxed">{draft.advice}</p>
        </Notice>
      ) : null}
    </div>
  );
}
