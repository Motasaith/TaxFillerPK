import { Check } from 'lucide-react';

const extracted = [
  { label: 'Vendor', value: 'Metro Cash & Carry' },
  { label: 'Date', value: '28 Jul 2026' },
  { label: 'Total', value: 'Rs 14,350' },
  { label: 'Sales tax', value: 'Rs 2,110' },
  { label: 'Head', value: 'Business expense' },
];

export function HeroPreview() {
  return (
    <div className="rounded-2xl border border-line-dark bg-forest-900/60 p-3 sm:p-4">
      <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
        {/* Left: the uploaded page */}
        <div className="rounded-xl bg-paper-raised p-4">
          <div className="flex items-baseline justify-between border-b border-line pb-3">
            <p className="text-[13px] font-semibold text-ink">METRO</p>
            <p className="font-mono text-[10px] text-ink-soft">INV 88214</p>
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-1.5 w-4/5 rounded-full bg-paper-sunken" />
            <div className="h-1.5 w-3/5 rounded-full bg-paper-sunken" />
            <div className="h-1.5 w-2/3 rounded-full bg-paper-sunken" />
            <div className="h-1.5 w-1/2 rounded-full bg-paper-sunken" />
          </div>
          <div className="mt-4 flex items-center justify-between rounded-md bg-brass-50 px-2.5 py-2">
            <span className="text-[10.5px] font-medium uppercase tracking-wide text-brass-700">
              Total
            </span>
            <span className="font-mono text-[12px] font-semibold text-ink">14,350.00</span>
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-1.5 w-3/4 rounded-full bg-paper-sunken" />
            <div className="h-1.5 w-2/5 rounded-full bg-paper-sunken" />
          </div>
        </div>

        {/* Right: what the model read back */}
        <div className="rounded-xl border border-line-dark bg-forest-950 p-4">
          <p className="text-[10.5px] font-medium uppercase tracking-wider text-forest-300">
            Extracted record
          </p>
          <dl className="mt-3 space-y-2">
            {extracted.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] px-3 py-2"
              >
                <dt className="text-[12px] text-forest-300">{row.label}</dt>
                <dd className="flex items-center gap-2 text-[12.5px] font-medium text-paper">
                  <span className="truncate">{row.value}</span>
                  <Check size={12} className="shrink-0 text-brass-400" />
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 border-t border-line-dark pt-3 text-[12px] leading-relaxed text-forest-300">
            Saved under Business expense for tax year 2026-27. Input tax noted for the sales tax
            return.
          </p>
        </div>
      </div>
    </div>
  );
}
