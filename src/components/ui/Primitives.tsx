import clsx from 'clsx';
import type { ReactNode } from 'react';

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return <div className={clsx('card', padded && 'p-6', className)}>{children}</div>;
}

export function CardTitle({
  icon,
  title,
  hint,
  action,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {icon ? <span className="mt-0.5 text-forest-600">{icon}</span> : null}
        <div>
          <h2 className="text-[16px] font-semibold leading-tight text-ink">{title}</h2>
          {hint ? <p className="mt-1 text-[13.5px] text-ink-soft">{hint}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}

type Tone = 'neutral' | 'green' | 'brass' | 'clay';

const toneClass: Record<Tone, string> = {
  neutral: 'border-line bg-paper-sunken text-ink-muted',
  green: 'border-forest-100 bg-forest-100/70 text-forest-800',
  brass: 'border-brass-100 bg-brass-50 text-brass-700',
  clay: 'border-clay-600/20 bg-clay-100 text-clay-700',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[12px] font-medium',
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Notice({
  tone = 'neutral',
  icon,
  children,
  className,
}: {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'flex items-start gap-3 rounded-xl border px-4 py-3.5 text-[14px] leading-relaxed',
        toneClass[tone],
        className,
      )}
    >
      {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-paper-raised/60 px-6 py-16 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-paper-sunken text-ink-soft">
        {icon}
      </span>
      <h3 className="text-[16px] font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[14px] text-ink-soft">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={clsx('block', className)}>
      <span className="label">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-[12.5px] text-ink-soft">{hint}</span> : null}
    </label>
  );
}

export function Stat({
  label,
  value,
  hint,
  accent = 'brass',
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: 'brass' | 'green' | 'forest' | 'clay';
}) {
  const bar = {
    brass: 'bg-brass-500',
    green: 'bg-forest-500',
    forest: 'bg-forest-800',
    clay: 'bg-clay-600',
  }[accent];

  return (
    <div className="card relative overflow-hidden p-5">
      <span className={clsx('absolute inset-y-0 left-0 w-1', bar)} />
      <p className="text-[12px] font-medium uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="tabular mt-2 font-display text-[26px] leading-none text-ink">{value}</p>
      {hint ? <p className="mt-2 text-[12.5px] text-ink-soft">{hint}</p> : null}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
      aria-hidden
    />
  );
}
