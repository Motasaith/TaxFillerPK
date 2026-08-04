'use client';

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Info, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/app/AppShell';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, Field, Notice } from '@/components/ui/Primitives';
import { fmtPKR } from '@/lib/format';
import { computeTax, slabsFor, TAX_YEAR_LABEL } from '@/lib/tax';
import { useStore } from '@/lib/store';
import { INCOME_CATEGORIES } from '@/lib/types';

const PRESETS = [600_000, 1_200_000, 2_400_000, 3_600_000, 6_000_000, 12_000_000];

export function CalculatorView() {
  const { docs, settings, updateSettings, ready } = useStore();
  const [mode, setMode] = useState<'salaried' | 'non-salaried'>(settings.taxpayerType);
  const [income, setIncome] = useState(2_400_000);
  const [useLedger, setUseLedger] = useState(true);

  // The saved profile only arrives once local storage has been read.
  useEffect(() => {
    if (ready) setMode(settings.taxpayerType);
  }, [ready, settings.taxpayerType]);

  const recorded = useMemo(() => {
    const gross = docs
      .filter((d) => INCOME_CATEGORIES.includes(d.category))
      .reduce((t, d) => t + (d.amount || 0), 0);
    const withheld =
      docs.reduce((t, d) => t + (d.taxAmount || 0), 0) +
      docs.filter((d) => d.category === 'Tax Payment').reduce((t, d) => t + (d.amount || 0), 0);
    return { gross, withheld };
  }, [docs]);

  const result = useMemo(() => computeTax(income, slabsFor(mode)), [income, mode]);
  const alreadyPaid = useLedger ? recorded.withheld : 0;
  const balance = result.tax - alreadyPaid;
  const maxSlabTax = Math.max(...result.rows.map((r) => r.tax), 1);

  function chooseMode(next: 'salaried' | 'non-salaried') {
    setMode(next);
    updateSettings({ taxpayerType: next });
  }

  return (
    <>
      <PageHeader
        title="Tax calculator"
        subtitle={`Slab by slab working for tax year ${TAX_YEAR_LABEL}`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <div className="space-y-6">
          <Card>
            <div className="inline-flex rounded-lg bg-paper-sunken p-1">
              {(['salaried', 'non-salaried'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => chooseMode(option)}
                  className={clsx(
                    'rounded-md px-4 py-2 text-[14px] font-medium capitalize transition-colors',
                    mode === option ? 'bg-paper-raised text-ink shadow-card' : 'text-ink-muted',
                  )}
                >
                  {option === 'salaried' ? 'Salaried' : 'Non salaried'}
                </button>
              ))}
            </div>

            <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
              {mode === 'salaried'
                ? 'For income where salary is more than half of what you earn in the year.'
                : 'For business income, professional fees, freelancing and rental income filed as an individual.'}
            </p>

            <Field label="Annual taxable income" className="mt-6">
              <input
                className="field tabular font-mono text-[18px]"
                type="number"
                min={0}
                step={10_000}
                value={income || ''}
                onChange={(e) => setIncome(Math.max(0, Number(e.target.value) || 0))}
              />
            </Field>

            <div className="mt-3 flex flex-wrap gap-2">
              {PRESETS.map((value) => (
                <button
                  key={value}
                  onClick={() => setIncome(value)}
                  className={clsx(
                    'rounded-lg border px-2.5 py-1.5 font-mono text-[12.5px] transition-colors',
                    income === value
                      ? 'border-forest-700 bg-forest-100/60 text-forest-800'
                      : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
                  )}
                >
                  {fmtPKR(value, { compact: true })}
                </button>
              ))}
            </div>

            {recorded.gross > 0 ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => setIncome(Math.round(recorded.gross))}
              >
                <Wallet size={15} />
                Use my recorded income, {fmtPKR(recorded.gross)}
              </Button>
            ) : null}
          </Card>

          <Card>
            <p className="text-[12.5px] font-medium uppercase tracking-wide text-ink-soft">
              Tax on this income
            </p>
            <p className="tabular mt-2 font-display text-[42px] leading-none text-ink">
              {fmtPKR(result.tax)}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                ['Effective rate', `${result.effectiveRate.toFixed(1)}%`],
                ['Top slab rate', `${result.marginalRate.toFixed(0)}%`],
                ['Per month', fmtPKR(result.monthly)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-paper-sunken/70 p-3.5">
                  <p className="text-[11.5px] text-ink-soft">{label}</p>
                  <p className="tabular mt-1 font-display text-[18px] leading-none">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2.5 border-t border-line pt-5 text-[14px]">
              <div className="flex justify-between">
                <span className="text-ink-muted">Income after tax</span>
                <span className="tabular font-mono">{fmtPKR(result.netIncome)}</span>
              </div>

              {recorded.withheld > 0 ? (
                <>
                  <label className="flex cursor-pointer items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-ink-muted">
                      <input
                        type="checkbox"
                        checked={useLedger}
                        onChange={(e) => setUseLedger(e.target.checked)}
                        className="h-4 w-4 accent-forest-700"
                      />
                      Tax already deducted on my documents
                    </span>
                    <span className="tabular font-mono">{fmtPKR(recorded.withheld)}</span>
                  </label>
                  <div className="flex justify-between border-t border-line pt-2.5 font-medium">
                    <span>{balance >= 0 ? 'Balance payable' : 'Excess paid'}</span>
                    <span
                      className={clsx(
                        'tabular font-mono',
                        balance >= 0 ? 'text-clay-700' : 'text-forest-700',
                      )}
                    >
                      {fmtPKR(Math.abs(balance))}
                    </span>
                  </div>
                </>
              ) : null}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle
              title="Where the tax comes from"
              hint="Each slab applies only to the part of your income that falls inside it"
            />
            <div className="space-y-3">
              {result.rows.map((row) => (
                <div key={row.label}>
                  <div className="flex items-baseline justify-between gap-4 text-[13px]">
                    <span className="text-ink-muted">
                      {row.label}
                      <span className="ml-2 font-mono text-[12px] text-ink-soft">
                        {(row.rate * 100).toFixed(0)}%
                      </span>
                    </span>
                    <span className="tabular shrink-0 font-mono">{fmtPKR(Math.round(row.tax))}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper-sunken">
                    <div
                      className={clsx(
                        'h-full rounded-full',
                        row.tax > 0 ? 'bg-forest-600' : 'bg-transparent',
                      )}
                      style={{ width: `${row.tax > 0 ? Math.max(3, (row.tax / maxSlabTax) * 100) : 0}%` }}
                    />
                  </div>
                  {row.taxableInSlab > 0 ? (
                    <p className="mt-1 text-[11.5px] text-ink-soft">
                      {fmtPKR(row.taxableInSlab)} of your income sits in this slab
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>

          <Notice tone="brass" icon={<Info size={16} />}>
            <p className="font-medium">Check the rates before you file</p>
            <p className="mt-1 leading-relaxed">
              These slabs follow the schedules current at the time of writing. They are revised with
              every Finance Act, and surcharges can apply above certain income levels. Confirm the
              live schedule on the FBR website, and treat this as arithmetic rather than an
              assessment.
            </p>
          </Notice>

          <Card>
            <CardTitle title="Reducing what you owe" hint="Legitimate routes, worth checking with a professional" />
            <ul className="space-y-3 text-[14px] leading-relaxed text-ink-muted">
              {(mode === 'salaried'
                ? [
                    'Donations to approved institutions carry a tax credit under section 61. Keep the receipt and the institution reference.',
                    'Contributions to an approved pension fund carry a credit under section 63, with limits by age.',
                    'Check that every deduction your employer made appears in your salary certificate, then match it against your ledger here.',
                    'Being on the Active Taxpayer List lowers withholding on banking, property and vehicle transactions for the whole year.',
                  ]
                : [
                    'Ordinary business expenses incurred wholly for the business are deductible. Scan them as they happen rather than reconstructing later.',
                    'Depreciation on plant, vehicles and equipment is allowed at the rates in the Third Schedule.',
                    'Advance tax paid under section 147 and tax withheld by clients is adjustable against the final liability.',
                    'Keep business and personal spending in separate accounts. It makes the deduction far easier to defend if questioned.',
                  ]
              ).map((tip) => (
                <li key={tip} className="flex gap-2.5">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brass-500" />
                  {tip}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
