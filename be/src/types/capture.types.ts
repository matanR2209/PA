// Mirrors the FE capture types — shared shape for captures moving between client and server

export interface Recording {
  url: string;
  size: number;
  mimeType: string;
}

export interface CaptureNote {
  id: string;
  text: string;
  createdAt: string;
}

export type CaptureType = 'idea' | 'task';

export interface Capture {
  id: string;
  title: string;
  content: string;
  type: CaptureType;
  category: string | null;
  createdAt: string;
  updatedAt?: string;
  recordings: Recording[];
  notes?: CaptureNote[];
  meta?: Record<string, unknown>;
}
