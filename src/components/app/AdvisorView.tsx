'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Send, Square, Trash2, User } from 'lucide-react';
import { PageHeader } from '@/components/app/AppShell';
import { AiBanner } from '@/components/app/AiBanner';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { askAdvisor } from '@/lib/ai';
import { uid } from '@/lib/format';
import { OllamaError } from '@/lib/ollama';
import { QUICK_PROMPTS } from '@/lib/prompts';
import { useStore } from '@/lib/store';

function Bubble({ role, children }: { role: 'user' | 'assistant'; children: React.ReactNode }) {
  const isUser = role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser ? 'bg-brass-100 text-brass-700' : 'bg-forest-950 text-brass-400'
        }`}
      >
        {isUser ? <User size={15} /> : <Bot size={15} />}
      </span>
      <div
        className={`max-w-[min(46rem,82%)] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed ${
          isUser
            ? 'rounded-tr-md bg-forest-800 text-paper'
            : 'rounded-tl-md border border-line bg-paper-raised text-ink'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function AdvisorView() {
  const { chat, appendChat, clearChat, settings, docs, hasAI } = useStore();
  const { toast } = useToast();

  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [chat, streaming]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    if (!hasAI) {
      toast('Add your Ollama key first', { body: 'Settings, then API key.', tone: 'error' });
      return;
    }

    const history = chat;
    appendChat({ id: uid('m'), role: 'user', content: question, ts: Date.now() });
    setInput('');
    setBusy(true);
    setStreaming('');

    const controller = new AbortController();
    abortRef.current = controller;
    let acc = '';

    try {
      const full = await askAdvisor(
        settings,
        docs,
        history,
        question,
        (token) => {
          acc += token;
          setStreaming(acc);
        },
        controller.signal,
      );
      const answer = (full || acc).trim();
      if (answer) {
        appendChat({ id: uid('m'), role: 'assistant', content: answer, ts: Date.now() });
      }
    } catch (err) {
      if (acc.trim()) {
        appendChat({ id: uid('m'), role: 'assistant', content: `${acc.trim()}\n\n[Answer stopped early.]`, ts: Date.now() });
      }
      const isOllama = err instanceof OllamaError;
      if (!controller.signal.aborted || !acc) {
        toast(isOllama ? err.message : 'The advisor could not answer', {
          body: isOllama ? err.hint : err instanceof Error ? err.message : undefined,
          tone: 'error',
        });
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
      setStreaming(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Tax advisor"
        subtitle={
          docs.length
            ? `Answers can use the ${docs.length} record${docs.length === 1 ? '' : 's'} you have saved`
            : 'Questions about filing, slabs, credits, IRIS and notices'
        }
        actions={
          chat.length ? (
            <Button variant="outline" size="sm" onClick={() => setConfirmClear(true)}>
              <Trash2 size={15} />
              Clear chat
            </Button>
          ) : null
        }
      />

      <AiBanner />

      <div className="flex h-[calc(100vh-15rem)] min-h-[30rem] flex-col rounded-2xl border border-line bg-paper-sunken/40">
        <div ref={logRef} className="scroll-thin flex-1 space-y-5 overflow-y-auto p-5">
          {chat.length === 0 && !streaming ? (
            <div className="mx-auto max-w-xl py-8 text-center">
              <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-forest-950 text-brass-400">
                <Bot size={20} />
              </span>
              <h2 className="font-display text-[24px] leading-tight">Assalam o alaikum</h2>
              <p className="mx-auto mt-2.5 max-w-md text-[14.5px] leading-relaxed text-ink-muted">
                Ask anything about filing in Pakistan. If you have saved documents, I can answer using
                your own figures rather than generic examples.
              </p>
            </div>
          ) : null}

          {chat.map((message) => (
            <Bubble key={message.id} role={message.role}>
              {message.content}
            </Bubble>
          ))}

          {streaming !== null ? (
            <Bubble role="assistant">
              {streaming || <span className="text-ink-soft">Thinking</span>}
            </Bubble>
          ) : null}
        </div>

        <div className="border-t border-line bg-paper-raised p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt.label}
                onClick={() => send(prompt.question)}
                disabled={busy}
                className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-ink-muted transition-colors hover:border-forest-600 hover:text-ink disabled:opacity-50"
              >
                {prompt.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2.5">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="For example: how much tax on a salary of 3.2 million"
              rows={1}
              className="field max-h-40 min-h-[46px] flex-1 resize-y py-3"
            />
            {busy ? (
              <Button variant="outline" onClick={() => abortRef.current?.abort()} aria-label="Stop">
                <Square size={15} />
                Stop
              </Button>
            ) : (
              <Button variant="primary" onClick={() => send(input)} disabled={!input.trim()}>
                <Send size={16} />
              </Button>
            )}
          </div>
          <p className="mt-2.5 text-[12px] text-ink-soft">
            Answers are generated and can be wrong about rates or deadlines. Check anything important
            against the FBR website before acting on it.
          </p>
        </div>
      </div>

      <ConfirmModal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clearChat();
          toast('Chat cleared');
        }}
        title="Clear this conversation"
        body="The whole thread will be removed from this browser. Your saved documents are not affected."
        confirmLabel="Clear chat"
      />
    </>
  );
}
