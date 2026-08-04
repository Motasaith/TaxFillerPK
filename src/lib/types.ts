export const CATEGORIES = [
  'Income',
  'Salary',
  'Business',
  'Expense',
  'Utility',
  'Medical',
  'Education',
  'Charity',
  'Tax Payment',
  'Notice',
  'Property',
  'Vehicle',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DOC_TYPES = [
  'Receipt',
  'Invoice',
  'Salary Slip',
  'Withholding Statement',
  'Tax Notice',
  'Challan',
  'Utility Bill',
  'Bank Statement',
  'Registration',
  'Other',
] as const;

export type DocType = (typeof DOC_TYPES)[number];

/** Categories that count towards taxable income on the dashboard. */
export const INCOME_CATEGORIES: Category[] = ['Income', 'Salary', 'Business'];

/** Categories treated as claimable or deductible spending. */
export const EXPENSE_CATEGORIES: Category[] = [
  'Expense',
  'Utility',
  'Medical',
  'Education',
  'Charity',
];

export interface TaxDoc {
  id: string;
  title: string;
  vendor: string;
  date: string;
  amount: number;
  taxAmount: number | null;
  category: Category;
  docType: DocType;
  ntnCnic: string;
  summary: string;
  advice: string;
  rawText: string;
  fileName: string;
  createdAt: string;
}

export interface NoticeAnalysis {
  noticeType: string;
  authority: string;
  deadline: string | null;
  amountDemanded: number | null;
  taxYear: string;
  section: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  summary: string;
  actions: string[];
  replyDraft: string;
}

export interface StoredNotice extends NoticeAnalysis {
  id: string;
  fileName: string;
  rawText: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

export type ConnectionMode = 'auto' | 'direct' | 'proxy';

export interface Settings {
  apiKey: string;
  baseUrl: string;
  model: string;
  connection: ConnectionMode;
  /** Send page images to the model. Needs a model that accepts pictures. */
  vision: boolean;
  name: string;
  ntn: string;
  filer: boolean;
  taxpayerType: 'salaried' | 'non-salaried';
}

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  baseUrl: 'https://ollama.com',
  model: 'gemma4:31b-cloud',
  connection: 'auto',
  vision: true,
  name: '',
  ntn: '',
  filer: true,
  taxpayerType: 'salaried',
};
