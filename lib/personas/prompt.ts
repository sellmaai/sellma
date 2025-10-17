import { audienceGroupDescriptions, audienceGroupLabels } from './audienceGroups';

type Context = {
  location?: string;
  audienceDescription?: string;
  segment?: {
    id: string;
    label: string;
    description: string;
    color?: string;
  };
};

export function buildPersonaPrompt(params: {
  group: keyof typeof audienceGroupLabels;
  count: number;
  context?: Context;
}) {
  const { group, count, context } = params;
  const parts: string[] = [];

  parts.push(
    `You are generating ${count} realistic marketing personas for ad simulations.`,
  );

  if (context?.audienceDescription) {
    parts.push(`Primary audience (prioritize this): ${context.audienceDescription}`);
  }

  if (context?.segment) {
    parts.push(
      `Segment guidance — id: ${context.segment.id}, label: ${context.segment.label}.`,
      `Segment description (use to sharpen persona details): ${context.segment.description}.`
    );
  }

  parts.push(
    `Secondary guidance — audience group: ${audienceGroupLabels[group]}.`,
    `Group description (use to refine, not override the audience): ${audienceGroupDescriptions[group]}.`
  );

  if (context?.location) {
    parts.push(`Location context: ${context.location}.`);
  }

  parts.push(
    'Tailoring priorities (strict order):',
    '1) Fit the Primary audience first.',
    '2) Use the Segment description to sharpen details without contradicting the audience.',
    '3) Use the Group description as tertiary context only.',
    '4) Reflect the Location when relevant (language, norms, constraints).'
  );

  parts.push(
    'Output only JSON that conforms to the provided schema. Do not include comments, explanations, or markdown.',
    'Constraints:',
    `- Return an array with exactly ${count} personas matching the schema.`,
    `- For every persona, set audienceGroup to "${group}" exactly (use the ID, not the label).`,
    '- ocean_scores are floats in [0,1].',
    '- last_updated must be an ISO-8601 timestamp.',
    '- Derive scenario, current_activity, and emotional_state from context; do not take them as inputs.',
    '- Ensure diversity across personas (demographics, motivations, behaviors) while staying true to the audience; avoid stereotypes.'
  );

  return parts.join('\n');
}


