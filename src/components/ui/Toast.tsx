'use client';

import clsx from 'clsx';
import { AlertTriangle, Check, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Tone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  title: string;
  body?: string;
  tone: Tone;
}

interface ToastApi {
  toast: (title: string, options?: { body?: string; tone?: Tone }) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastApi['toast']>(
    (title, options) => {
      const id = ++counter;
      setItems((list) => [...list.slice(-3), { id, title, body: options?.body, tone: options?.tone ?? 'success' }]);
      setTimeout(() => dismiss(id), options?.tone === 'error' ? 8000 : 4500);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[80] flex flex-col items-end gap-2 sm:left-auto sm:right-6 sm:w-[380px]">
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className={clsx(
              'pointer-events-auto w-full animate-rise rounded-xl border bg-paper-raised p-3.5 shadow-lift',
              item.tone === 'error' ? 'border-clay-600/25' : 'border-line',
            )}
          >
            <div className="flex gap-3">
              <span
                className={clsx(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                  item.tone === 'error'
                    ? 'bg-clay-100 text-clay-700'
                    : item.tone === 'info'
                      ? 'bg-brass-100 text-brass-700'
                      : 'bg-forest-100 text-forest-700',
                )}
              >
                {item.tone === 'error' ? (
                  <AlertTriangle size={12} />
                ) : item.tone === 'info' ? (
                  <Info size={12} />
                ) : (
                  <Check size={12} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-ink">{item.title}</p>
                {item.body ? (
                  <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-ink-muted">
                    {item.body}
                  </p>
                ) : null}
              </div>
              <button
                onClick={() => dismiss(item.id)}
                className="shrink-0 rounded-md p-1 text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider');
  return value;
}
