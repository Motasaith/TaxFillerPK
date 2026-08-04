import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { CopyBlock } from '@/components/site/CopyBlock';
import { ButtonLink } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Primitives';

export const metadata: Metadata = {
  title: 'Setup guide',
  description:
    'Step by step: create an Ollama account, generate an API key, paste it into TaxFillr and run your first document.',
};

const toc = [
  ['what-you-need', 'What you need'],
  ['step-1', '1. Create an Ollama account'],
  ['step-2', '2. Generate an API key'],
  ['step-3', '3. Paste the key into TaxFillr'],
  ['step-4', '4. Run your first document'],
  ['local', 'Using a local Ollama server'],
  ['costs', 'What this costs'],
  ['troubleshooting', 'Troubleshooting'],
];

function Step({
  id,
  n,
  title,
  children,
}: {
  id: string;
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line pt-10">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-800 font-mono text-[14px] text-brass-400">
          {n}
        </span>
        <h2 className="font-display text-[26px] leading-tight">{title}</h2>
      </div>
      <div className="prose-doc mt-5">{children}</div>
    </section>
  );
}

export default function GuidePage() {
  return (
    <>
      <PageHero
        eyebrow="Setup guide"
        title="Getting your Ollama key"
        body="TaxFillr has no AI plan of its own. You bring a key, the app talks to the model from your browser, and your documents stay yours. This takes about five minutes."
      />

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-14 lg:grid-cols-[220px_1fr]">
          <nav className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <p className="mb-3 text-[12px] font-medium uppercase tracking-wider text-ink-soft">
              On this page
            </p>
            <ul className="space-y-1 border-l border-line">
              {toc.map(([id, label]) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="-ml-px block border-l border-transparent py-1.5 pl-4 text-[13.5px] text-ink-muted transition-colors hover:border-brass-500 hover:text-ink"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="max-w-prose">
            <section id="what-you-need" className="scroll-mt-24">
              <div className="prose-doc">
                <h2 className="!mt-0">What you need</h2>
                <p>
                  Three things: an email address, a browser, and about five minutes. There is nothing
                  to install on your computer and nothing to pay upfront.
                </p>
                <p>
                  Ollama is a platform for running large language models. TaxFillr uses its cloud API
                  with the <code>gemma4:31b-cloud</code> model, which is good at pulling structured
                  fields out of messy documents and knows enough about tax administration to be
                  useful. You can switch to another model later without changing anything else.
                </p>
              </div>
            </section>

            <Step id="step-1" n={1} title="Create an Ollama account">
              <p>
                Go to{' '}
                <a href="https://ollama.com" target="_blank" rel="noreferrer">
                  ollama.com <ExternalLink size={12} className="inline align-baseline" />
                </a>{' '}
                and sign up. Email or a Google account both work. Confirm your address if a
                verification mail arrives, otherwise key creation stays locked.
              </p>
            </Step>

            <Step id="step-2" n={2} title="Generate an API key">
              <p>
                Once you are signed in, open your account menu and find the section for keys. It is
                usually under Settings, then Keys, and it may be labelled API keys or Developer.
              </p>
              <ol>
                <li>Select the option to create a new key.</li>
                <li>Name it something you will recognise later, for example TaxFillr laptop.</li>
                <li>Copy the key immediately. It is shown once and cannot be retrieved afterwards.</li>
              </ol>
              <Notice tone="brass" icon={<AlertTriangle size={16} />} className="my-5">
                A key is a password. Anyone holding it can spend your quota. Do not paste it into a
                chat group or a screenshot. If you think it leaked, delete it on ollama.com and
                generate a new one.
              </Notice>
            </Step>

            <Step id="step-3" n={3} title="Paste the key into TaxFillr">
              <p>
                Open the{' '}
                <Link href="/settings">Settings</Link> page in the app, paste the key into the API key
                field and press Save. The defaults for the other two fields are already correct for
                Ollama Cloud.
              </p>
              <CopyBlock
                label="Default configuration"
                value={`Base URL:  https://ollama.com
Model:     gemma4:31b-cloud
API key:   the key you just copied`}
              />
              <p>
                Press Test connection. A confirmation means everything is wired up. The key is written
                to your browser storage on this device only, so you will need to repeat this on your
                phone or on another machine.
              </p>
            </Step>

            <Step id="step-4" n={4} title="Run your first document">
              <p>
                Open <Link href="/scan">Scan document</Link> and upload something simple to start
                with, ideally a printed receipt or a salary slip rather than a faded thermal strip.
                Text recognition runs first and shows its progress, then the model reads the text and
                fills in a form.
              </p>
              <p>
                Check the fields, correct anything that is off, and save. The record appears in{' '}
                <Link href="/documents">My documents</Link> and its numbers immediately feed the
                dashboard totals and the calculator.
              </p>
            </Step>

            <section id="local" className="scroll-mt-24 border-t border-line pt-10">
              <div className="prose-doc">
                <h2 className="!mt-0">Using a local Ollama server</h2>
                <p>
                  If you already run Ollama on your own machine, you can keep everything offline
                  except the page itself. Install a model, then start the server so that it accepts
                  requests from the site.
                </p>
                <CopyBlock
                  label="Terminal"
                  value={`ollama pull gemma3:12b
set OLLAMA_ORIGINS=https://your-site.pages.dev
ollama serve`}
                />
                <p>
                  Then set the base URL in Settings to <code>http://localhost:11434</code> and the
                  model to whatever you pulled. On macOS or Linux use{' '}
                  <code>export OLLAMA_ORIGINS=...</code> instead of <code>set</code>. Without that
                  variable the browser blocks the request as a cross origin call.
                </p>
              </div>
            </section>

            <section id="costs" className="scroll-mt-24 border-t border-line pt-10">
              <div className="prose-doc">
                <h2 className="!mt-0">What this costs</h2>
                <p>
                  TaxFillr charges nothing. Ollama bills for the model calls, and the amounts involved
                  here are small: reading one document is a single short request, and a long advisor
                  conversation is a handful more. A full year of personal receipts is a light
                  workload, not a subscription level of usage.
                </p>
                <p>
                  Text recognition, PDF parsing and spreadsheet parsing all run on your own machine
                  and cost nothing at all. Only the analysis step calls the model.
                </p>
              </div>
            </section>

            <section id="troubleshooting" className="scroll-mt-24 border-t border-line pt-10">
              <h2 className="font-display text-[26px] leading-tight">Troubleshooting</h2>
              <div className="mt-6 space-y-4">
                {[
                  {
                    title: 'Ollama rejected the API key',
                    body: 'The key is wrong, was deleted, or has a stray space at one end. Generate a fresh key on ollama.com, paste it again and make sure nothing was cut off at the start.',
                  },
                  {
                    title: 'Model not found',
                    body: 'The model name does not exist on your account. Check the spelling of gemma4:31b-cloud, including the colon, or pick another model from the Ollama library.',
                  },
                  {
                    title: 'The relay is not running on this site',
                    body: 'Nothing is answering /api/ollama. Open that address in a browser tab: a deployed relay replies with a short JSON message. If it shows the 404 page instead, the functions folder was missing from the deployment. During local development the relay never runs under next dev, so use npm run preview.',
                  },
                  {
                    title: 'The request never left the browser',
                    body: 'An ad blocker or privacy extension is usually stopping it. Reload with extensions disabled, or add the site to their allow list. Note that a browser can never call ollama.com directly, whatever your extensions do, because it sends no CORS headers. That is what the relay is for.',
                  },
                  {
                    title: 'Text recognition is slow',
                    body: 'The first image on a fresh browser downloads the recognition engine, which takes a moment. Later files are much faster. Turning off Urdu reading roughly halves the download when you do not need it.',
                  },
                  {
                    title: 'The extracted fields are wrong',
                    body: 'Photograph the document flat, fill the frame and avoid shadows across the total. If it is still wrong, correct the form by hand. The saved record is whatever you approve, not whatever the model guessed.',
                  },
                ].map((item) => (
                  <div key={item.title} className="card p-5">
                    <h3 className="text-[15px] font-semibold">{item.title}</h3>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-muted">{item.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <ButtonLink href="/settings" variant="primary">
                  Go to Settings
                  <ArrowRight size={16} />
                </ButtonLink>
                <ButtonLink href="/contact" variant="outline">
                  Still stuck, contact us
                </ButtonLink>
              </div>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
