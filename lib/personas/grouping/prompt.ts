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


export function buildAudienceSuggestionBundlePrompt(params: {
  text: string;
  count?: number;
}) {
  const { text, count = 6 } = params;
  const lines: string[] = [];
  lines.push(
    `From the following audience request, generate:`,
    `1) A concise, detailed overview description of the overall audience (200–500 characters).`,
    `2) ${Math.max(4, Math.min(count, 6))} clear subsegments with id, label, short description, and UI color.`,
    'Return JSON only (no markdown) matching the provided schema.',
    `Audience text: ${text}`,
    'Constraints:',
    '- Keep the overview practical and specific (demographics, motivations, contexts).',
    '- Subsegments: unique kebab-case id; readable hex colors; 1–2 sentence descriptions.',
    '- Do not include extra fields.',
  );
  return lines.filter(Boolean).join('\n');
}


