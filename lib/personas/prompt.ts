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
    `You are generating ${count} realistic marketing personas for ad simulations.`
  );

  if (context?.audienceDescription) {
    parts.push(
      `Primary audience (prioritize this): ${context.audienceDescription}`
    );
  }

  if (context?.segment) {
    parts.push(
      `Segment guidance — id: ${context.segment.id}, label: ${context.segment.label}.`,
      `Segment description (use to sharpen persona details): ${context.segment.description}.`
    );
  }

  parts.push(
    `Secondary guidance — audience group id: ${group}. Use this id literally when setting audienceGroup.`
  );

  if (context?.location) {
    parts.push(`Location context: ${context.location}.`);
  }

  parts.push(
    "Tailoring priorities (strict order):",
    "1) Fit the Primary audience first.",
    "2) Use the Segment description to sharpen details without contradicting the audience.",
    "3) Use the Group description as tertiary context only.",
    "4) Reflect the Location when relevant (language, norms, constraints)."
  );

  parts.push(
    "Output only JSON that conforms to the provided schema. Do not include comments, explanations, or markdown.",
    "Constraints:",
    `- Return an array with exactly ${count} personas matching the schema.`,
    `- For every persona, set audienceGroup to "${group}" exactly (use the ID, not the label).`,
    "- All OCEAN personality scores are floats in [0,1].",
    "- lastUpdated must be an ISO-8601 timestamp.",
    "- Derive preAdContextScenario, preAdContextCurrentActivity, and preAdContextEmotionalState from context; do not take them as inputs.",
    "- Ensure diversity across personas (demographics, motivations, behaviors) while staying true to the audience; avoid stereotypes."
  );

  // Add explicit key names for flattened structure
  parts.push(
    "Use EXACT key names (camelCase, flattened structure). Do not invent keys. Required fields:",
    "- personaId: string (unique ID)",
    `- audienceGroup: "${group}" (exactly this value)`,
    "- lastUpdated: string (ISO 8601 timestamp)",
    "- profileFirstName, profileLastName, profileAge (13-120)",
    "- profileGender?, profileEthnicity?",
    "- profileLocationCity, profileLocationState, profileLocationCountry?",
    "- profileEducationLevel, profileEducationField",
    "- profileOccupation, profileIncomeAnnualUsd (number), profileIncomeType",
    "- profileLivingSituationHomeownership, profileLivingSituationHousehold",
    "- profileRelationshipStatus?",
    "- personalityOceanSummary (max 500 chars)",
    "- personalityOceanScoresOpenness, personalityOceanScoresConscientiousness, personalityOceanScoresExtraversion, personalityOceanScoresAgreeableness, personalityOceanScoresNeuroticism (all floats 0-1)",
    "- goalsAndMotivations: string[] (1-10 items)",
    "- painPoints: string[] (1-10 items)",
    "- preAdContextScenario, preAdContextCurrentActivity",
    "- preAdContextEmotionalState: string[] (1-5 emotion terms)",
    "- preAdContextChainOfThought (max 500 chars)"
  );

  parts.push(
    "Example persona object (flattened structure, values are illustrative):",
    `{"personaId":"pers_7k3x","audienceGroup":"${group}","lastUpdated":"2025-01-20T12:34:56.000Z","profileFirstName":"Ava","profileLastName":"Ng","profileAge":29,"profileGender":"female","profileEthnicity":"Asian","profileLocationCity":"Austin","profileLocationState":"TX","profileLocationCountry":"USA","profileEducationLevel":"Bachelors","profileEducationField":"Marketing","profileOccupation":"Growth Marketer","profileIncomeAnnualUsd":95000,"profileIncomeType":"salary","profileLivingSituationHomeownership":"rent","profileLivingSituationHousehold":"roommate","profileRelationshipStatus":"single","personalityOceanSummary":"Curious and balanced.","personalityOceanScoresOpenness":0.72,"personalityOceanScoresConscientiousness":0.63,"personalityOceanScoresExtraversion":0.51,"personalityOceanScoresAgreeableness":0.66,"personalityOceanScoresNeuroticism":0.34,"goalsAndMotivations":["Save commute time","Stay healthy"],"painPoints":["Cluttered apps","Overpriced gear"],"preAdContextScenario":"Browsing on lunch break","preAdContextCurrentActivity":"Checking Instagram","preAdContextEmotionalState":["curious"],"preAdContextChainOfThought":"Considering options briefly."}`
  );
  return parts.join("\n");
}

export function buildBatchPersonaPrompt(params: {
  groups: Array<{ id: string; count: number }>;
  total: number;
  context?: Context;
}) {
  const { groups, total, context } = params;
  const parts: string[] = [];

  parts.push(
    `You are generating ${total} realistic marketing personas for ad simulations across multiple audience groups.`
  );

  if (context?.audienceDescription) {
    parts.push(
      `Primary audience (prioritize this): ${context.audienceDescription}`
    );
  }

  if (context?.segment) {
    parts.push(
      `Segment guidance — id: ${context.segment.id}, label: ${context.segment.label}.`,
      `Segment description (use to sharpen persona details): ${context.segment.description}.`
    );
  }

  parts.push("Secondary guidance — audience group ids:");
  for (const g of groups) {
    parts.push(`- ${g.id}`);
  }

  if (context?.location) {
    parts.push(`Location context: ${context.location}.`);
  }

  parts.push(
    "Tailoring priorities (strict order):",
    "1) Fit the Primary audience first.",
    "2) Use the Segment description to sharpen details without contradicting the audience.",
    "3) Use each Group description as tertiary context only.",
    "4) Reflect the Location when relevant (language, norms, constraints)."
  );

  const distribution = groups.map((g) => `${g.id}: ${g.count}`).join(", ");

  parts.push(
    "Output only JSON that conforms to the provided schema. Do not include comments, explanations, or markdown.",
    "Constraints:",
    `- Return an array with exactly ${total} personas matching the schema.`,
    `- Match the exact distribution by audienceGroup: { ${distribution} } (use the IDs exactly).`,
    "- All OCEAN personality scores are floats in [0,1].",
    "- lastUpdated must be an ISO-8601 timestamp.",
    "- Derive preAdContextScenario, preAdContextCurrentActivity, and preAdContextEmotionalState from context; do not take them as inputs.",
    "- Ensure diversity across personas (demographics, motivations, behaviors) while staying true to the audience; avoid stereotypes."
  );

  // Reinforce exact key names for flattened structure
  parts.push(
    "Use EXACT key names (camelCase, flattened structure). For each persona include:",
    "personaId, audienceGroup, lastUpdated,",
    "profileFirstName, profileLastName, profileAge, profileGender?, profileEthnicity?,",
    "profileLocationCity, profileLocationState, profileLocationCountry?,",
    "profileEducationLevel, profileEducationField, profileOccupation,",
    "profileIncomeAnnualUsd, profileIncomeType,",
    "profileLivingSituationHomeownership, profileLivingSituationHousehold, profileRelationshipStatus?,",
    "personalityOceanSummary,",
    "personalityOceanScoresOpenness, personalityOceanScoresConscientiousness, personalityOceanScoresExtraversion, personalityOceanScoresAgreeableness, personalityOceanScoresNeuroticism,",
    "goalsAndMotivations[1-10], painPoints[1-10],",
    "preAdContextScenario, preAdContextCurrentActivity, preAdContextEmotionalState[1-5], preAdContextChainOfThought."
  );

  return parts.join("\n");
}
