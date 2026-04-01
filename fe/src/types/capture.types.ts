import type { Task } from './task.types';

export interface Recording {
  url: string;
  size: number;
  mimeType: string;
}

// ── Per-category meta ──────────────────────────────────────────────────────

export interface ActionItem {
  id: string;
  text: string;
  status: 'todo' | 'in-progress' | 'done';
  createdAt?: string;
}

export interface IdeaInsights {
  audienceDescription: string;
  keyRisks: string[];
  additionalConcerns: string;
  verdict: string;
  actionItems: string[];
}

export interface IdeaMeta {
  status?: 'raw' | 'developing' | 'ready';
  audience?: string[];
  innovationScore?: number; // 1–10
  nextSteps?: string[];
  tags?: string[];
  aiInsights?: IdeaInsights; // structured Claude analysis
  actionItems?: ActionItem[];
}

export interface WorkTaskMeta {
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  owner?: string;
  project?: string;
  status?: 'todo' | 'in-progress' | 'done';
  estimatedMinutes?: number;
  aiSummary?: string;
  labels?: string[]; // label IDs from global store
}

export interface HomeTaskMeta {
  priority?: 'low' | 'medium' | 'high';
  location?: string;
  dueDate?: string;
  status?: 'todo' | 'in-progress' | 'done';
}

export interface ShoppingItem {
  id: string;
  name: string;
  qty: number;
  checked: boolean;
}

export interface ShoppingMeta {
  items?: ShoppingItem[];
  store?: string;
  budget?: number;
  status?: 'need' | 'ordered' | 'done';
}

export interface ReadWatchMeta {
  url?: string;
  mediaType?: 'article' | 'book' | 'video' | 'podcast' | 'other';
  estimatedMinutes?: number;
  status?: 'saved' | 'in-progress' | 'done';
  tags?: string[];
  aiSummary?: string;
}

export interface FinanceMeta {
  amount?: number;
  currency?: string;
  financeType?: 'income' | 'expense' | 'investment';
  date?: string;
  status?: 'pending' | 'done';
}

export interface TravelMeta {
  destination?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  status?: 'planning' | 'booked' | 'done';
  aiSummary?: string;
}

export type CaptureMeta =
  | IdeaMeta
  | WorkTaskMeta
  | HomeTaskMeta
  | ShoppingMeta
  | ReadWatchMeta
  | FinanceMeta
  | TravelMeta
  | Record<string, unknown>;

// ── Notes ──────────────────────────────────────────────────────────────────

export interface CaptureNote {
  id: string;
  text: string;
  createdAt: string;
}

// ── Core capture ───────────────────────────────────────────────────────────

export interface Capture {
  id: string;
  title: string;
  content: string;
  type: 'idea' | 'task';
  category: string | null;
  createdAt: string;
  updatedAt?: string;
  recordings: Recording[];
  notes?: CaptureNote[];
  task?: Task;
  meta?: CaptureMeta;
}
