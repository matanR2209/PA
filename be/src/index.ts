import dotenv from 'dotenv';
dotenv.config({ override: true });
import express from 'express';
import cors from 'cors';
import type { HealthResponse } from './types/index.js';
import { ideasRouter } from './routes/ideas.js';
import { processRouter } from './routes/process.js';
import { analyseRouter } from './routes/analyse.js';
import { innovationScoreRouter } from './routes/innovationScore.js';
import { analyseIdeaRouter } from './routes/analyseIdea.js';
import { capturesRouter } from './routes/captures.js';
import { labelsRouter } from './routes/labels.js';
import { notesRouter } from './routes/notes.js';
import { actionItemsRouter } from './routes/actionItems.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: process.env.FE_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  const body: HealthResponse = { status: 'ok' };
  res.json(body);
});

app.use('/api/captures', capturesRouter);
app.use('/api/captures/:captureId/notes', notesRouter);
app.use('/api/captures/:captureId/action-items', actionItemsRouter);
app.use('/api/labels', labelsRouter);
app.use('/api/ideas', ideasRouter);
app.use('/api/process', processRouter);
app.use('/api/analyse', analyseRouter);
app.use('/api/innovation-score', innovationScoreRouter);
app.use('/api/analyse-idea', analyseIdeaRouter);

app.listen(PORT, () => {
  console.log(`IdeaPA API running on http://localhost:${PORT}`);
});
