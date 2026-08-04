'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calculator,
  FileText,
  Gavel,
  LayoutDashboard,
  Menu,
  MessagesSquare,
  ScanLine,
  Settings as SettingsIcon,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Mark } from '@/components/Brand';
import { useStore } from '@/lib/store';

const groups = [
  {
    title: 'Records',
    links: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/scan', label: 'Scan document', icon: ScanLine },
      { href: '/documents', label: 'My documents', icon: FileText },
    ],
  },
  {
    title: 'Tools',
    links: [
      { href: '/advisor', label: 'Tax advisor', icon: MessagesSquare },
      { href: '/calculator', label: 'Tax calculator', icon: Calculator },
      { href: '/notices', label: 'Notice handler', icon: Gavel },
    ],
  },
  {
    title: 'Account',
    links: [{ href: '/settings', label: 'Settings', icon: SettingsIcon }],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { hasAI, settings, docs, ready } = useStore();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-paper">
      {open ? (
        <button
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-forest-950/40 lg:hidden"
        />
      ) : null}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-[260px] shrink-0 flex-col bg-forest-950 px-4 py-5 transition-transform lg:sticky lg:inset-y-auto lg:top-0 lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-1.5">
          <Link href="/" className="flex items-center gap-2.5">
            <Mark className="bg-forest-900" />
            <span className="font-display text-[20px] leading-none text-paper">TaxFillr</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="rounded-md p-1.5 text-forest-300 lg:hidden"
          >
            <X size={17} />
          </button>
        </div>

        <nav className="scroll-thin mt-7 flex-1 overflow-y-auto">
          {groups.map((group) => (
            <div key={group.title} className="mb-6">
              <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-forest-300/60">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.links.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={clsx(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14.5px] transition-colors',
                          active
                            ? 'bg-forest-800 text-paper'
                            : 'text-forest-300 hover:bg-white/5 hover:text-paper',
                        )}
                      >
                        <link.icon size={17} className={active ? 'text-brass-400' : ''} />
                        {link.label}
                        {link.href === '/documents' && ready && docs.length > 0 ? (
                          <span className="ml-auto rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-forest-300">
                            {docs.length}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="rounded-xl border border-line-dark bg-forest-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-paper">AI connection</span>
            <span
              className={clsx(
                'rounded-md px-1.5 py-0.5 text-[11.5px] font-medium',
                hasAI ? 'bg-forest-800 text-brass-400' : 'bg-white/10 text-forest-300',
              )}
            >
              {ready ? (hasAI ? 'Ready' : 'No key') : 'Loading'}
            </span>
          </div>
          <p className="mt-2 truncate font-mono text-[11.5px] text-forest-300">
            {settings.model || 'gemma4:31b-cloud'}
          </p>
          {ready && !hasAI ? (
            <Link
              href="/settings"
              className="mt-3 inline-flex text-[12.5px] font-medium text-brass-400 hover:underline"
            >
              Add your Ollama key
            </Link>
          ) : null}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-paper/90 px-4 backdrop-blur lg:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="rounded-lg border border-line p-2 text-ink-muted"
          >
            <Menu size={18} />
          </button>
          <Link href="/" className="font-display text-[18px] leading-none">
            TaxFillr
          </Link>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-[30px] leading-tight">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-[14.5px] text-ink-soft">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
    </div>
  );
}
