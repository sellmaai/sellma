import { audienceGroupDescriptions, audienceGroupLabels } from './audienceGroups';

type Context = {
  location?: string;
  audienceDescription?: string;
};

export function buildPersonaPrompt(params: {
  group: keyof typeof audienceGroupLabels;
  count: number;
  context?: Context;
}) {
  const { group, count, context } = params;
  const parts: string[] = [];

  parts.push(
    `You are generating ${count} realistic marketing personas for the group "${audienceGroupLabels[group]}".`,
    `Group description: ${audienceGroupDescriptions[group]}.`
  );

  if (context) {
    if (context.location) parts.push(`Primary location context: ${context.location}`);
    if (context.audienceDescription) parts.push(`Overall audience overview: ${context.audienceDescription}`);
  }

  parts.push(
    'Output only JSON that conforms to the provided schema. Do not include comments or markdown.',
    'Constraints:',
    '- ocean_scores are floats in [0,1].',
    '- engagement_score is a float in [0,1].',
    '- last_updated must be an ISO-8601 timestamp.',
    '- Use culturally respectful, inclusive language. Keep chain_of_thought concise and non-sensitive.',
    '- Derive scenario, current_activity, and emotional_state from context; do not take them as inputs.'
  );

  return parts.join('\n');
}


