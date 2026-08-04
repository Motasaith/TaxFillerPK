import {
  ArrowRight,
  Calculator,
  FileWarning,
  FolderTree,
  KeyRound,
  Lock,
  MessagesSquare,
  ScanLine,
} from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { HeroPreview } from '@/components/site/HeroPreview';
import { FAQ } from '@/components/site/FAQ';

const steps = [
  {
    n: '01',
    title: 'Upload whatever you have',
    body: 'A phone photo of a receipt, a PDF salary slip, a bank statement in Excel, or the letter that arrived from the tax office. Text recognition runs on your own machine, including Urdu when you need it.',
    detail: 'JPG, PNG, PDF, CSV, XLSX and plain text.',
  },
  {
    n: '02',
    title: 'Check what was read',
    body: 'The model pulls out the vendor, date, amount, tax deducted and the right head of account, then hands you a form. Fix anything that looks wrong before it is saved. Nothing is filed behind your back.',
    detail: 'Every field stays editable, always.',
  },
  {
    n: '03',
    title: 'Use it at filing time',
    body: 'Totals by head, tax already deducted, an estimate of the balance payable, and a ledger you can export to CSV and copy into IRIS screen by screen.',
    detail: 'Export to CSV or a full JSON backup.',
  },
];

const features = [
  {
    icon: ScanLine,
    title: 'Reads real documents',
    body: 'Thermal receipts, salary slips, utility bills, PSID challans and withholding certificates. Scanned PDFs with no text layer fall back to image recognition automatically.',
  },
  {
    icon: FolderTree,
    title: 'Keeps a proper ledger',
    body: 'Every record carries a head of account, a date, a gross amount and the tax deducted, so the numbers you need at filing time are already added up.',
  },
  {
    icon: MessagesSquare,
    title: 'Answers tax questions',
    body: 'Ask about slabs, credits, ATL status or an IRIS screen you are stuck on. The advisor can see your saved totals, so answers use your figures rather than made up ones.',
  },
  {
    icon: Calculator,
    title: 'Estimates what you owe',
    body: 'Slab by slab working for salaried and non-salaried income, set against the tax already deducted on your saved documents.',
  },
  {
    icon: FileWarning,
    title: 'Handles notices',
    body: 'Upload the notice and get the section, the deadline, the amount at stake, a risk rating and a formal reply you can edit and send.',
  },
  {
    icon: Lock,
    title: 'Stays on your device',
    body: 'No account, no server, no database. Records live in your browser storage and the only outbound call is to Ollama with your own key.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-line-dark bg-forest-950 text-paper">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <p className="inline-flex items-center rounded-full border border-line-dark bg-forest-900 px-3 py-1 text-[12.5px] font-medium text-forest-300">
              Built for filers in Pakistan
            </p>
            <h1 className="mt-6 font-display text-[clamp(2.6rem,5.5vw,4.1rem)] font-normal leading-[1.05] tracking-tight text-paper">
              Your tax paperwork,
              <br />
              finally in order.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-forest-300">
              Photograph a receipt or the letter FBR just sent you. TaxFillr reads it, files it under
              the right head, works out what you owe, and drafts the reply you need to send back.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/dashboard" variant="accent" size="lg">
                Open the app
                <ArrowRight size={17} />
              </ButtonLink>
              <ButtonLink href="/guide" variant="onDark" size="lg">
                Get an Ollama key first
              </ButtonLink>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-2 gap-x-8 gap-y-4 border-t border-line-dark pt-7 sm:grid-cols-3">
              {[
                ['Runs in', 'your browser'],
                ['Powered by', 'your Ollama key'],
                ['Written for', 'FBR rules'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[12px] uppercase tracking-wider text-forest-300/70">{label}</dt>
                  <dd className="mt-1 text-[14.5px] text-paper">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroPreview />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-[clamp(2rem,3.6vw,2.8rem)] leading-tight">
            Three steps, then it is done
          </h2>
          <p className="mt-4 text-[16.5px] leading-relaxed text-ink-muted">
            The point is not the scanning. The point is that in September you already have every
            figure you need, in the shape IRIS asks for.
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.n} className="flex flex-col bg-paper-raised p-7">
              <span className="font-mono text-[13px] text-brass-600">{step.n}</span>
              <h3 className="mt-4 text-[19px] font-semibold leading-snug">{step.title}</h3>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-muted">{step.body}</p>
              <p className="mt-5 border-t border-line pt-4 text-[13.5px] text-ink-soft">
                {step.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-line bg-paper-sunken/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="max-w-2xl">
            <h2 className="font-display text-[clamp(2rem,3.6vw,2.8rem)] leading-tight">
              What you actually get
            </h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-ink-muted">
              Six things that between them cover the year, from the first receipt in July to the
              return you file the following September.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="card p-6">
                <feature.icon size={20} className="text-forest-600" />
                <h3 className="mt-4 text-[17px] font-semibold">{feature.title}</h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-muted">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notices */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-[clamp(2rem,3.6vw,2.8rem)] leading-tight">
              The envelope you did not want to open
            </h2>
            <p className="mt-5 text-[16.5px] leading-relaxed text-ink-muted">
              Most notices are routine. The problem is that they are written for officers, not for
              taxpayers, and the clock starts the day they are issued.
            </p>
            <p className="mt-4 text-[16.5px] leading-relaxed text-ink-muted">
              Upload the notice and you get a plain reading of it: which section it was issued under,
              what is being asked, how long you have, what happens if you do nothing, and a formal
              reply drafted in your name that you can edit, download and send.
            </p>
            <div className="mt-8">
              <ButtonLink href="/notices" variant="primary">
                Try the notice handler
                <ArrowRight size={16} />
              </ButtonLink>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line bg-paper-sunken/70 px-5 py-3.5">
              <span className="text-[13px] font-medium text-ink">Notice analysis</span>
              <span className="rounded-md border border-clay-600/20 bg-clay-100 px-2 py-0.5 text-[12px] font-medium text-clay-700">
                High risk
              </span>
            </div>
            <dl className="divide-y divide-line text-[14px]">
              {[
                ['Type', 'Amendment of assessment'],
                ['Section', '122(5A)'],
                ['Authority', 'DCIR, Unit 04, RTO Lahore'],
                ['Tax year', '2025'],
                ['Amount raised', 'Rs 486,000'],
                ['Reply due', '14 days from issue'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-6 px-5 py-3">
                  <dt className="text-ink-soft">{label}</dt>
                  <dd className="text-right font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-line bg-paper-sunken/50 px-5 py-4">
              <p className="text-[13.5px] leading-relaxed text-ink-muted">
                Next step: file the reply with supporting evidence of the deductions already claimed,
                or request an extension in writing before the due date. A draft letter is ready to
                download.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Setup */}
      <section className="border-y border-line-dark bg-forest-950 text-paper">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="font-display text-[clamp(2rem,3.6vw,2.8rem)] leading-tight text-paper">
              One key, five minutes
            </h2>
            <p className="mt-5 max-w-lg text-[16.5px] leading-relaxed text-forest-300">
              TaxFillr has no AI subscription of its own. You bring a key from Ollama and the app
              talks to the model directly from your browser. That is why your documents never sit on
              anyone else&apos;s server.
            </p>
            <div className="mt-8">
              <ButtonLink href="/guide" variant="accent">
                <KeyRound size={16} />
                Read the setup guide
              </ButtonLink>
            </div>
          </div>

          <ol className="space-y-3">
            {[
              ['Create a free account', 'Sign up at ollama.com with an email address or a Google account.'],
              ['Generate a key', 'Open Settings, then Keys, then create one and copy it. Keys are shown once.'],
              ['Paste it into Settings', 'Open the TaxFillr settings page, paste the key and press Test connection.'],
            ].map(([title, body], i) => (
              <li
                key={title}
                className="flex gap-4 rounded-xl border border-line-dark bg-forest-900/50 p-5"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brass-500 text-[13px] font-semibold text-forest-950">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[15px] font-medium text-paper">{title}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-forest-300">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-5 py-20">
        <h2 className="font-display text-[clamp(2rem,3.6vw,2.8rem)] leading-tight">
          Questions people ask
        </h2>
        <div className="mt-10">
          <FAQ />
        </div>
      </section>

      {/* Close */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="card flex flex-col items-start justify-between gap-6 p-9 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-[26px] leading-tight">Start with one receipt</h2>
            <p className="mt-2 max-w-md text-[15px] text-ink-muted">
              Nothing to install and nothing to sign up for. Open the app and upload the first thing
              in your wallet.
            </p>
          </div>
          <ButtonLink href="/dashboard" variant="primary" size="lg" className="shrink-0">
            Open the app
            <ArrowRight size={17} />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
