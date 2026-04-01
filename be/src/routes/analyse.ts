import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import type { AnalyseRequest } from '../types/index.js';

const router = Router();

router.post('/', async (req: Request<object, void, AnalyseRequest>, res: Response) => {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const { title, content } = req.body;

  if (!title || !content) {
    res.status(400).json({ error: 'title and content are required' });
    return;
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system:
        'You are a sharp product thinking partner. Be concise and direct. Use plain text — no markdown.',
      messages: [
        {
          role: 'user',
          content: `Analyse this idea covering market potential, key risks, and suggested next steps. Be brief.\n\nTitle: ${title}\n\nDescription: ${content}\n\nAfter your analysis, add exactly one line in this format:\nACTIONS: ["action 1", "action 2", "action 3"]\n\nInclude 3–5 specific, concrete next actions. The ACTIONS line must be valid JSON.`,
        },
      ],
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
});

export { router as analyseRouter };
