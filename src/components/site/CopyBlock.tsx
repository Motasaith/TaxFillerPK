'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function CopyBlock({ label, value }: { label?: string; value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-line-dark bg-forest-950">
      <div className="flex items-center justify-between border-b border-line-dark px-4 py-2.5">
        <span className="text-[12px] font-medium uppercase tracking-wider text-forest-300">
          {label ?? 'Settings'}
        </span>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            } catch {
              setCopied(false);
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-2.5 py-1 text-[12px] text-forest-300 transition-colors hover:border-brass-400 hover:text-brass-400"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed text-forest-300">
        {value}
      </pre>
    </div>
  );
}
