'use client';

import Link from 'next/link';
import { ArrowRight, CalendarClock, ScanLine } from 'lucide-react';
import { useMemo } from 'react';
import clsx from 'clsx';
import { useStore } from '@/lib/store';
import { PageHeader } from '@/components/app/AppShell';
import { AiBanner } from '@/components/app/AiBanner';
import { Badge, Card, CardTitle, EmptyState, Stat } from '@/components/ui/Primitives';
import { ButtonLink } from '@/components/ui/Button';
import { fmtDate, fmtPKR, daysUntil } from '@/lib/format';
import { computeTax, DEADLINES, slabsFor, TAX_YEAR_LABEL } from '@/lib/tax';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/types';

export function DashboardView() {
  const { docs, notices, settings, ready } = useStore();

  const totals = useMemo(() => {
    const sum = (cats: readonly string[]) =>
      docs.filter((d) => cats.includes(d.category)).reduce((t, d) => t + (d.amount || 0), 0);

    const income = sum(INCOME_CATEGORIES);
    const expense = sum(EXPENSE_CATEGORIES);
    const taxPaid =
      docs.reduce((t, d) => t + (d.taxAmount || 0), 0) +
      docs.filter((d) => d.category === 'Tax Payment').reduce((t, d) => t + (d.amount || 0), 0);

    const estimate = computeTax(income, slabsFor(settings.taxpayerType));
    return { income, expense, taxPaid, estimate, balance: estimate.tax - taxPaid };
  }, [docs, settings.taxpayerType]);

  const upcoming = useMemo(
    () =>
      DEADLINES.map((d) => ({ ...d, days: daysUntil(d.iso) }))
        .filter((d) => d.days === null || d.days >= -3)
        .slice(0, 4),
    [],
  );

  const recent = useMemo(
    () =>
      docs
        .slice()
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        .slice(0, 5),
    [docs],
  );

  const openNotices = notices.filter((n) => n.riskLevel === 'High' || n.riskLevel === 'Critical');

  return (
    <>
      <PageHeader
        title={settings.name ? `Assalam o alaikum, ${settings.name.split(' ')[0]}` : 'Dashboard'}
        subtitle={`Tax year ${TAX_YEAR_LABEL}, ${settings.taxpayerType === 'salaried' ? 'salaried' : 'non salaried'} schedule`}
        actions={
          <ButtonLink href="/scan" variant="primary" size="sm">
            <ScanLine size={15} />
            Scan a document
          </ButtonLink>
        }
      />

      <AiBanner />

      {openNotices.length ? (
        <Link
          href="/notices"
          className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-clay-600/25 bg-clay-100 px-4 py-3.5 text-[14px] text-clay-700"
        >
          <span>
            <strong className="font-semibold">
              {openNotices.length} notice{openNotices.length > 1 ? 's' : ''} marked high risk.
            </strong>{' '}
            Check the deadline and the drafted reply.
          </span>
          <ArrowRight size={16} className="shrink-0" />
        </Link>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Documents"
          value={ready ? String(docs.length) : '0'}
          hint="Saved in this browser"
          accent="forest"
        />
        <Stat
          label="Income recorded"
          value={fmtPKR(totals.income)}
          hint="Salary, business and other income"
          accent="green"
        />
        <Stat
          label="Claimable spending"
          value={fmtPKR(totals.expense)}
          hint="Expenses, utilities, medical, donations"
          accent="brass"
        />
        <Stat
          label="Tax already paid"
          value={fmtPKR(totals.taxPaid)}
          hint="Withheld on documents plus challans"
          accent="clay"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardTitle
              title="Estimated position"
              hint="Based only on the documents you have saved so far"
              action={
                <Link
                  href="/calculator"
                  className="text-[13.5px] font-medium text-forest-700 hover:underline"
                >
                  Open calculator
                </Link>
              }
            />
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Taxable income', value: fmtPKR(totals.income) },
                { label: 'Tax on that income', value: fmtPKR(totals.estimate.tax) },
                {
                  label: totals.balance >= 0 ? 'Balance payable' : 'Excess paid',
                  value: fmtPKR(Math.abs(totals.balance)),
                  strong: true,
                },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-paper-sunken/70 p-4">
                  <p className="text-[12.5px] text-ink-soft">{item.label}</p>
                  <p
                    className={clsx(
                      'tabular mt-1.5 font-display text-[22px] leading-none',
                      item.strong && (totals.balance >= 0 ? 'text-clay-700' : 'text-forest-700'),
                    )}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
              This is arithmetic on what you have uploaded, not an assessment. Slab rates change with
              every Finance Act, so confirm the current schedule on the FBR website before you file.
            </p>
          </Card>

          <Card padded={false}>
            <div className="flex items-center justify-between px-6 pt-6">
              <CardTitle title="Recent documents" hint={`${docs.length} saved in total`} />
            </div>
            {recent.length ? (
              <ul className="divide-y divide-line border-t border-line">
                {recent.map((doc) => (
                  <li key={doc.id}>
                    <Link
                      href="/documents"
                      className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-paper-sunken/60"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] font-medium">{doc.title}</p>
                        <p className="truncate text-[12.5px] text-ink-soft">
                          {doc.vendor || 'No vendor'} · {fmtDate(doc.date)}
                        </p>
                      </div>
                      <Badge tone="neutral">{doc.category}</Badge>
                      <span className="tabular w-28 shrink-0 text-right font-mono text-[13.5px]">
                        {fmtPKR(doc.amount)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 pb-6">
                <EmptyState
                  icon={<ScanLine size={20} />}
                  title="No documents yet"
                  body="Start with something easy to read, like a printed receipt or a salary slip."
                  action={
                    <ButtonLink href="/scan" variant="primary" size="sm">
                      Scan the first one
                    </ButtonLink>
                  }
                />
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle icon={<CalendarClock size={17} />} title="Dates worth knowing" />
            <ul className="space-y-3.5">
              {upcoming.map((item) => (
                <li key={item.iso} className="flex gap-3.5">
                  <div
                    className={clsx(
                      'flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border',
                      item.days !== null && item.days <= 30
                        ? 'border-clay-600/25 bg-clay-100 text-clay-700'
                        : 'border-line bg-paper-sunken text-ink-muted',
                    )}
                  >
                    <span className="font-display text-[16px] leading-none">{item.day}</span>
                    <span className="text-[10px] uppercase tracking-wide">{item.month}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13.5px] leading-snug">{item.title}</p>
                    <p className="mt-0.5 text-[12px] text-ink-soft">
                      {item.tag}
                      {item.days !== null && item.days >= 0 ? ` · ${item.days} days away` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-line pt-4 text-[12.5px] leading-relaxed text-ink-soft">
              FBR extends the filing date most years. Treat these as the statutory dates and check for
              a notification before relying on an extension.
            </p>
          </Card>

          <Card>
            <CardTitle title="Get set up" hint="Four things worth doing once" />
            <ol className="space-y-3">
              {[
                { done: Boolean(settings.apiKey), text: 'Add your Ollama key', href: '/settings' },
                { done: Boolean(settings.ntn), text: 'Save your NTN or CNIC', href: '/settings' },
                { done: docs.length > 0, text: 'Scan your first document', href: '/scan' },
                { done: docs.length >= 5, text: 'Build up five records', href: '/scan' },
              ].map((item, i) => (
                <li key={item.text} className="flex items-center gap-3">
                  <span
                    className={clsx(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-medium',
                      item.done
                        ? 'bg-forest-700 text-paper'
                        : 'border border-line bg-paper-sunken text-ink-soft',
                    )}
                  >
                    {item.done ? '✓' : i + 1}
                  </span>
                  <Link
                    href={item.href}
                    className={clsx(
                      'text-[14px] hover:underline',
                      item.done ? 'text-ink-soft line-through' : 'text-ink',
                    )}
                  >
                    {item.text}
                  </Link>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}
