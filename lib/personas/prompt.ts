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
  group: string; // dynamic id
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
    `Secondary guidance — audience group id: ${group}. Use this id literally when setting audienceGroup.`,
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

  // Add explicit key names and a compact JSON example to reduce schema drift
  parts.push(
    'Use EXACT key names and shapes (camelCase where shown). Do not invent keys. Required object keys:',
    '- persona_id: string',
    `- audienceGroup: "${group}"`,
    '- last_updated: string (ISO 8601)',
    '- profile: { firstName, lastName, age, gender?, ethnicity?, location: { city, state, country? }, education: { level, field }, occupation, income: { annual_usd, type }, living_situation: { homeownership, household }, relationship_status? }',
    '- personality: { ocean_summary, ocean_scores: { openness, conscientiousness, extraversion, agreeableness, neuroticism } }',
    '- goals_and_motivations: string[] (1-10)',
    '- pain_points: string[] (1-10)',
    '- pre_ad_context: { scenario, current_activity, emotional_state: string[] (1-5), chain_of_thought }'
  );

  parts.push(
    'Example persona object (values are illustrative; match types and keys exactly):',
    '{"persona_id":"pers_7k3x","audienceGroup":"${group}","last_updated":"2025-01-20T12:34:56.000Z","profile":{"firstName":"Ava","lastName":"Ng","age":29,"gender":"female","ethnicity":"Asian","location":{"city":"Austin","state":"TX","country":"USA"},"education":{"level":"Bachelors","field":"Marketing"},"occupation":"Growth Marketer","income":{"annual_usd":95000,"type":"salary"},"living_situation":{"homeownership":"rent","household":"roommate"},"relationship_status":"single"},"personality":{"ocean_summary":"Curious and balanced.","ocean_scores":{"openness":0.72,"conscientiousness":0.63,"extraversion":0.51,"agreeableness":0.66,"neuroticism":0.34}},"goals_and_motivations":["Save commute time","Stay healthy"],"pain_points":["Cluttered apps","Overpriced gear"],"pre_ad_context":{"scenario":"Browsing on lunch break","current_activity":"Checking Instagram","emotional_state":["curious"],"chain_of_thought":"Considering options briefly."}}'
  );

  console.log(parts.join('\n'));  
  return parts.join('\n');
}



export function buildBatchPersonaPrompt(params: {
  groups: Array<{ id: string; count: number }>;
  total: number;
  context?: Context;
}) {
  const { groups, total, context } = params;
  const parts: string[] = [];

  parts.push(
    `You are generating ${total} realistic marketing personas for ad simulations across multiple audience groups.`,
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

  parts.push('Secondary guidance — audience group ids:');
  for (const g of groups) {
    parts.push(`- ${g.id}`);
  }

  if (context?.location) {
    parts.push(`Location context: ${context.location}.`);
  }

  parts.push(
    'Tailoring priorities (strict order):',
    '1) Fit the Primary audience first.',
    '2) Use the Segment description to sharpen details without contradicting the audience.',
    '3) Use each Group description as tertiary context only.',
    '4) Reflect the Location when relevant (language, norms, constraints).'
  );

  const distribution = groups
    .map((g) => `${g.id}: ${g.count}`)
    .join(', ');

  parts.push(
    'Output only JSON that conforms to the provided schema. Do not include comments, explanations, or markdown.',
    'Constraints:',
    `- Return an array with exactly ${total} personas matching the schema.`,
    `- Match the exact distribution by audienceGroup: { ${distribution} } (use the IDs exactly).`,
    '- ocean_scores are floats in [0,1].',
    '- last_updated must be an ISO-8601 timestamp.',
    '- Derive scenario, current_activity, and emotional_state from context; do not take them as inputs.',
    '- Ensure diversity across personas (demographics, motivations, behaviors) while staying true to the audience; avoid stereotypes.'
  );

  // Reinforce exact key names and provide a compact example for multi-group batches
  parts.push(
    'Use EXACT key names and shapes. For each persona object include: persona_id, audienceGroup, last_updated, profile{firstName,lastName,age,gender?,ethnicity?,location{city,state,country?},education{level,field},occupation,income{annual_usd,type},living_situation{homeownership,household},relationship_status?}, personality{ocean_summary,ocean_scores{openness,conscientiousness,extraversion,agreeableness,neuroticism}}, goals_and_motivations[1-10], pain_points[1-10], pre_ad_context{scenario,current_activity,emotional_state[1-5],chain_of_thought}.'
  );

  return parts.join('\n');
}

