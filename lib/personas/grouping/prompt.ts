export function buildAudienceGroupSuggestionsPrompt(params: {
  text: string;
  count?: number; // 4-6 by default
}) {
  const { text, count = 6 } = params;
  const lines: string[] = [];
  lines.push(
    `From the following audience request, propose ${Math.max(4, Math.min(count, 6))} clear subsegments (persona groups).`,
    'Each subsegment must have a stable id (kebab-case), short label, short description, and a distinct color for UI.',
    'Return JSON only (no markdown). Keep descriptions 1–2 short sentences.',
    `Audience text: ${text}`,
    'Constraints:',
    '- id must be unique, lowercase kebab-case (e.g., fitness-enthusiasts).',
    '- Colors are hex strings readable on white (#22c55e, #3b82f6, etc.).',
    '- Do not include extra fields.',
  );
  return lines.filter(Boolean).join('\n');
}


