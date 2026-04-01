import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import type { InnovationScoreRequest, InnovationScoreResponse } from '../types/index.js';

const router = Router();

router.post('/', async (req: Request<object, InnovationScoreResponse, InnovationScoreRequest>, res: Response) => {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const { title, content } = req.body;

  if (!title || !content) {
    res.status(400).json({ error: 'title and content are required' } as never);
    return;
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      system: 'You evaluate the innovation level of ideas. Be precise and concise. Respond only in the requested format.',
      messages: [
        {
          role: 'user',
          content: `Rate this idea's innovation level on a scale of 1–10:
  1–2  Incremental  — slight improvement on something existing
  3–4  Iterative    — meaningful improvement, similar solutions exist
  5–6  Distinctive  — uncommon approach, stands out clearly
  7–8  Disruptive   — challenges existing paradigms or markets
  9–10 Breakthrough — fundamentally new concept, rarely seen

Title: ${title}
Description: ${content}

Respond in this exact format, nothing else:
SCORE: [number 1-10]
REASONING: [2–3 sentences explaining the rating, focusing on novelty]`,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const scoreMatch = text.match(/SCORE:\s*(\d+)/);
    const reasoningMatch = text.match(/REASONING:\s*([\s\S]+)/);

    if (!scoreMatch) {
      res.status(500).json({ error: 'Failed to parse score from AI response' } as never);
      return;
    }

    const score = Math.min(10, Math.max(1, parseInt(scoreMatch[1], 10)));
    const reasoning = reasoningMatch ? reasoningMatch[1].trim() : '';

    res.json({ score, reasoning });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message } as never);
  }
});

export { router as innovationScoreRouter };
