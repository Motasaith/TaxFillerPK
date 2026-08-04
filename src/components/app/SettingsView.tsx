'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Download, Eye, EyeOff, KeyRound, Trash2, Upload, Zap } from 'lucide-react';
import { PageHeader } from '@/components/app/AppShell';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, Field, Notice, Spinner } from '@/components/ui/Primitives';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { testConnection } from '@/lib/ai';
import { downloadBlob } from '@/lib/format';
import { normaliseBase, OllamaError } from '@/lib/ollama';
import { useStore, type BackupFile } from '@/lib/store';
import type { ConnectionMode } from '@/lib/types';

const CONNECTION_OPTIONS: { value: ConnectionMode; label: string; hint: string }[] = [
  {
    value: 'auto',
    label: 'Automatic',
    hint: 'Recommended. Relays through this site for ollama.com, and calls a local server on your own machine directly. Falls back to the other route if one fails.',
  },
  {
    value: 'proxy',
    label: 'Always through this site',
    hint: 'Every request goes through the edge function deployed with the site. It forwards your key and stores nothing.',
  },
  {
    value: 'direct',
    label: 'Always direct',
    hint: 'Browser straight to the host, no relay. This cannot work with ollama.com, which sends no CORS headers. Use it only for a local Ollama started with OLLAMA_ORIGINS set.',
  },
];

function hostOf(raw: string): string {
  try {
    return new URL(normaliseBase(raw)).hostname;
  } catch {
    return 'that host';
  }
}

function isLocalHost(raw: string): boolean {
  const host = hostOf(raw);
  return host === 'localhost' || host === '127.0.0.1';
}

export function SettingsView() {
  const { settings, updateSettings, docs, notices, chat, importBackup, clearAll, ready } = useStore();
  const { toast } = useToast();

  const [form, setForm] = useState(settings);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ready) setForm(settings);
  }, [ready, settings]);

  function saveConnection() {
    updateSettings({
      apiKey: form.apiKey.trim(),
      baseUrl: form.baseUrl.trim() || 'https://ollama.com',
      model: form.model.trim() || 'gemma4:31b-cloud',
      connection: form.connection,
    });
    toast('Connection settings saved');
  }

  function saveProfile() {
    updateSettings({
      name: form.name.trim(),
      ntn: form.ntn.trim(),
      taxpayerType: form.taxpayerType,
      filer: form.filer,
    });
    toast('Profile saved');
  }

  async function runTest() {
    const next = {
      ...settings,
      apiKey: form.apiKey.trim(),
      baseUrl: form.baseUrl.trim() || 'https://ollama.com',
      model: form.model.trim() || 'gemma4:31b-cloud',
      connection: form.connection,
    };
    if (!next.apiKey) {
      toast('Enter a key first', { tone: 'error' });
      return;
    }
    updateSettings(next);
    setTesting(true);
    try {
      const reply = await testConnection(next);
      toast('Connection works', { body: reply.slice(0, 120) });
    } catch (err) {
      const isOllama = err instanceof OllamaError;
      toast(isOllama ? err.message : 'Connection failed', {
        body: isOllama ? err.hint : err instanceof Error ? err.message : undefined,
        tone: 'error',
      });
    } finally {
      setTesting(false);
    }
  }

  function exportBackup() {
    const backup: BackupFile = {
      app: 'taxfillr',
      version: 1,
      exportedAt: new Date().toISOString(),
      docs,
      notices,
      chat,
      settings: { ...settings, apiKey: '' },
    };
    downloadBlob(
      `taxfillr-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(backup, null, 2),
      'application/json',
    );
    toast('Backup downloaded', { body: 'Your API key is not included in the file.' });
  }

  async function handleImport(file: File) {
    try {
      const parsed = JSON.parse(await file.text()) as Partial<BackupFile>;
      if (parsed.app !== 'taxfillr') throw new Error('That file was not exported from TaxFillr.');
      const added = importBackup(parsed);
      toast('Backup restored', {
        body: `${added.docs} document${added.docs === 1 ? '' : 's'} and ${added.notices} notice${added.notices === 1 ? '' : 's'} added. Duplicates were skipped.`,
      });
    } catch (err) {
      toast('Could not read that backup', {
        body: err instanceof Error ? err.message : undefined,
        tone: 'error',
      });
    }
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Model connection, your details and the data on this device" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle
            icon={<KeyRound size={17} />}
            title="Ollama connection"
            hint="Needed for reading documents, analysing notices and the advisor"
          />

          <Field label="API key">
            <div className="relative">
              <input
                className="field pr-11 font-mono text-[13.5px]"
                type={showKey ? 'text' : 'password'}
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                placeholder="Paste the key from ollama.com"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? 'Hide key' : 'Show key'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Base URL">
              <input
                className="field font-mono text-[13.5px]"
                value={form.baseUrl}
                onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                placeholder="https://ollama.com"
                spellCheck={false}
              />
            </Field>
            <Field label="Model">
              <input
                className="field font-mono text-[13.5px]"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="gemma4:31b-cloud"
                spellCheck={false}
              />
            </Field>
          </div>

          <Field label="Connection route" className="mt-4">
            <select
              className="field"
              value={form.connection}
              onChange={(e) => setForm({ ...form, connection: e.target.value as ConnectionMode })}
            >
              {CONNECTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
            {CONNECTION_OPTIONS.find((o) => o.value === form.connection)?.hint}
          </p>

          {form.connection === 'direct' && !isLocalHost(form.baseUrl) ? (
            <Notice tone="clay" icon={<AlertTriangle size={15} />} className="mt-3">
              <p className="font-medium">This combination cannot work.</p>
              <p className="mt-1 leading-relaxed">
                A browser is not allowed to call {hostOf(form.baseUrl)} directly, so every request
                will fail. Switch to Automatic, or point the base URL at a local Ollama server.
              </p>
              <button
                onClick={() => setForm({ ...form, connection: 'auto' })}
                className="mt-2 font-medium underline underline-offset-2"
              >
                Switch to Automatic
              </button>
            </Notice>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button variant="primary" onClick={saveConnection}>
              <Check size={16} />
              Save
            </Button>
            <Button variant="outline" onClick={runTest} disabled={testing}>
              {testing ? <Spinner /> : <Zap size={16} />}
              {testing ? 'Testing' : 'Test connection'}
            </Button>
          </div>

          <Notice tone="neutral" className="mt-5">
            The key is stored in this browser only and is sent straight to Ollama with each request.
            No key yet? The{' '}
            <Link href="/guide" className="font-medium underline underline-offset-2">
              setup guide
            </Link>{' '}
            covers it in five minutes.
          </Notice>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardTitle title="Your details" hint="Used in drafted replies and to pick the right slab table" />

            <Field label="Name">
              <input
                className="field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="As printed on your CNIC"
              />
            </Field>

            <Field label="NTN or CNIC" className="mt-4">
              <input
                className="field font-mono"
                value={form.ntn}
                onChange={(e) => setForm({ ...form, ntn: e.target.value })}
                placeholder="1234567-8 or 12345-1234567-1"
              />
            </Field>

            <Field label="How you are taxed" className="mt-4">
              <select
                className="field"
                value={form.taxpayerType}
                onChange={(e) =>
                  setForm({ ...form, taxpayerType: e.target.value as 'salaried' | 'non-salaried' })
                }
              >
                <option value="salaried">Salaried</option>
                <option value="non-salaried">Non salaried, business or professional</option>
              </select>
            </Field>

            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={form.filer}
                onChange={(e) => setForm({ ...form, filer: e.target.checked })}
                className="mt-1 h-4 w-4 accent-forest-700"
              />
              <span>
                <span className="block text-[14px] font-medium">I am on the Active Taxpayer List</span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-soft">
                  Filer status lowers withholding on banking, property and vehicle transactions.
                </span>
              </span>
            </label>

            <Button variant="primary" className="mt-5" onClick={saveProfile}>
              <Check size={16} />
              Save profile
            </Button>
          </Card>

          <Card>
            <CardTitle
              title="Data on this device"
              hint={`${docs.length} document${docs.length === 1 ? '' : 's'}, ${notices.length} notice${notices.length === 1 ? '' : 's'}, ${chat.length} chat message${chat.length === 1 ? '' : 's'}`}
            />
            <p className="text-[13.5px] leading-relaxed text-ink-muted">
              Everything lives in this browser. Clearing site data, switching browser or using a
              private window means starting empty, so keep a backup somewhere safe.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button variant="outline" size="sm" onClick={exportBackup}>
                <Download size={15} />
                Export backup
              </Button>
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Upload size={15} />
                Restore backup
              </Button>
              <Button variant="danger" size="sm" onClick={() => setConfirmClear(true)}>
                <Trash2 size={15} />
                Clear everything
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) handleImport(file);
                }}
              />
            </div>
          </Card>
        </div>
      </div>

      <ConfirmModal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clearAll();
          toast('Everything cleared');
        }}
        title="Clear everything"
        body="All documents, notices, chat history and settings will be deleted from this browser. There is no copy on any server, so this cannot be undone. Export a backup first if you might need the records."
        confirmLabel="Delete everything"
      />
    </>
  );
}
