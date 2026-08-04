import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/site/PageHero';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Why TaxFillr exists, how it works technically, and what it deliberately does not do.',
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Built by people who file their own returns"
        body="TaxFillr started as a folder of crumpled receipts and a notice that nobody could explain. It is the tool we wanted in that week."
      />

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          <div className="prose-doc max-w-prose">
            <h2>Why this exists</h2>
            <p>
              Filing in Pakistan is not hard because the rules are impossible. It is hard because the
              inputs are scattered. The salary certificate is in email, the utility bills are in a
              drawer, the vehicle token receipt is in the glovebox, and the withholding deducted on a
              bank transaction only shows up if you know where to look. By September, reconstructing
              a year takes an evening you do not have.
            </p>
            <p>
              The other half of the problem is language. A notice under section 122(5A) is a routine
              piece of administration for the officer who issued it and a genuinely frightening piece
              of paper for the person who receives it. Most people pay someone just to be told what
              it says.
            </p>
            <p>
              TaxFillr attacks both. Records get captured the moment they exist rather than the week
              they are needed, and anything the tax office sends you gets translated into plain
              language with a defensible next step.
            </p>

            <h2>How it is put together</h2>
            <p>
              The whole application is a static site. There is no backend, no user account and no
              database. When you open a page, your browser downloads a few files and everything after
              that happens on your own machine.
            </p>
            <ul>
              <li>
                Text recognition runs locally through Tesseract, so the image itself never leaves the
                device.
              </li>
              <li>
                PDF and spreadsheet parsing also happens in the browser, using pdf.js and SheetJS.
              </li>
              <li>
                Only the extracted text is sent for analysis, and it goes straight to Ollama using the
                key you supplied.
              </li>
              <li>
                Records, settings and chat history sit in your browser storage. Clearing site data
                removes them permanently, which is why the settings page offers a backup file.
              </li>
            </ul>
            <p>
              An optional relay ships with the site for people whose browser blocks the direct call to
              Ollama. It forwards the request and nothing else: no logging, no storage, no key
              retention. You can turn it off in Settings and stay fully direct.
            </p>

            <h2>What it is written for</h2>
            <p>
              Everything is scoped to Pakistan on purpose. The heads of account match how FBR thinks
              about income, the slabs follow the salaried and non-salaried schedules, amounts are in
              rupees with lakh and crore where that reads better, dates follow the July to June tax
              year, and the notice templates use the section numbers officers actually cite.
            </p>

            <h2>What it does not do</h2>
            <p>
              It does not submit anything to FBR. It does not represent you in an audit. It does not
              replace a chartered accountant on a complicated matter, and it is not built for company
              returns or full sales tax compliance. It reads paperwork, keeps a ledger, does the
              arithmetic and drafts letters. Everything it produces is a starting point that you check
              before it becomes official.
            </p>

            <h2>Credit where it is due</h2>
            <p>
              The idea of pointing a model at a pile of receipts comes from{' '}
              <a href="https://github.com/vas3k/TaxHacker" target="_blank" rel="noreferrer">
                TaxHacker
              </a>{' '}
              by vas3k. TaxFillr takes that starting point and rebuilds it around Pakistani rules,
              adding notice handling, an advisor that can see your ledger, and a calculator that uses
              local slabs.
            </p>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <h3 className="text-[15px] font-semibold">In short</h3>
              <dl className="mt-4 space-y-3.5 text-[14px]">
                {[
                  ['Runs', 'Entirely in the browser'],
                  ['Stores', 'Nothing on any server'],
                  ['Model', 'Your own Ollama key'],
                  ['Scope', 'Individual filers in Pakistan'],
                  ['Cost', 'Free, you pay Ollama for usage'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
                    <dt className="text-ink-soft">{label}</dt>
                    <dd className="text-right font-medium text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="card bg-forest-950 p-6 text-forest-300">
              <h3 className="text-[15px] font-semibold text-paper">Ready to try it</h3>
              <p className="mt-2 text-[14px] leading-relaxed">
                The setup guide takes about five minutes and covers getting a key from Ollama.
              </p>
              <Link
                href="/guide"
                className="mt-4 inline-flex text-[14px] font-medium text-brass-400 hover:underline"
              >
                Open the setup guide
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
