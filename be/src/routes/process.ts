import { Router, Request, Response } from 'express';
import type { ProcessRequest, ProcessResponse } from '../types/index.js';

const router = Router();

// Phase 2: Claude API will process transcripts here
router.post('/', (req: Request<object, ProcessResponse, ProcessRequest>, res: Response) => {
  const { transcript } = req.body;
  if (!transcript) {
    res.status(400).json({ error: 'transcript is required' } as unknown as ProcessResponse);
    return;
  }

  // TODO: call Claude API to classify (idea vs task), generate title, extract key points
  const response: ProcessResponse = {
    type: 'idea',
    title: transcript.trim().split(/\s+/).slice(0, 5).join(' '),
    keyPoints: [],
    raw: transcript,
  };
  res.json(response);
});

export { router as processRouter };
