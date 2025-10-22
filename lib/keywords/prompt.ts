import type { Persona } from "../personas/types";

interface KeywordAdGroup {
  id: string;
  name: string;
  campaignId: string;
  campaignName: string;
  status: string;
}

interface BuildKeywordSimulationPromptParams {
  persona: Persona;
  advertisingGoal: string;
  seedKeywords?: string[];
  audienceSummary?: string;
  adGroups: KeywordAdGroup[];
}

export function buildKeywordSimulationPrompt({
  persona,
  advertisingGoal,
  seedKeywords,
  audienceSummary,
  adGroups,
}: BuildKeywordSimulationPromptParams) {
  const lines: string[] = [];

  lines.push(
    "You are assisting with paid search campaign planning.",
    "Using the provided persona, recommend keywords that align or misalign with the advertising goal.",
    "",
    "CRITICAL: Return ONLY valid JSON that matches this exact schema:",
    "{",
    '  "persona_id": "string (required, use persona.personaId exactly)",',
    '  "advertising_goal_summary": "string (required, 1-600 chars)",',
    '  "positive_keywords": [',
    "    {",
    '      "keyword": "string (required, 1-120 chars)",',
    '      "matchType": "broad|phrase|exact (optional)",',
    '      "intent": "string (optional, 1-240 chars)",',
    '      "confidence": "number (optional, 0-1)"',
    "    }",
    "  ],",
    '  "negative_keywords": [',
    "    {",
    '      "keyword": "string (required, 1-120 chars)",',
    '      "matchType": "broad|phrase|exact (optional)"',
    "    }",
    "  ],",
    '  "reasoning": "string (required, 1-600 chars)"',
    "}",
    "",
    "Requirements:",
    "- Include 1-12 positive keywords and 1-12 negative keywords",
    "- Set persona_id to the persona.personaId exactly",
    "- Keep all text fields within character limits",
    "- Return ONLY the JSON object, no other text"
  );

  const goalText = advertisingGoal.trim();
  if (goalText.length > 0) {
    lines.push("Advertising Goal:", goalText);
  } else {
    lines.push(
      "Advertising Goal:",
      "Not specified. Infer relevant goals from the persona and supplied ad groups."
    );
  }

  if (audienceSummary) {
    lines.push("Audience Summary:", audienceSummary);
  }

  if (adGroups.length > 0) {
    const simplifiedGroups = adGroups.map(
      ({ id, name, campaignName, status }) => ({
        id,
        name,
        campaignName,
        status,
      })
    );
    lines.push(
      "Reference these Google Ads ad groups when crafting recommendations:",
      JSON.stringify(simplifiedGroups)
    );
  }

  if (seedKeywords && seedKeywords.length > 0) {
    lines.push("Seed Keywords:", JSON.stringify(seedKeywords));
  }

  lines.push("Persona:", JSON.stringify(persona));

  lines.push(
    "Produce at least one positive keyword (include optional match type, optional shopper intent, and optional confidence 0-1).",
    "Produce at least one negative keyword (include optional match type).",
    "Keep advertising_goal_summary concise (<= 2 sentences, <= 500 chars).",
    "If seed keywords are supplied, consider them but you may expand.",
    "Provide a single reasoning section summarizing your recommendations."
  );

  return lines.join("\n");
}
