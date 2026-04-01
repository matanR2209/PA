/**
 * Keyword-based intent detection.
 * Returns 'task' or 'idea'.
 * Phase 2 will replace this with a Claude API call.
 */

const TASK_PATTERNS: RegExp[] = [
  // Hebrew
  /תזכיר לי/i,
  /צריך ל/i,
  /אני צריך/i,
  /אנחנו צריכים/i,
  /לא לשכוח/i,
  /לעשות/i,
  /לסיים/i,
  /לשלוח/i,
  /לקרוא ל/i,
  /לקנות/i,
  /לשלם/i,
  /לבדוק/i,
  /לכתוב/i,
  /לשלוח/i,
  /פגישה/i,
  /מחר/i,
  /השבוע/i,
  /הערב/i,
  /בשעה/i,
  /עד יום/i,
  /דדליין/i,

  // English
  /remind me/i,
  /\bto.?do\b/i,
  /i need to/i,
  /i have to/i,
  /don'?t forget/i,
  /make sure/i,
  /\bschedule\b/i,
  /\bmeeting\b/i,
  /\bcall\b/i,
  /\bemail\b/i,
  /\bbuy\b/i,
  /\bpay\b/i,
  /\bdeadline\b/i,
  /by (monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|tonight|eod)/i,
  /\btoday\b/i,
  /\btomorrow\b/i,
  /\bthis week\b/i,
  /at \d{1,2}(:\d{2})?\s?(am|pm)/i,
];

export function detectType(text: string): 'idea' | 'task' {
  if (!text?.trim()) return 'idea';
  return TASK_PATTERNS.some(p => p.test(text)) ? 'task' : 'idea';
}

/**
 * Generate a short title from the first meaningful words.
 * Strips common filler prefixes first.
 */
const FILLER_PREFIXES: RegExp[] = [
  /^(so |okay |ok |um |uh |like |well |basically |actually )+/i,
  /^(יש לי רעיון ש?|רעיון:|אני חושב ש?|אז |אוקיי )/i,
  /^(remind me to |i need to |i have to |make sure to |don'?t forget to )/i,
  /^(תזכיר לי ל?|אני צריך ל?|לא לשכוח ל?)/i,
];

export function generateTitle(text: string): string {
  if (!text?.trim()) return 'Untitled';
  let clean = text.trim();
  for (const p of FILLER_PREFIXES) {
    clean = clean.replace(p, '');
  }
  return clean.split(/\s+/).slice(0, 6).join(' ');
}
