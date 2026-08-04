'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Wordmark } from '@/components/Brand';
import { ButtonLink } from '@/components/ui/Button';

const links = [
  { href: '/about', label: 'About' },
  { href: '/guide', label: 'Setup guide' },
  { href: '/contact', label: 'Contact' },
  { href: '/legal', label: 'Legal' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5">
        <Wordmark />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'rounded-lg px-3 py-2 text-[14.5px] transition-colors',
                pathname?.startsWith(link.href)
                  ? 'text-ink'
                  : 'text-ink-muted hover:bg-paper-sunken hover:text-ink',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink href="/dashboard" variant="primary" size="sm" className="hidden sm:inline-flex">
            Open the app
          </ButtonLink>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="rounded-lg border border-line p-2 text-ink-muted md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-line bg-paper px-5 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block border-b border-line/70 py-3 text-[15px] text-ink"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block py-3 text-[15px] font-medium text-forest-700"
          >
            Open the app
          </Link>
        </div>
      ) : null}
    </header>
  );
}
