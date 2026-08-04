'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const items = [
  {
    q: 'What does TaxFillr cost?',
    a: 'The app itself is free and there is no account to create. The only cost is whatever your Ollama account charges for the model calls you make, which for a year of personal receipts is usually very little.',
  },
  {
    q: 'Where do my documents go?',
    a: 'Files are read inside your browser. Text recognition runs locally on your machine. Only the extracted text is sent for analysis, and it goes to Ollama using your own key. TaxFillr has no database and no accounts, so there is nothing on our side to leak.',
  },
  {
    q: 'Can it submit my return to FBR for me?',
    a: 'No. The IRIS portal has no public API, so the final submission is still done by you. TaxFillr gets your figures into a state where filling the IRIS forms takes minutes instead of an evening.',
  },
  {
    q: 'How accurate is the reading of a photo?',
    a: 'A flat, well lit photo of a printed receipt is usually read correctly. Faded thermal paper, handwriting and heavy stamps are harder. Every extracted field lands in an editable form before it is saved, so you always get the last word.',
  },
  {
    q: 'Which model does it use?',
    a: 'The default is gemma4:31b-cloud on Ollama Cloud. You can point the app at any other Ollama model, including one running on your own machine, from the Settings page.',
  },
  {
    q: 'Does it work for a business?',
    a: 'It works well for sole proprietors, freelancers and small shops that file as individuals. Company returns, group structures and full sales tax compliance are outside what this version covers.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-6 py-5 text-left"
            >
              <span className="text-[16.5px] font-medium text-ink">{item.q}</span>
              <Plus
                size={18}
                className={clsx(
                  'shrink-0 text-ink-soft transition-transform duration-200',
                  isOpen && 'rotate-45 text-forest-700',
                )}
              />
            </button>
            <div
              className={clsx(
                'grid transition-[grid-template-rows] duration-200',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-prose pb-6 text-[15px] leading-relaxed text-ink-muted">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
