import Link from 'next/link';
import { Mark } from '@/components/Brand';

const columns = [
  {
    title: 'Product',
    links: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/scan', label: 'Document scanner' },
      { href: '/advisor', label: 'Tax advisor' },
      { href: '/calculator', label: 'Tax calculator' },
      { href: '/notices', label: 'Notice handler' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/guide', label: 'Ollama setup guide' },
      { href: '/about', label: 'About TaxFillr' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/legal#terms', label: 'Terms of service' },
      { href: '/legal#privacy', label: 'Privacy policy' },
      { href: '/legal#disclaimer', label: 'Disclaimer' },
      { href: '/legal#cookies', label: 'Cookies' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line-dark bg-forest-950 text-forest-300">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <Mark className="bg-forest-900" />
              <span className="font-display text-[21px] leading-none text-paper">TaxFillr</span>
            </Link>
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed">
              Tax records, estimates and FBR notice replies for people who file their own returns in
              Pakistan.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-[12px] font-medium uppercase tracking-wider text-paper">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[14px] transition-colors hover:text-brass-400">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line-dark pt-7 text-[13px] sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl leading-relaxed">
            TaxFillr helps you organise records and understand paperwork. It does not replace a tax
            practitioner, and every figure it produces should be checked before you file. See the{' '}
            <Link href="/legal#disclaimer" className="text-brass-400 hover:underline">
              disclaimer
            </Link>{' '}
            for the full position.
          </p>
          <p className="shrink-0">© {new Date().getFullYear()} TaxFillr</p>
        </div>
      </div>
    </footer>
  );
}
