import clsx from 'clsx';
import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'onDark';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-55';

const variants: Record<Variant, string> = {
  primary: 'bg-forest-800 text-paper hover:bg-forest-700 active:bg-forest-900',
  accent: 'bg-brass-500 text-forest-950 hover:bg-brass-400 active:bg-brass-600',
  outline: 'border border-line-strong bg-paper-raised text-ink hover:border-forest-600 hover:text-forest-800',
  ghost: 'text-ink-muted hover:bg-paper-sunken hover:text-ink',
  danger: 'border border-clay-600/25 bg-clay-100 text-clay-700 hover:bg-clay-100/70',
  onDark: 'border border-white/20 text-paper hover:border-brass-400 hover:text-brass-400',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13.5px]',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-12 px-6 text-[15.5px]',
};

interface Shared {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: Shared & ComponentProps<'button'>) {
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: Shared & ComponentProps<typeof Link>) {
  return (
    <Link className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}
