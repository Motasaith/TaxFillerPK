'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Download, FileText, Pencil, ScanLine, Search, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/app/AppShell';
import { DocForm } from '@/components/app/DocForm';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Badge, Card, EmptyState } from '@/components/ui/Primitives';
import { ConfirmModal, Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { downloadBlob, fmtDate, fmtPKR, toCSV } from '@/lib/format';
import { useStore } from '@/lib/store';
import { CATEGORIES, type TaxDoc } from '@/lib/types';
import type { DraftDoc } from '@/lib/ai';

export function DocumentsView() {
  const { docs, removeDoc, updateDoc } = useStore();
  const { toast } = useToast();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const [viewing, setViewing] = useState<TaxDoc | null>(null);
  const [editing, setEditing] = useState<TaxDoc | null>(null);
  const [editDraft, setEditDraft] = useState<DraftDoc | null>(null);
  const [deleting, setDeleting] = useState<TaxDoc | null>(null);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    docs.forEach((d) => map.set(d.category, (map.get(d.category) ?? 0) + 1));
    return map;
  }, [docs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs
      .filter((d) => (filter === 'All' ? true : d.category === filter))
      .filter((d) =>
        q
          ? `${d.title} ${d.vendor} ${d.summary} ${d.docType} ${d.ntnCnic}`.toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [docs, filter, query]);

  const totals = useMemo(
    () => ({
      amount: filtered.reduce((t, d) => t + (d.amount || 0), 0),
      tax: filtered.reduce((t, d) => t + (d.taxAmount || 0), 0),
    }),
    [filtered],
  );

  function exportCSV() {
    const rows: (string | number | null)[][] = [
      ['Title', 'Vendor', 'Date', 'Amount', 'Tax deducted', 'Head', 'Type', 'NTN or CNIC', 'Summary', 'File'],
      ...filtered.map((d) => [
        d.title,
        d.vendor,
        d.date,
        d.amount,
        d.taxAmount ?? '',
        d.category,
        d.docType,
        d.ntnCnic,
        d.summary,
        d.fileName,
      ]),
    ];
    downloadBlob('taxfillr-documents.csv', `﻿${toCSV(rows)}`, 'text/csv;charset=utf-8');
    toast(`Exported ${filtered.length} record${filtered.length === 1 ? '' : 's'}`);
  }

  function startEdit(doc: TaxDoc) {
    setViewing(null);
    setEditing(doc);
    const { id, createdAt, ...rest } = doc;
    void id;
    void createdAt;
    setEditDraft(rest);
  }

  function saveEdit() {
    if (!editing || !editDraft) return;
    updateDoc(editing.id, editDraft);
    toast('Record updated');
    setEditing(null);
    setEditDraft(null);
  }

  const chips = ['All', ...CATEGORIES.filter((c) => counts.has(c))];

  return (
    <>
      <PageHeader
        title="My documents"
        subtitle={`${docs.length} record${docs.length === 1 ? '' : 's'} stored in this browser`}
        actions={
          <>
            {docs.length ? (
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download size={15} />
                Export CSV
              </Button>
            ) : null}
            <ButtonLink href="/scan" variant="primary" size="sm">
              <ScanLine size={15} />
              Scan a document
            </ButtonLink>
          </>
        }
      />

      {docs.length === 0 ? (
        <EmptyState
          icon={<FileText size={20} />}
          title="Nothing saved yet"
          body="Every document you scan lands here with its amount, date and head of account, ready for filing season."
          action={
            <ButtonLink href="/scan" variant="primary" size="sm">
              Scan the first one
            </ButtonLink>
          }
        />
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3.5">
            <div className="relative max-w-md">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
              />
              <input
                className="field pl-10"
                placeholder="Search by title, vendor or summary"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setFilter(chip)}
                  className={clsx(
                    'rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors',
                    filter === chip
                      ? 'border-forest-800 bg-forest-800 text-paper'
                      : 'border-line bg-paper-raised text-ink-muted hover:border-line-strong hover:text-ink',
                  )}
                >
                  {chip}
                  {chip !== 'All' ? (
                    <span className="ml-1.5 text-[12px] opacity-70">{counts.get(chip)}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Search size={20} />}
              title="Nothing matches"
              body="Try a different search term, or clear the head filter."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery('');
                    setFilter('All');
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <Card padded={false} className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-line bg-paper-sunken/60 text-[12px] uppercase tracking-wide text-ink-soft">
                      <th className="px-5 py-3 font-medium">Document</th>
                      <th className="px-3 py-3 font-medium">Head</th>
                      <th className="px-3 py-3 font-medium">Date</th>
                      <th className="px-3 py-3 text-right font-medium">Amount</th>
                      <th className="px-3 py-3 text-right font-medium">Tax</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filtered.map((doc) => (
                      <tr key={doc.id} className="transition-colors hover:bg-paper-sunken/40">
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => setViewing(doc)}
                            className="block max-w-[280px] text-left"
                          >
                            <span className="block truncate text-[14.5px] font-medium text-ink">
                              {doc.title}
                            </span>
                            <span className="block truncate text-[12.5px] text-ink-soft">
                              {doc.vendor || doc.docType}
                            </span>
                          </button>
                        </td>
                        <td className="px-3 py-3.5">
                          <Badge tone="neutral">{doc.category}</Badge>
                        </td>
                        <td className="px-3 py-3.5 text-[13.5px] text-ink-muted">
                          {fmtDate(doc.date)}
                        </td>
                        <td className="tabular px-3 py-3.5 text-right font-mono text-[13.5px]">
                          {fmtPKR(doc.amount)}
                        </td>
                        <td className="tabular px-3 py-3.5 text-right font-mono text-[13.5px] text-ink-muted">
                          {doc.taxAmount ? fmtPKR(doc.taxAmount) : '-'}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => startEdit(doc)}
                              aria-label="Edit"
                              className="rounded-lg border border-line p-1.5 text-ink-muted transition-colors hover:border-forest-600 hover:text-forest-700"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleting(doc)}
                              aria-label="Delete"
                              className="rounded-lg border border-line p-1.5 text-ink-muted transition-colors hover:border-clay-600/40 hover:bg-clay-100 hover:text-clay-700"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-line bg-paper-sunken/60 text-[13px]">
                      <td className="px-5 py-3 font-medium" colSpan={3}>
                        {filtered.length} record{filtered.length === 1 ? '' : 's'} shown
                      </td>
                      <td className="tabular px-3 py-3 text-right font-mono font-semibold">
                        {fmtPKR(totals.amount)}
                      </td>
                      <td className="tabular px-3 py-3 text-right font-mono font-semibold">
                        {fmtPKR(totals.tax)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* View */}
      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.title ?? ''}
        subtitle={viewing ? `${viewing.vendor || viewing.docType} · ${fmtDate(viewing.date)}` : ''}
        footer={
          viewing ? (
            <div className="flex flex-wrap justify-end gap-2.5">
              <Button variant="outline" size="sm" onClick={() => startEdit(viewing)}>
                <Pencil size={14} />
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setDeleting(viewing);
                  setViewing(null);
                }}
              >
                <Trash2 size={14} />
                Delete
              </Button>
            </div>
          ) : null
        }
      >
        {viewing ? (
          <div className="space-y-6">
            <dl className="grid gap-x-6 gap-y-3 text-[14px] sm:grid-cols-2">
              {[
                ['Amount', fmtPKR(viewing.amount)],
                ['Tax deducted or paid', viewing.taxAmount ? fmtPKR(viewing.taxAmount) : 'None shown'],
                ['Head of account', viewing.category],
                ['Document type', viewing.docType],
                ['NTN or CNIC', viewing.ntnCnic || 'Not on document'],
                ['Source file', viewing.fileName || 'Entered by hand'],
                ['Saved on', fmtDate(viewing.createdAt)],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-line pb-2.5">
                  <dt className="text-[12.5px] text-ink-soft">{label}</dt>
                  <dd className="mt-0.5 font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            {viewing.summary ? (
              <div>
                <h3 className="text-[13px] font-medium uppercase tracking-wide text-ink-soft">
                  Summary
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">{viewing.summary}</p>
              </div>
            ) : null}

            {viewing.advice ? (
              <div className="rounded-xl border border-forest-100 bg-forest-100/60 p-4">
                <h3 className="text-[13px] font-medium uppercase tracking-wide text-forest-800">
                  Worth knowing
                </h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-forest-800">{viewing.advice}</p>
              </div>
            ) : null}

            {viewing.rawText ? (
              <div>
                <h3 className="text-[13px] font-medium uppercase tracking-wide text-ink-soft">
                  Text read from the file
                </h3>
                <pre className="scroll-thin mt-2 max-h-56 overflow-auto whitespace-pre-wrap rounded-xl bg-paper-sunken p-4 font-mono text-[12px] leading-relaxed text-ink-muted">
                  {viewing.rawText}
                </pre>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>

      {/* Edit */}
      <Modal
        open={Boolean(editing && editDraft)}
        onClose={() => {
          setEditing(null);
          setEditDraft(null);
        }}
        title="Edit record"
        footer={
          <div className="flex justify-end gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(null);
                setEditDraft(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={saveEdit}>
              Save changes
            </Button>
          </div>
        }
      >
        {editDraft ? (
          <DocForm draft={editDraft} onChange={(patch) => setEditDraft({ ...editDraft, ...patch })} />
        ) : null}
      </Modal>

      <ConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            removeDoc(deleting.id);
            toast('Record deleted');
          }
        }}
        title="Delete this record"
        body={`"${deleting?.title ?? ''}" will be removed from this browser. There is no copy anywhere else, so this cannot be undone.`}
      />
    </>
  );
}
