'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';

const TABS = [
  { id: 'terms', label: 'Terms of service' },
  { id: 'privacy', label: 'Privacy policy' },
  { id: 'disclaimer', label: 'Disclaimer' },
  { id: 'cookies', label: 'Cookies' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const EFFECTIVE = '1 August 2026';

export function LegalTabs() {
  const [tab, setTab] = useState<TabId>('terms');

  useEffect(() => {
    const fromHash = window.location.hash.replace('#', '');
    if (TABS.some((t) => t.id === fromHash)) setTab(fromHash as TabId);
  }, []);

  function select(id: TabId) {
    setTab(id);
    history.replaceState(null, '', `#${id}`);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-line pb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => select(t.id)}
            className={clsx(
              'rounded-lg px-3.5 py-2 text-[14px] font-medium transition-colors',
              tab === t.id
                ? 'bg-forest-800 text-paper'
                : 'border border-line text-ink-muted hover:border-line-strong hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="prose-doc mt-10 max-w-prose">
        {tab === 'terms' ? <Terms /> : null}
        {tab === 'privacy' ? <Privacy /> : null}
        {tab === 'disclaimer' ? <Disclaimer /> : null}
        {tab === 'cookies' ? <Cookies /> : null}
      </div>
    </div>
  );
}

function Effective() {
  return (
    <p className="text-[13.5px] text-ink-soft">
      Effective {EFFECTIVE}. These terms apply to everyone who loads the TaxFillr site.
    </p>
  );
}

function Terms() {
  return (
    <>
      <h2 className="!mt-0">Terms of service</h2>
      <Effective />

      <h3>1. What you are agreeing to</h3>
      <p>
        TaxFillr is a free tool for organising tax records and understanding correspondence from tax
        authorities in Pakistan. By loading the site you accept these terms. If you do not accept
        them, do not use the app. There is no account to close, so stopping simply means closing the
        page and clearing site data.
      </p>

      <h3>2. How the service runs</h3>
      <p>
        The application is delivered as static files and runs inside your browser. We operate no
        database, no user accounts and no storage of your documents. Records you create live in your
        browser storage on the device you created them on. Clearing that storage deletes them
        permanently and we hold no copy from which they can be restored, which is why the settings
        page provides a backup file you should download periodically.
      </p>

      <h3>3. Third party model access</h3>
      <p>
        Analysis features call the Ollama API using an API key that you supply. Your use of Ollama is
        governed by Ollama&apos;s own terms and pricing, which you accept separately with them. You
        are responsible for keeping your key confidential, for the cost of the calls you make, and
        for any consequence of a key being shared or exposed. We do not hold, log or retain your key.
        Where you choose the relay connection mode, the request passes through infrastructure hosting
        this site solely to be forwarded, and neither the key nor the content is stored.
      </p>

      <h3>4. Acceptable use</h3>
      <p>
        Use TaxFillr for lawful management of your own tax affairs or those of a client who has
        authorised you. You must not use it to prepare false records, understate income, fabricate
        documents or otherwise evade tax. You must not attempt to present output from this tool as an
        opinion issued by a licensed practitioner.
      </p>

      <h3>5. Accuracy is your responsibility</h3>
      <p>
        Everything the tool produces, including extracted fields, category assignments, calculated
        liabilities, readings of notices and drafted replies, is a working draft that you must verify
        before relying on it. Tax rates, thresholds and deadlines change with every Finance Act and
        with departmental circulars issued in between. Language models make mistakes, misread poor
        scans and can state an outdated rate with complete confidence. You remain the filer of your
        return and the author of anything you send to a tax authority.
      </p>

      <h3>6. No professional relationship</h3>
      <p>
        Using this application does not create a client relationship with us, and nothing it produces
        is legal, accounting or tax advice. For an audit, an appeal, a disputed assessment, a
        prosecution notice or any matter involving significant sums, engage a chartered accountant or
        an advocate.
      </p>

      <h3>7. Limitation of liability</h3>
      <p>
        The service is provided as is and as available, without warranty of any kind, whether
        express, implied or statutory, including any warranty of merchantability, fitness for a
        particular purpose, accuracy or non infringement. We do not warrant that the service will be
        uninterrupted, that results will be correct, or that any calculation reflects current law.
      </p>
      <p>
        To the fullest extent permitted by law, we are not liable for any loss or damage arising out
        of or connected with your use of the service. This includes tax underpaid or overpaid,
        penalties, default surcharge, interest, professional fees, rejected or amended returns,
        missed deadlines, an unfavourable outcome to a notice or an appeal, loss of records, loss of
        profit, loss of data and any indirect or consequential loss. This applies whether the claim
        arises in contract, tort, negligence, statute or otherwise, and whether or not we were told
        such loss was possible. Where liability cannot lawfully be excluded, it is limited to the
        amount you have paid us for the service, which is zero.
      </p>
      <p>
        Nothing in these terms limits liability for fraud or for anything else that cannot be limited
        under the applicable law.
      </p>

      <h3>8. Intellectual property</h3>
      <p>
        The application is open source and free to use, study and modify for personal and educational
        purposes. The name, the wordmark and the visual identity are not covered by that permission.
        Commercial redistribution requires a separate agreement.
      </p>

      <h3>9. Changes</h3>
      <p>
        These terms may be updated as the application changes. The effective date at the top of this
        page shows when the current version took effect, and continuing to use the app after that
        date means you accept the update.
      </p>

      <h3>10. Governing law</h3>
      <p>
        These terms are governed by the laws of the Islamic Republic of Pakistan, and the courts at
        Islamabad have jurisdiction over any dispute arising from them.
      </p>
    </>
  );
}

function Privacy() {
  return (
    <>
      <h2 className="!mt-0">Privacy policy</h2>
      <Effective />

      <h3>What we collect</h3>
      <p>
        Nothing. TaxFillr has no accounts, no analytics, no advertising trackers and no server side
        storage. We cannot see your documents, your figures, your key or even that you visited,
        beyond the ordinary request logs kept by the hosting provider.
      </p>

      <h3>What stays on your device</h3>
      <p>
        Saved records, notice analyses, advisor conversations, your profile details and your API key
        are written to your browser&apos;s local storage. They stay on that device and in that
        browser. Using a different browser or a private window means starting empty. Clearing site
        data erases everything, permanently.
      </p>

      <h3>What leaves your device</h3>
      <p>
        Only two things. First, the text extracted from a document, sent to Ollama for analysis with
        your key. Image recognition and file parsing finish before that point, so the image or the
        original file itself is never transmitted. Second, the questions you type into the advisor,
        along with a short summary of your saved totals when that context helps the answer.
      </p>
      <p>
        Those calls go directly from your browser to Ollama and are covered by Ollama&apos;s privacy
        policy, which you should read. If your browser blocks the direct call and you switch to the
        relay connection mode, the request passes through the edge function that ships with this
        site. It forwards the request and returns the reply. It writes nothing to disk and keeps no
        record of the key or the content.
      </p>

      <h3>Hosting</h3>
      <p>
        The site is served from Cloudflare Pages. Cloudflare processes standard request metadata such
        as IP address and user agent for delivery and abuse prevention, under its own policies.
      </p>

      <h3>Fonts and libraries</h3>
      <p>
        Fonts are bundled with the site rather than fetched from a font network, so no request is made
        to a third party on page load. The text recognition engine downloads its language data from a
        public CDN the first time you scan an image, and that download contains no information about
        you or your document.
      </p>

      <h3>Children</h3>
      <p>The application is intended for adults managing their own tax affairs.</p>

      <h3>Your rights</h3>
      <p>
        Because we hold no personal data, there is nothing for us to disclose, correct or delete. You
        exercise every one of those rights directly through your browser settings and the data
        management controls on the settings page.
      </p>
    </>
  );
}

function Disclaimer() {
  return (
    <>
      <h2 className="!mt-0">Disclaimer</h2>
      <Effective />

      <h3>This is not tax advice</h3>
      <p>
        TaxFillr is software for organising documents and doing arithmetic. It is not a chartered
        accountant, a tax consultant or a legal adviser, and nothing it produces is professional
        advice on which you can rely without checking. Where a decision carries real money or real
        risk, get an opinion from someone licensed to give one.
      </p>

      <h3>Limits of the model</h3>
      <p>
        The analysis features run on a general purpose language model. Such models misread damaged
        scans, confuse similar looking figures, occasionally invent a section number that sounds
        plausible, and can state a rate that was correct two Finance Acts ago. Treat every extracted
        field, every calculation, every reading of a notice and every drafted reply as a first draft
        prepared by a capable but fallible assistant.
      </p>
      <p>
        Cross check anything that matters against the text of the Income Tax Ordinance 2001, the
        current Finance Act, the relevant SRO or circular, and the FBR website, before you file
        anything or reply to anyone.
      </p>

      <h3>Rates and deadlines change</h3>
      <p>
        The slabs in the calculator reflect the schedules current at the time of writing. They are
        revised every June and can be amended mid year. The dates shown in the app are the usual
        statutory deadlines and are frequently extended or, less often, brought forward by
        notification. Confirm both before acting.
      </p>

      <h3>No guaranteed outcome</h3>
      <p>
        Using this tool does not guarantee a lower liability, acceptance of a return, a favourable
        response to a notice, or any particular treatment by a tax authority. Documents that are
        faint, handwritten, partially cropped or in a script the recognition engine handles poorly may
        be read incorrectly or not at all.
      </p>

      <h3>Where responsibility sits</h3>
      <p>
        You are the taxpayer. The return you submit, the figures in it and the letters you send are
        yours, and the consequences of an error in them, including any tax, penalty, default
        surcharge or professional cost, rest with you rather than with this tool or the people who
        wrote it. The full position is set out in the limitation of liability in the{' '}
        <a href="#terms">terms of service</a>.
      </p>
    </>
  );
}

function Cookies() {
  return (
    <>
      <h2 className="!mt-0">Cookie policy</h2>
      <Effective />
      <p>
        TaxFillr sets no cookies. There is no session to maintain, no user to identify and no
        advertising or analytics network involved, so there is nothing to consent to and no banner to
        dismiss.
      </p>
      <p>
        The app does use your browser&apos;s local storage, which is a different mechanism. Local
        storage holds your saved records, your settings and your advisor history on your own device
        and is never transmitted anywhere. It is not readable by other sites and it is not used to
        track you across the web.
      </p>
      <p>
        To remove it, use the Clear all data control on the settings page, or clear site data for this
        domain in your browser. Either action is immediate and cannot be undone, so export a backup
        first if the records still matter.
      </p>
      <p>
        Cloudflare, which serves the site, may set a security cookie to identify traffic patterns
        associated with abuse. That behaviour is described in Cloudflare&apos;s own documentation.
      </p>
    </>
  );
}
