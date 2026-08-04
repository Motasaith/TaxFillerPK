import type { Metadata } from 'next';
import { PageHero } from '@/components/site/PageHero';
import { LegalTabs } from '@/components/site/LegalTabs';

export const metadata: Metadata = {
  title: 'Legal',
  description:
    'Terms of service, privacy policy, disclaimer and cookie policy for TaxFillr.',
};

export default function LegalPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms, privacy and disclaimer"
        body="Short version: the app stores nothing about you, and every number it produces is a draft you check before you file. The full version is below."
      />

      <section className="mx-auto max-w-6xl px-5 py-16">
        <LegalTabs />
      </section>
    </>
  );
}
