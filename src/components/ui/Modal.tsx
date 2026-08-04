'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex animate-fade items-end justify-center bg-forest-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[92vh] w-full max-w-2xl animate-rise flex-col overflow-hidden rounded-t-2xl border border-line bg-paper-raised shadow-lift sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div className="min-w-0">
            <h2 className="truncate text-[18px] font-semibold text-ink">{title}</h2>
            {subtitle ? <p className="mt-0.5 truncate text-[13.5px] text-ink-soft">{subtitle}</p> : null}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg border border-line p-2 text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            <X size={15} />
          </button>
        </header>
        <div className="scroll-thin flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <footer className="border-t border-line bg-paper px-6 py-4">{footer}</footer> : null}
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = 'Delete',
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmLabel?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-[14.5px] leading-relaxed text-ink-muted">{body}</p>
      <div className="mt-6 flex justify-end gap-2.5">
        <button
          onClick={onClose}
          className="h-10 rounded-lg border border-line-strong bg-paper-raised px-4 text-[14px] font-medium text-ink transition-colors hover:border-forest-600"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="h-10 rounded-lg bg-clay-600 px-4 text-[14px] font-medium text-white transition-colors hover:bg-clay-700"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
