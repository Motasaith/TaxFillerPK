import type { Settings } from './types';

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OllamaError extends Error {
  hint?: string;
  /** True when the other route is worth trying. Wrong keys and bad models are not. */
  retryOther: boolean;
  constructor(message: string, hint?: string, retryOther = false) {
    super(message);
    this.name = 'OllamaError';
    this.hint = hint;
    this.retryOther = retryOther;
  }
}

/** Route used for a single attempt. */
type Route = 'direct' | 'relay';

/**
 * ollama.com answers a CORS preflight with 405 and no allow-origin header, so a
 * browser can never call it directly. Only a loopback server, started with
 * OLLAMA_ORIGINS set, is reachable from the page itself.
 */
function isLoopback(base: string): boolean {
  try {
    const { hostname } = new URL(base);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  } catch {
    return false;
  }
}

function runningOnLocalhost(): boolean {
  if (typeof window === 'undefined') return false;
  const { hostname } = window.location;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

/** Marker the bundled Pages Function sets on every response it produces. */
const RELAY_MARKER = 'x-taxfillr-relay';

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
  route: Route,
  url: string,
  headers: Record<string, string>,
  body: unknown,
  signal: AbortSignal,
): Promise<Response> {
  let res: Response;

  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (signal.aborted) throw new OllamaError('The request was cancelled or timed out.');
    // fetch only rejects when the request never completed: blocked, offline or DNS.
    if (route === 'direct') {
      throw new OllamaError(
        'The browser blocked the direct call to Ollama.',
        'ollama.com sends no CORS headers, so a page cannot call it directly. Set Connection to "Through this site" in Settings.',
        true,
      );
    }
    throw new OllamaError(
      'The request to this site never left the browser.',
      'An ad blocker, privacy extension or offline network is the usual cause. Try again in a window with extensions disabled.',
      true,
    );
  }

  // The relay stamps every response it produces. A 404 without the stamp means
  // nothing is serving /api/ollama at all.
  if (route === 'relay' && !res.headers.get(RELAY_MARKER) && (res.status === 404 || res.status === 405)) {
    throw new OllamaError(
      'The relay is not running on this site.',
      runningOnLocalhost()
        ? 'next dev does not run Cloudflare Functions. Use npm run preview, or point the base URL at a local Ollama server.'
        : 'Nothing is answering /api/ollama. On Cloudflare Pages this means the functions folder was missing from the deployment.',
      true,
    );
  }

  if (res.ok) return res;

  const detail = await readError(res);

  if (res.status === 401 || res.status === 403) {
    throw new OllamaError(
      'Ollama rejected the API key.',
      'Open Settings and paste a fresh key from ollama.com. Keys are shown only once when they are created.',
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
  if (route === 'relay' && res.status === 502) {
    throw new OllamaError(
      'The relay could not reach Ollama.',
      detail || 'The upstream host refused the connection.',
      true,
    );
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
 * ollama.com sends no CORS headers, so a browser cannot call it directly and the
 * request goes through the Cloudflare Pages function bundled with this site. The
 * key is forwarded and never stored. A loopback base URL is tried directly
 * first, because a local server can allow the page through OLLAMA_ORIGINS and
 * the relay running at the edge cannot see it at all.
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

  // A loopback server can be reached from the page. Anything else has to go
  // through the relay, so there is no point burning a request on a call the
  // browser is certain to block.
  const routes: Route[] =
    settings.connection === 'direct'
      ? ['direct']
      : settings.connection === 'proxy'
        ? ['relay']
        : isLoopback(base)
          ? ['direct', 'relay']
          : ['relay', 'direct'];

  const attempt = (route: Route) =>
    route === 'relay'
      ? send(route, PROXY_PATH, { ...authHeaders, 'x-ollama-base': base }, body, controller.signal)
      : send(route, `${base}/api/chat`, authHeaders, body, controller.signal);

  try {
    let last: OllamaError | null = null;

    for (const route of routes) {
      try {
        return await consume(await attempt(route), onToken);
      } catch (err) {
        if (controller.signal.aborted) {
          throw new OllamaError('The request was cancelled or timed out.');
        }
        const failure =
          err instanceof OllamaError
            ? err
            : new OllamaError(err instanceof Error ? err.message : 'Unknown error calling Ollama.');
        last = failure;
        // A rejected key or a missing model fails the same way on either route.
        if (!failure.retryOther) throw failure;
      }
    }

    if (last) {
      // Forcing direct at a host that sends no CORS headers can never succeed,
      // so name the setting rather than the symptom.
      if (routes.length === 1 && routes[0] === 'direct' && !isLoopback(base)) {
        last.message = 'Connection is set to "Always direct", which cannot work with ollama.com.';
        last.hint =
          'Open Settings, change Connection to "Automatic" and save. Only an Ollama server on your own machine can be called directly from a browser.';
      } else if (routes.length > 1) {
        last.hint =
          `${last.hint ?? ''} Both routes were tried: through this site, and straight to ${base}.`.trim();
      }
    }
    throw last ?? new OllamaError('The request could not be sent.');
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
