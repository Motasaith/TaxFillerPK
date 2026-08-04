'use client';

import clsx from 'clsx';
import { useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ACCEPTED_FILES } from '@/lib/extract';

export function Dropzone({
  onFile,
  title,
  body,
  icon,
  accept = ACCEPTED_FILES,
  disabled = false,
}: {
  onFile: (file: File) => void;
  title: string;
  body: string;
  icon: ReactNode;
  accept?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const pick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  return (
    <div
      onClick={pick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          pick();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (disabled) return;
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      className={clsx(
        'flex flex-col items-center rounded-2xl border border-dashed px-6 py-12 text-center transition-colors',
        disabled
          ? 'cursor-not-allowed border-line bg-paper-sunken/60 opacity-70'
          : 'cursor-pointer border-line-strong bg-paper-raised hover:border-forest-600 hover:bg-forest-100/25',
        over && !disabled && 'border-forest-600 bg-forest-100/40',
      )}
    >
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-950 text-brass-400">
        {icon}
      </span>
      <h3 className="text-[17px] font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-ink-soft">{body}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) onFile(file);
        }}
      />
    </div>
  );
}

export function ProgressBar({ pct, label }: { pct: number; label?: string }) {
  return (
    <div className="mt-4">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-sunken">
        <div
          className="h-full rounded-full bg-forest-600 transition-[width] duration-200"
          style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
        />
      </div>
      {label ? <p className="mt-2 text-[13px] text-ink-soft">{label}</p> : null}
    </div>
  );
}
