import { extractJSON, ollamaChat, OllamaError, type OllamaMessage } from './ollama';
import { ADVISOR_SYSTEM, buildLedgerContext, NOTICE_SYSTEM, SCAN_SYSTEM } from './prompts';
import { todayISO } from './format';
import {
  CATEGORIES,
  DOC_TYPES,
  type Category,
  type ChatMessage,
  type DocType,
  type NoticeAnalysis,
  type Settings,
  type TaxDoc,
} from './types';

const MAX_INPUT_CHARS = 9000;

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toISODate(value: unknown): string {
  const raw = toText(value);
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return '';
}

function pickCategory(value: unknown): Category {
  const raw = toText(value).toLowerCase();
  return (CATEGORIES.find((c) => c.toLowerCase() === raw) as Category) ?? 'Other';
}

function pickDocType(value: unknown): DocType {
  const raw = toText(value).toLowerCase();
  return (DOC_TYPES.find((d) => d.toLowerCase() === raw) as DocType) ?? 'Other';
}

export type DraftDoc = Omit<TaxDoc, 'id' | 'createdAt'>;

/** Reads one uploaded document and returns fields for the review form. */
export async function analyseDocument(
  settings: Settings,
  rawText: string,
  fileName: string,
): Promise<DraftDoc> {
  const messages: OllamaMessage[] = [
    { role: 'system', content: SCAN_SYSTEM },
    {
      role: 'user',
      content: `Today is ${todayISO()}. File name: ${fileName}\n\nDocument text:\n\n${rawText.slice(0, MAX_INPUT_CHARS)}`,
    },
  ];

  const reply = await ollamaChat({ settings, messages, json: true });
  const data = extractJSON<Record<string, unknown>>(reply);
  if (!data) {
    throw new OllamaError(
      'The model did not return readable data.',
      'Try again, or edit the fields by hand below. Very blurry scans are the usual cause.',
    );
  }

  return {
    title: toText(data.title) || fileName.replace(/\.[^.]+$/, ''),
    vendor: toText(data.vendor),
    date: toISODate(data.date) || todayISO(),
    amount: toNumber(data.amount) ?? 0,
    taxAmount: toNumber(data.tax_amount),
    category: pickCategory(data.category),
    docType: pickDocType(data.doc_type),
    ntnCnic: toText(data.ntn_cnic),
    summary: toText(data.summary),
    advice: toText(data.tax_advice),
    rawText: rawText.slice(0, 6000),
    fileName,
  };
}

const RISK_LEVELS: NoticeAnalysis['riskLevel'][] = ['Low', 'Medium', 'High', 'Critical'];

/** Reads an FBR notice and returns the assessment plus a reply draft. */
export async function analyseNotice(settings: Settings, rawText: string): Promise<NoticeAnalysis> {
  const messages: OllamaMessage[] = [
    { role: 'system', content: NOTICE_SYSTEM },
    {
      role: 'user',
      content: `Today is ${todayISO()}. Taxpayer name on record: ${settings.name || 'not provided'}. NTN or CNIC: ${settings.ntn || 'not provided'}.\n\nNotice text:\n\n${rawText.slice(0, MAX_INPUT_CHARS)}`,
    },
  ];

  const reply = await ollamaChat({ settings, messages, json: true });
  const data = extractJSON<Record<string, unknown>>(reply);
  if (!data) {
    throw new OllamaError(
      'The model did not return readable data.',
      'Try again. If the notice is a photo, a straighter and brighter scan helps a lot.',
    );
  }

  const risk = toText(data.risk_level) as NoticeAnalysis['riskLevel'];
  const actions = Array.isArray(data.recommended_actions)
    ? data.recommended_actions.map(toText).filter(Boolean)
    : [];

  return {
    noticeType: toText(data.notice_type) || 'Tax notice',
    authority: toText(data.issuing_authority) || 'FBR',
    deadline: toISODate(data.deadline) || null,
    amountDemanded: toNumber(data.amount_demanded),
    taxYear: toText(data.tax_year),
    section: toText(data.section_reference),
    riskLevel: RISK_LEVELS.includes(risk) ? risk : 'Medium',
    summary: toText(data.summary),
    actions,
    replyDraft: toText(data.reply_draft),
  };
}

/** Streams an advisor answer. History is trimmed to keep requests small. */
export async function askAdvisor(
  settings: Settings,
  docs: TaxDoc[],
  history: ChatMessage[],
  question: string,
  onToken: (token: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const messages: OllamaMessage[] = [
    { role: 'system', content: ADVISOR_SYSTEM + buildLedgerContext(docs) },
    ...history.slice(-12).map((m) => ({ role: m.role, content: m.content }) as OllamaMessage),
    { role: 'user', content: question },
  ];

  return ollamaChat({ settings, messages, onToken, signal });
}

export async function testConnection(settings: Settings): Promise<string> {
  const reply = await ollamaChat({
    settings,
    messages: [
      {
        role: 'user',
        content: 'Reply with this exact sentence and nothing else: TaxFillr is connected.',
      },
    ],
    timeoutMs: 60_000,
  });
  return reply.trim();
}
