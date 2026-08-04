'use client';

import { useState } from 'react';
import { FileWarning, Gavel, RotateCcw, Scale, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/app/AppShell';
import { AiBanner } from '@/components/app/AiBanner';
import { NoticeCard } from '@/components/app/NoticeCard';
import { Button } from '@/components/ui/Button';
import { Dropzone, ProgressBar } from '@/components/ui/Dropzone';
import { Card, CardTitle, EmptyState, Notice as NoticeBox, Spinner } from '@/components/ui/Primitives';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { analyseNotice } from '@/lib/ai';
import { describeKind, extractText, type ExtractResult } from '@/lib/extract';
import { fmtDate, uid } from '@/lib/format';
import { OllamaError } from '@/lib/ollama';
import { useStore } from '@/lib/store';
import type { StoredNotice } from '@/lib/types';

type Phase = 'idle' | 'extracting' | 'extracted' | 'analysing' | 'done';

export function NoticesView() {
  const { notices, addNotice, removeNotice, settings, hasAI, addDoc } = useStore();
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState({ pct: 0, stage: '' });
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [current, setCurrent] = useState<StoredNotice | null>(null);
  const [deleting, setDeleting] = useState<StoredNotice | null>(null);

  function reset() {
    setPhase('idle');
    setFile(null);
    setResult(null);
    setCurrent(null);
    setProgress({ pct: 0, stage: '' });
  }

  async function handleFile(picked: File) {
    setFile(picked);
    setCurrent(null);
    setResult(null);
    setPhase('extracting');
    try {
      const extracted = await extractText(picked, { onProgress: setProgress });
      setResult(extracted);
      setPhase('extracted');
      if (extracted.text.replace(/\s/g, '').length < 40) {
        toast('Very little text was read', {
          body: 'A flatter, brighter scan of the notice usually fixes this.',
          tone: 'error',
        });
      }
    } catch (err) {
      reset();
      toast('Could not read that file', {
        body: err instanceof Error ? err.message : undefined,
        tone: 'error',
      });
    }
  }

  async function analyse() {
    if (!result || !file) return;
    if (!hasAI) {
      toast('Add your Ollama key first', { body: 'Settings, then API key.', tone: 'error' });
      return;
    }

    setPhase('analysing');
    try {
      const analysis = await analyseNotice(settings, result.text);
      const stored: StoredNotice = {
        ...analysis,
        id: uid('n'),
        fileName: file.name,
        rawText: result.text.slice(0, 6000),
        createdAt: new Date().toISOString(),
      };
      addNotice(stored);
      setCurrent(stored);
      setPhase('done');

      // A notice with money attached also belongs in the ledger.
      if (analysis.amountDemanded) {
        addDoc({
          id: uid(),
          title: analysis.noticeType,
          vendor: analysis.authority,
          date: analysis.deadline || new Date().toISOString().slice(0, 10),
          amount: analysis.amountDemanded,
          taxAmount: null,
          category: 'Notice',
          docType: 'Tax Notice',
          ntnCnic: settings.ntn,
          summary: analysis.summary,
          advice: analysis.actions.join(' '),
          rawText: result.text.slice(0, 3000),
          fileName: file.name,
          createdAt: new Date().toISOString(),
        });
      }

      toast('Notice analysed', { body: `${analysis.riskLevel} risk` });
    } catch (err) {
      setPhase('extracted');
      const isOllama = err instanceof OllamaError;
      toast(isOllama ? err.message : 'The analysis failed', {
        body: isOllama ? err.hint : err instanceof Error ? err.message : undefined,
        tone: 'error',
      });
    }
  }

  const busy = phase === 'extracting' || phase === 'analysing';

  return (
    <>
      <PageHeader
        title="Notice handler"
        subtitle="Upload a letter from FBR and get a plain reading, a deadline and a draft reply"
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
                title="Upload the notice"
                body="A PDF from IRIS, a photo of the letter, or the text pasted into a file."
                icon={<Gavel size={22} />}
              />
              <NoticeBox tone="neutral">
                Nothing is sent anywhere until you press analyse. The file is read on this device
                first, and only the text goes to the model.
              </NoticeBox>
            </>
          ) : null}

          {file && phase !== 'idle' ? (
            <Card>
              <CardTitle
                icon={<FileWarning size={17} />}
                title={file.name}
                hint={
                  result
                    ? `${describeKind(result.kind)}, ${result.text.length.toLocaleString('en-PK')} characters read`
                    : 'Reading the file'
                }
              />
              {phase === 'extracting' ? <ProgressBar pct={progress.pct} label={progress.stage} /> : null}
              {result ? (
                <pre className="scroll-thin mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-paper-sunken p-4 font-mono text-[12px] leading-relaxed text-ink-muted">
                  {result.text.slice(0, 5000) || 'No text could be read.'}
                </pre>
              ) : null}
            </Card>
          ) : null}

          {phase === 'extracted' ? (
            <Button variant="accent" className="w-full" onClick={analyse} disabled={!hasAI}>
              <Sparkles size={16} />
              Analyse this notice
            </Button>
          ) : null}
        </div>

        <div>
          {phase === 'idle' && !notices.length ? (
            <EmptyState
              icon={<Scale size={20} />}
              title="No notice loaded"
              body="You will get the section it was issued under, what is being asked, how long you have, and a formal reply drafted in your name."
            />
          ) : null}

          {phase === 'analysing' ? (
            <Card>
              <div className="flex items-center gap-3 text-[14.5px] text-ink-muted">
                <Spinner className="text-forest-700" />
                Reading the notice
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                Working out the section, the deadline and the safest reply. This takes a little longer
                than a receipt.
              </p>
            </Card>
          ) : null}

          {current ? <NoticeCard notice={current} settings={settings} /> : null}

          {!current && notices.length ? (
            <Card padded={false}>
              <div className="px-6 pt-6">
                <CardTitle title="Earlier notices" hint={`${notices.length} saved on this device`} />
              </div>
              <ul className="divide-y divide-line border-t border-line">
                {notices.map((notice) => (
                  <li key={notice.id} className="flex items-center gap-4 px-6 py-3.5">
                    <button
                      onClick={() => {
                        setCurrent(notice);
                        setPhase('done');
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-[14.5px] font-medium">{notice.noticeType}</p>
                      <p className="truncate text-[12.5px] text-ink-soft">
                        {notice.section ? `Section ${notice.section} · ` : ''}
                        {notice.deadline ? `due ${fmtDate(notice.deadline)}` : fmtDate(notice.createdAt)}
                      </p>
                    </button>
                    <span className="shrink-0 text-[12.5px] text-ink-soft">{notice.riskLevel}</span>
                    <Button variant="ghost" size="sm" onClick={() => setDeleting(notice)}>
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>

      <ConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            removeNotice(deleting.id);
            if (current?.id === deleting.id) reset();
            toast('Notice removed');
          }
        }}
        title="Remove this notice"
        body="The analysis and the draft reply will be deleted from this browser."
        confirmLabel="Remove"
      />
    </>
  );
}
