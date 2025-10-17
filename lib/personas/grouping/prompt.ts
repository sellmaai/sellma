export function buildAudienceSuggestionBundlePrompt(params: {
  text: string;
  count?: number;
}) {
  const { text, count = 6 } = params;
  const lines: string[] = [];
  lines.push(
    `From the following audience request, generate:`,
    `1) A concise, detailed overview description of the overall audience (150–700 characters).`,
    `2) ${Math.max(4, Math.min(count, 6))} clear subsegments with id, label, short description (<= 200 chars), UI color, and percent share (integer).`,
    'Return JSON only (no markdown) matching the provided schema EXACTLY: { "description": string, "groups": Array<{ id, label, description, color, percent }> }.',
    `Audience text: ${text}`,
    'Constraints:',
    '- Keep the overview practical and specific (demographics, motivations, contexts).',
    '- Subsegments: unique kebab-case id; readable hex colors; 1–2 sentence descriptions; integer percent shares.',
    '- Percent shares across all subsegments MUST sum to 100.',
    '- Do not include extra fields.',
  );
  return lines.filter(Boolean).join('\n');
}


