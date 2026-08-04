import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Wordmark } from '@/components/Brand';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line px-5 py-4">
        <div className="mx-auto max-w-6xl">
          <Wordmark />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-20">
        <p className="font-mono text-[13px] text-brass-600">404</p>
        <h1 className="mt-3 font-display text-[38px] leading-tight">This page does not exist</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-ink-muted">
          The link may be out of date. Everything in the app is reachable from the dashboard, and the
          public pages are linked in the footer.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/dashboard" variant="primary">
            Go to the dashboard
          </ButtonLink>
          <ButtonLink href="/" variant="outline">
            Back to the home page
          </ButtonLink>
        </div>
        <p className="mt-8 text-[14px] text-ink-soft">
          Something broken?{' '}
          <Link href="/contact" className="font-medium text-forest-700 underline underline-offset-2">
            Tell us about it
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
