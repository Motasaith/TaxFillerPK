'use client';

import Link from 'next/link';
import { KeyRound } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Notice } from '@/components/ui/Primitives';

export function AiBanner() {
  const { ready, hasAI } = useStore();
  if (!ready || hasAI) return null;

  return (
    <Notice tone="brass" icon={<KeyRound size={16} />} className="mb-6">
      <span className="font-medium">Reading documents needs an Ollama key.</span> Add one in{' '}
      <Link href="/settings" className="font-medium underline underline-offset-2">
        Settings
      </Link>
      , or follow the{' '}
      <Link href="/guide" className="font-medium underline underline-offset-2">
        five minute setup guide
      </Link>
      . The calculator and your saved records work without it.
    </Notice>
  );
}
