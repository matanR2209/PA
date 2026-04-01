// Request and response shapes for each route

// POST /api/ideas
export interface CreateIdeaRequest {
  content: string;
}

export interface CreateIdeaResponse {
  message: string;
  content: string;
}

// POST /api/process
export interface ProcessRequest {
  transcript: string;
}

export interface ProcessResponse {
  type: 'idea' | 'task';
  title: string;
  keyPoints: string[];
  raw: string;
}

// POST /api/analyse  (streams SSE)
export interface AnalyseRequest {
  title: string;
  content: string;
}

// POST /api/analyse-idea
export interface AnalyseIdeaRequest {
  title: string;
  content: string;
}

export interface AnalyseIdeaResponse {
  audienceDescription: string;
  keyRisks: string[];
  additionalConcerns: string;
  verdict: string;
  actionItems: string[];
}

// POST /api/innovation-score
export interface InnovationScoreRequest {
  title: string;
  content: string;
}

export interface InnovationScoreResponse {
  score: number;
  reasoning: string;
}

// GET /health
export interface HealthResponse {
  status: 'ok';
}
