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


export function buildAudienceOverviewPrompt(params: { text: string }) {
  const { text } = params;
  const lines: string[] = [];
  lines.push(
    `Write a concise, practical overview (200–700 chars) of the target audience below.`,
    `Return JSON only: { "description": string }`,
    `Audience text: ${text}`,
    'Constraints:',
    '- Focus on demographics, motivations, contexts of use, and constraints.',
    '- Be specific and actionable; avoid fluff and generic marketing jargon.'
  );
  return lines.join('\n');
}

export function buildAudienceSubsegmentsPrompt(params: { text: string; count?: number }) {
  const { text, count = 6 } = params;
  const n = Math.max(4, Math.min(count, 6));
  const lines: string[] = [];
  lines.push(
    `Generate ${n} audience subsegments from the following request.`,
    'Return JSON only: { "groups": Array<{ id, label, description, color, percent }> }',
    `Audience text: ${text}`,
    'Constraints:',
    '- Unique kebab-case id for each subsegment (e.g., urban-cyclists).',
    '- label is short and readable; description <= 200 chars.',
    '- color is a readable hex (e.g., #22AA88).',
    '- percent are integers and MUST sum to 100 across all groups.',
    '- Do not include extra fields.'
  );
  return lines.join('\n');
}

