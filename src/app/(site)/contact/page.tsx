import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { ContactForm } from '@/components/site/ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Questions, bug reports and feedback about TaxFillr.',
};

const details = [
  { icon: Mail, title: 'Email', body: 'support@taxfillr.pk' },
  { icon: Clock, title: 'Reply time', body: 'Usually within one or two working days' },
  { icon: MapPin, title: 'Based in', body: 'Islamabad, Pakistan' },
  {
    icon: ShieldCheck,
    title: 'What we never ask for',
    body: 'Your API key, your CNIC, your IRIS password or your documents',
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get in touch"
        body="Bug reports are the most useful thing you can send. Tell us the page, the file type and what you expected to happen."
      />

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-4">
            {details.map((item) => (
              <div key={item.title} className="card flex gap-4 p-5">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paper-sunken text-forest-700">
                  <item.icon size={17} />
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold">{item.title}</h3>
                  <p className="mt-0.5 text-[14px] leading-relaxed text-ink-muted">{item.body}</p>
                </div>
              </div>
            ))}

            <div className="card bg-paper-sunken/70 p-5">
              <h3 className="text-[15px] font-semibold">Before you write</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
                Connection problems and key errors are covered end to end in the{' '}
                <Link href="/guide#troubleshooting" className="font-medium text-forest-700 underline underline-offset-2">
                  troubleshooting section
                </Link>{' '}
                of the setup guide. That solves most of what reaches this inbox.
              </p>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
}
