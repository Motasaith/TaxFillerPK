'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ChatMessage, Settings, StoredNotice, TaxDoc } from './types';
import { DEFAULT_SETTINGS } from './types';

const KEYS = {
  docs: 'taxfillr.docs',
  settings: 'taxfillr.settings',
  chat: 'taxfillr.chat',
  notices: 'taxfillr.notices',
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be full or blocked in private mode. Nothing else to do.
  }
}

export interface BackupFile {
  app: 'taxfillr';
  version: number;
  exportedAt: string;
  docs: TaxDoc[];
  notices: StoredNotice[];
  chat: ChatMessage[];
  settings: Partial<Settings>;
}

interface StoreValue {
  ready: boolean;
  docs: TaxDoc[];
  notices: StoredNotice[];
  chat: ChatMessage[];
  settings: Settings;
  hasAI: boolean;
  addDoc: (doc: TaxDoc) => void;
  updateDoc: (id: string, patch: Partial<TaxDoc>) => void;
  removeDoc: (id: string) => void;
  addNotice: (notice: StoredNotice) => void;
  removeNotice: (id: string) => void;
  appendChat: (message: ChatMessage) => void;
  replaceChat: (messages: ChatMessage[]) => void;
  clearChat: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  importBackup: (backup: Partial<BackupFile>) => { docs: number; notices: number };
  clearAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [docs, setDocs] = useState<TaxDoc[]>([]);
  const [notices, setNotices] = useState<StoredNotice[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setDocs(read<TaxDoc[]>(KEYS.docs, []));
    setNotices(read<StoredNotice[]>(KEYS.notices, []));
    setChat(read<ChatMessage[]>(KEYS.chat, []));
    setSettings({ ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(KEYS.settings, {}) });
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) write(KEYS.docs, docs);
  }, [docs, ready]);
  useEffect(() => {
    if (ready) write(KEYS.notices, notices);
  }, [notices, ready]);
  useEffect(() => {
    if (ready) write(KEYS.chat, chat);
  }, [chat, ready]);
  useEffect(() => {
    if (ready) write(KEYS.settings, settings);
  }, [settings, ready]);

  const addDoc = useCallback((doc: TaxDoc) => setDocs((list) => [doc, ...list]), []);
  const updateDoc = useCallback(
    (id: string, patch: Partial<TaxDoc>) =>
      setDocs((list) => list.map((d) => (d.id === id ? { ...d, ...patch } : d))),
    [],
  );
  const removeDoc = useCallback((id: string) => setDocs((list) => list.filter((d) => d.id !== id)), []);
  const addNotice = useCallback(
    (notice: StoredNotice) => setNotices((list) => [notice, ...list]),
    [],
  );
  const removeNotice = useCallback(
    (id: string) => setNotices((list) => list.filter((n) => n.id !== id)),
    [],
  );
  const appendChat = useCallback((message: ChatMessage) => setChat((list) => [...list, message]), []);
  const replaceChat = useCallback((messages: ChatMessage[]) => setChat(messages), []);
  const clearChat = useCallback(() => setChat([]), []);
  const updateSettings = useCallback(
    (patch: Partial<Settings>) => setSettings((current) => ({ ...current, ...patch })),
    [],
  );

  const importBackup = useCallback((backup: Partial<BackupFile>) => {
    let addedDocs = 0;
    let addedNotices = 0;

    if (Array.isArray(backup.docs)) {
      setDocs((list) => {
        const seen = new Set(list.map((d) => d.id));
        const incoming = backup.docs!.filter((d) => d && d.id && !seen.has(d.id));
        addedDocs = incoming.length;
        return [...incoming, ...list];
      });
    }
    if (Array.isArray(backup.notices)) {
      setNotices((list) => {
        const seen = new Set(list.map((n) => n.id));
        const incoming = backup.notices!.filter((n) => n && n.id && !seen.has(n.id));
        addedNotices = incoming.length;
        return [...incoming, ...list];
      });
    }
    if (backup.settings) {
      const { apiKey, ...rest } = backup.settings;
      // A redacted key in a backup file must never overwrite a working one.
      const safeKey = apiKey && !apiKey.includes('*') ? { apiKey } : {};
      setSettings((current) => ({ ...current, ...rest, ...safeKey }));
    }
    return { docs: addedDocs, notices: addedNotices };
  }, []);

  const clearAll = useCallback(() => {
    setDocs([]);
    setNotices([]);
    setChat([]);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      docs,
      notices,
      chat,
      settings,
      hasAI: Boolean(settings.apiKey && settings.apiKey.trim().length > 8),
      addDoc,
      updateDoc,
      removeDoc,
      addNotice,
      removeNotice,
      appendChat,
      replaceChat,
      clearChat,
      updateSettings,
      importBackup,
      clearAll,
    }),
    [
      ready,
      docs,
      notices,
      chat,
      settings,
      addDoc,
      updateDoc,
      removeDoc,
      addNotice,
      removeNotice,
      appendChat,
      replaceChat,
      clearChat,
      updateSettings,
      importBackup,
      clearAll,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used inside StoreProvider');
  return value;
}
