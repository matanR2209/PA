import { Router, Request, Response } from 'express';
import type { CreateIdeaRequest, CreateIdeaResponse } from '../types/index.js';

const router = Router();

// Placeholder — will be backed by Supabase later
router.get('/', (_req: Request, res: Response) => {
  res.json({ ideas: [] });
});

router.post('/', (req: Request<object, CreateIdeaResponse, CreateIdeaRequest>, res: Response) => {
  const { content } = req.body;
  if (!content) {
    res.status(400).json({ error: 'content is required' });
    return;
  }
  // TODO: persist to Supabase
  res.status(201).json({ message: 'idea received', content });
});

export { router as ideasRouter };
