import type { Settings } from './types';

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OllamaError extends Error {
  hint?: string;
  constructor(message: string, hint?: string) {
    super(message);
    this.name = 'OllamaError';
    this.hint = hint;
  }
}

/** Accepts ollama.com, ollama.com/, ollama.com/api or ollama.com/api/chat. */
export function normaliseBase(raw: string): string {
  const base = (raw || 'https://ollama.com').trim().replace(/\s+/g, '');
  return base
    .replace(/\/+$/, '')
    .replace(/\/api\/chat$/i, '')
    .replace(/\/api$/i, '');
}

export const PROXY_PATH = '/api/ollama';

interface RequestOptions {
  settings: Settings;
  messages: OllamaMessage[];
  json?: boolean;
  signal?: AbortSignal;
  onToken?: (token: string) => void;
  timeoutMs?: number;
}

function buildBody(settings: Settings, messages: OllamaMessage[], json: boolean, stream: boolean) {
  const body: Record<string, unknown> = {
    model: settings.model || 'gemma4:31b-cloud',
    stream,
    messages,
    options: { temperature: json ? 0.1 : 0.5 },
  };
  if (json) body.format = 'json';
  return body;
}

async function readError(res: Response): Promise<string> {
  try {
    const text = await res.text();
    try {
      const parsed = JSON.parse(text);
      return typeof parsed.error === 'string' ? parsed.error : text.slice(0, 300);
    } catch {
      return text.slice(0, 300);
    }
  } catch {
    return '';
  }
}

async function send(
  url: string,
  headers: Record<string, string>,
  body: unknown,
  signal: AbortSignal,
): Promise<Response> {
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
  });

  if (res.ok) return res;

  const detail = await readError(res);

  if (res.status === 401 || res.status === 403) {
    throw new OllamaError(
      'Ollama rejected the API key.',
      'Open Settings and paste a fresh key from ollama.com. Keys are shown only once when created.',
    );
  }
  if (res.status === 404) {
    throw new OllamaError(
      `Model not found: ${detail || 'check the model name'}`,
      'Confirm the model name in Settings. The default is gemma4:31b-cloud.',
    );
  }
  if (res.status === 429) {
    throw new OllamaError('Rate limit reached on your Ollama account.', 'Wait a minute and try again.');
  }
  if (res.status === 402) {
    throw new OllamaError('Your Ollama account is out of quota.', 'Check your usage on ollama.com.');
  }
  throw new OllamaError(`Ollama returned ${res.status}. ${detail}`.trim());
}

function parseWholeReply(text: string): string {
  try {
    const data = JSON.parse(text);
    if (data?.error) throw new OllamaError(String(data.error));
    return typeof data?.message?.content === 'string' ? data.message.content : '';
  } catch (err) {
    if (err instanceof OllamaError) throw err;
    // Some hosts answer with newline delimited JSON even when stream is false.
    let full = '';
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const chunk = JSON.parse(trimmed);
        if (typeof chunk?.message?.content === 'string') full += chunk.message.content;
      } catch {
        // Skip anything that is not a JSON line.
      }
    }
    return full;
  }
}

async function consume(res: Response, onToken?: (token: string) => void): Promise<string> {
  if (!onToken) return parseWholeReply(await res.text());

  const reader = res.body?.getReader();
  if (!reader) throw new OllamaError('The response body could not be read.');

  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  const take = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      const chunk = JSON.parse(trimmed);
      if (chunk.error) throw new OllamaError(String(chunk.error));
      const token: string | undefined = chunk?.message?.content;
      if (token) {
        full += token;
        onToken(token);
      }
    } catch (err) {
      if (err instanceof OllamaError) throw err;
      // Ignore a partial line, it arrives complete on the next read.
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    lines.forEach(take);
  }

  // A host that answers without a trailing newline leaves the last object here.
  buffer += decoder.decode();
  take(buffer);

  return full;
}

/**
 * Calls the Ollama chat endpoint from the browser.
 *
 * Browsers block cross origin calls unless the server sends CORS headers, so
 * when a direct call fails at the network layer we retry through the Cloudflare
 * Pages function bundled with this site. The key is forwarded, never stored.
 */
export async function ollamaChat(opts: RequestOptions): Promise<string> {
  const { settings, messages, json = false, onToken, timeoutMs = 180_000 } = opts;

  if (!settings.apiKey || settings.apiKey.trim().length < 8) {
    throw new OllamaError(
      'No Ollama API key saved yet.',
      'Add your key in Settings. The setup guide walks through creating one.',
    );
  }

  const base = normaliseBase(settings.baseUrl);
  const stream = Boolean(onToken);
  const body = buildBody(settings, messages, json, stream);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const external = opts.signal;
  const onAbort = () => controller.abort();
  external?.addEventListener('abort', onAbort);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${settings.apiKey.trim()}`,
  };

  try {
    const useProxyFirst = settings.connection === 'proxy';

    if (!useProxyFirst) {
      try {
        const res = await send(`${base}/api/chat`, authHeaders, body, controller.signal);
        return await consume(res, onToken);
      } catch (err) {
        const isNetwork = err instanceof TypeError;
        if (!isNetwork || settings.connection === 'direct') throw err;
        // Fall through to the proxy.
      }
    }

    const res = await send(
      PROXY_PATH,
      { ...authHeaders, 'x-ollama-base': base },
      body,
      controller.signal,
    );
    return await consume(res, onToken);
  } catch (err) {
    if (controller.signal.aborted) {
      throw new OllamaError('The request was cancelled or timed out.');
    }
    if (err instanceof OllamaError) throw err;
    if (err instanceof TypeError) {
      throw new OllamaError(
        `Could not reach ${base}.`,
        'The browser blocked the call or the host is unreachable. Deploy the site to Cloudflare Pages, or set Connection to "Through proxy" in Settings. On a local Ollama server, start it with OLLAMA_ORIGINS set to your site address.',
      );
    }
    throw new OllamaError(err instanceof Error ? err.message : 'Unknown error calling Ollama.');
  } finally {
    clearTimeout(timer);
    external?.removeEventListener('abort', onAbort);
  }
}

/** Pulls the first JSON object out of a model reply. */
export function extractJSON<T = Record<string, unknown>>(raw: string): T | null {
  if (!raw) return null;
  const cleaned = raw
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    } catch {
      return null;
    }
  }
}
