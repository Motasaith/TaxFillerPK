/**
 * Optional relay between the browser and Ollama.
 *
 * Browsers refuse cross origin requests unless the destination sends CORS
 * headers, and ollama.com does not. When the direct call fails, the app retries
 * against this endpoint, which forwards the request from the edge instead.
 *
 * It stores nothing. The Authorization header is passed straight through, the
 * reply is streamed back untouched, and no logging is performed.
 */

interface Context {
  request: Request;
}

interface RequestBody {
  model?: string;
  stream?: boolean;
  messages?: unknown;
  [key: string]: unknown;
}

const ALLOWED_HOSTS = [/(^|\.)ollama\.com$/i, /^localhost$/i, /^127\.0\.0\.1$/];

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function resolveBase(raw: string | null): URL | null {
  const candidate = (raw || 'https://ollama.com').trim();
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  if (!ALLOWED_HOSTS.some((pattern) => pattern.test(url.hostname))) return null;
  return url;
}

async function relay(request: Request): Promise<Response> {
  const auth = request.headers.get('authorization');
  if (!auth) return json(401, { error: 'Missing Authorization header.' });

  const base = resolveBase(request.headers.get('x-ollama-base'));
  if (!base) {
    return json(400, {
      error:
        'The relay only forwards to ollama.com or a loopback address. For any other host, switch the connection mode to direct.',
    });
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return json(400, { error: 'Request body was not valid JSON.' });
  }

  if (!body.messages) return json(400, { error: 'No messages supplied.' });

  const target = new URL('/api/chat', base).toString();

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: auth,
        accept: body.stream ? 'application/x-ndjson' : 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return json(502, {
      error: `The relay could not reach ${base.host}. ${err instanceof Error ? err.message : ''}`.trim(),
    });
  }

  // Stream the reply straight back so token by token output keeps working.
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'application/json',
      'cache-control': 'no-store',
    },
  });
}

export async function onRequest(context: Context): Promise<Response> {
  const { request } = context;

  if (request.method === 'POST') return relay(request);
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { allow: 'POST, OPTIONS' } });
  }
  return json(405, { error: 'Use POST.' });
}
