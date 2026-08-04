'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FileText, PencilLine, RotateCcw, Save, Sparkles, Upload } from 'lucide-react';
import { PageHeader } from '@/components/app/AppShell';
import { AiBanner } from '@/components/app/AiBanner';
import { DocForm } from '@/components/app/DocForm';
import { Button } from '@/components/ui/Button';
import { Dropzone, ProgressBar } from '@/components/ui/Dropzone';
import { Card, CardTitle, EmptyState, Notice, Spinner } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';
import { analyseDocument, type DraftDoc } from '@/lib/ai';
import { describeKind, extractText, LOW_CONFIDENCE, type ExtractResult } from '@/lib/extract';
import { todayISO, uid } from '@/lib/format';
import { OllamaError } from '@/lib/ollama';
import { useStore } from '@/lib/store';

type Phase = 'idle' | 'extracting' | 'extracted' | 'analysing' | 'review';

/** One line describing what was read and what will be sent to the model. */
export function describeSource(result: ExtractResult, vision: boolean): string {
  const parts = [describeKind(result.kind)];
  if (result.pages) parts.push(`${result.pages} page${result.pages > 1 ? 's' : ''}`);
  parts.push(`${result.text.length.toLocaleString('en-PK')} characters`);
  if (result.usedOCR && result.confidence !== undefined) {
    parts.push(`text confidence ${Math.round(result.confidence)}%`);
  }
  if (vision && result.images.length) parts.push('page image will be sent to the model');
  return parts.join(', ');
}

function blankDraft(fileName: string, rawText: string): DraftDoc {
  return {
    title: fileName.replace(/\.[^.]+$/, '') || 'Untitled document',
    vendor: '',
    date: todayISO(),
    amount: 0,
    taxAmount: null,
    category: 'Expense',
    docType: 'Receipt',
    ntnCnic: '',
    summary: '',
    advice: '',
    rawText: rawText.slice(0, 6000),
    fileName,
  };
}

export function ScanView() {
  const router = useRouter();
  const { toast } = useToast();
  const { addDoc, settings, hasAI } = useStore();

  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState({ pct: 0, stage: '' });
  const [urdu, setUrdu] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [draft, setDraft] = useState<DraftDoc | null>(null);

  function reset() {
    setPhase('idle');
    setProgress({ pct: 0, stage: '' });
    setFile(null);
    setResult(null);
    setDraft(null);
  }

  async function handleFile(picked: File) {
    setFile(picked);
    setDraft(null);
    setResult(null);
    setPhase('extracting');
    setProgress({ pct: 4, stage: 'Opening the file' });

    try {
      const extracted = await extractText(picked, {
        urdu,
        onProgress: (p) => setProgress(p),
      });

      const thinText = extracted.text.replace(/\s/g, '').length < 12;
      const canSendImage = settings.vision && extracted.images.length > 0;

      if (thinText && !canSendImage) {
        setResult(extracted);
        setPhase('extracted');
        toast('Almost no text could be read', {
          body: 'Try a brighter, flatter photo, or fill the record in by hand.',
          tone: 'error',
        });
        return;
      }

      setResult(extracted);
      setProgress({ pct: 100, stage: 'Done' });
      setPhase('extracted');
    } catch (err) {
      reset();
      toast('Could not read that file', {
        body: err instanceof Error ? err.message : 'Unknown error',
        tone: 'error',
      });
    }
  }

  async function runAI() {
    if (!result || !file) return;
    if (!hasAI) {
      toast('Add your Ollama key first', { body: 'Settings, then API key.', tone: 'error' });
      return;
    }

    setPhase('analysing');
    try {
      const parsed = await analyseDocument(
        settings,
        {
          text: result.text,
          images: result.images,
          confidence: result.confidence,
          usedOCR: result.usedOCR,
        },
        file.name,
      );
      setDraft(parsed);
      setPhase('review');
    } catch (err) {
      setPhase('extracted');
      const isOllama = err instanceof OllamaError;
      toast(isOllama ? err.message : 'The analysis failed', {
        body: isOllama ? err.hint : err instanceof Error ? err.message : undefined,
        tone: 'error',
      });
    }
  }

  function manual() {
    if (!file) return;
    setDraft(blankDraft(file.name, result?.text ?? ''));
    setPhase('review');
  }

  function save() {
    if (!draft) return;
    if (!draft.title.trim()) {
      toast('Give the record a title', { tone: 'error' });
      return;
    }
    addDoc({ ...draft, id: uid(), createdAt: new Date().toISOString() });
    toast('Saved to your documents', { body: draft.title });
    reset();
    router.push('/documents');
  }

  const busy = phase === 'extracting' || phase === 'analysing';

  return (
    <>
      <PageHeader
        title="Scan a document"
        subtitle="Receipts, invoices, salary slips, bills, challans and statements"
        actions={
          file ? (
            <Button variant="outline" size="sm" onClick={reset} disabled={busy}>
              <RotateCcw size={15} />
              Start over
            </Button>
          ) : null
        }
      />

      <AiBanner />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          {phase === 'idle' ? (
            <>
              <Dropzone
                onFile={handleFile}
                title="Drop a file here"
                body="Or click to browse. JPG, PNG, PDF, CSV, XLSX and plain text, up to 25 MB."
                icon={<Upload size={22} />}
              />
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-paper-raised p-4">
                <input
                  type="checkbox"
                  checked={urdu}
                  onChange={(e) => setUrdu(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-forest-700"
                />
                <span>
                  <span className="block text-[14px] font-medium">Also read Urdu text</span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-soft">
                    Adds a second language pack to the recognition engine. Slower on the first run, so
                    leave it off for English documents.
                  </span>
                </span>
              </label>
            </>
          ) : null}

          {file && phase !== 'idle' ? (
            <Card>
              <CardTitle
                icon={<FileText size={17} />}
                title={file.name}
                hint={result ? describeSource(result, settings.vision) : 'Reading the file'}
              />
              {phase === 'extracting' ? <ProgressBar pct={progress.pct} label={progress.stage} /> : null}
              {result ? (
                <pre className="scroll-thin mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-paper-sunken p-4 font-mono text-[12px] leading-relaxed text-ink-muted">
                  {result.text.slice(0, 4000) || 'No text could be read from this file.'}
                </pre>
              ) : null}
            </Card>
          ) : null}
        </div>

        <div>
          {phase === 'idle' ? (
            <EmptyState
              icon={<Sparkles size={20} />}
              title="Nothing loaded yet"
              body="Upload a file and its text is read on this device first. Only that text is sent to the model, never the image."
            />
          ) : null}

          {phase === 'extracting' ? (
            <Card>
              <div className="flex items-center gap-3 text-[14.5px] text-ink-muted">
                <Spinner className="text-forest-700" />
                {progress.stage || 'Working'}
              </div>
            </Card>
          ) : null}

          {phase === 'extracted' ? (
            <Card>
              <CardTitle
                title="Ready to read"
                hint="Let the model pull out the fields, or fill them in yourself."
              />
              {result &&
              result.usedOCR &&
              (result.confidence ?? 100) < LOW_CONFIDENCE &&
              settings.vision &&
              result.images.length ? (
                <Notice tone="brass" className="mb-4">
                  The text above came out badly, which is normal for a photo of a photocopy. The page
                  image goes to the model as well, so it can read the document itself rather than
                  relying on that transcript.
                </Notice>
              ) : null}
              <div className="flex flex-col gap-2.5">
                <Button variant="accent" onClick={runAI} disabled={!hasAI}>
                  <Sparkles size={16} />
                  Read it with AI
                </Button>
                <Button variant="outline" onClick={manual}>
                  <PencilLine size={16} />
                  Fill it in myself
                </Button>
              </div>
              {!hasAI ? (
                <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
                  No key saved, so the AI step is unavailable. Filling it in by hand still creates a
                  proper record.
                </p>
              ) : null}
            </Card>
          ) : null}

          {phase === 'analysing' ? (
            <Card>
              <div className="flex items-center gap-3 text-[14.5px] text-ink-muted">
                <Spinner className="text-forest-700" />
                Reading the document with {settings.model}
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                This usually takes a few seconds. Longer documents take a little more.
              </p>
            </Card>
          ) : null}

          {phase === 'review' && draft ? (
            <Card>
              <CardTitle
                title="Check before saving"
                hint="Correct anything that looks wrong. What you save is what you approved."
              />
              <DocForm draft={draft} onChange={(patch) => setDraft({ ...draft, ...patch })} />
              <Notice tone="neutral" className="mt-5">
                Amounts are read from the printed text and can be misread on faint or creased paper.
                Compare the total against the document before saving.
              </Notice>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Button variant="primary" onClick={save}>
                  <Save size={16} />
                  Save record
                </Button>
                <Button variant="ghost" onClick={reset}>
                  Discard
                </Button>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
