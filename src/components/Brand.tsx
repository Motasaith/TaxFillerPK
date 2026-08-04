import clsx from 'clsx';
import Link from 'next/link';

export function Mark({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest-950',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
        <path
          d="M6 4h9l3 3v13H6z"
          fill="none"
          stroke="#D9B85C"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M9.5 11h5M9.5 14.5h3" stroke="#D9B85C" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function Wordmark({
  href = '/',
  tone = 'dark',
  className,
}: {
  href?: string;
  tone?: 'dark' | 'light';
  className?: string;
}) {
  return (
    <Link href={href} className={clsx('flex items-center gap-2.5', className)}>
      <Mark />
      <span
        className={clsx(
          'font-display text-[21px] leading-none tracking-tight',
          tone === 'light' ? 'text-paper' : 'text-ink',
        )}
      >
        TaxFillr
      </span>
    </Link>
  );
}
