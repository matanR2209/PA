import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import type { AnalyseIdeaRequest, AnalyseIdeaResponse } from '../types/index.js';

const router = Router();

router.post('/', async (req: Request<object, AnalyseIdeaResponse, AnalyseIdeaRequest>, res: Response) => {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const { title, content } = req.body;

  if (!title || !content) {
    res.status(400).json({ error: 'title and content are required' } as never);
    return;
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system:
        'You are a sharp product thinking partner. Return only valid JSON — no markdown, no code fences, no extra text.',
      messages: [
        {
          role: 'user',
          content: `Analyse this idea and return a JSON object with exactly these fields:

{
  "audienceDescription": "2–3 sentences about who this is for and why they need it",
  "keyRisks": ["risk 1", "risk 2", "risk 3"],
  "additionalConcerns": "1–2 sentences on secondary concerns or blind spots",
  "verdict": "2–3 sentences: overall assessment and the single strongest next recommendation",
  "actionItems": ["specific action 1", "specific action 2", "specific action 3"]
}

Title: ${title}
Description: ${content}`,
        },
      ],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '';

    // Strip markdown code fences if Claude included them
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    const parsed = JSON.parse(jsonStr) as AnalyseIdeaResponse;

    res.json({
      audienceDescription: parsed.audienceDescription ?? '',
      keyRisks: Array.isArray(parsed.keyRisks) ? parsed.keyRisks : [],
      additionalConcerns: parsed.additionalConcerns ?? '',
      verdict: parsed.verdict ?? '',
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message } as never);
  }
});

export { router as analyseIdeaRouter };
