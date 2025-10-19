import type { Persona } from "../personas/types";

export function buildSimulationPrompt(params: {
  persona: Persona;
  ads: Array<{
    id?: number;
    headline: string;
    description: string;
    angle?: string;
  }>;
}) {
  const { persona, ads } = params;
  const lines: string[] = [];
  lines.push(
    "Simulate the persona’s reactions to each ad variant.",
    "Return JSON only, validated by the schema (no extra fields).",
    "Keep reasoning concise and non-sensitive. engagement_score in [0,1]."
  );

  lines.push("Persona Summary:", JSON.stringify(persona));
  lines.push("Ads:", JSON.stringify(ads));

  lines.push(
    "For each ad, produce emotional_response (1-5 terms), a short cognitive_response,",
    "predicted_behavior (enum), engagement_score (0-1), and justification (1-2 sentences)."
  );

  return lines.join("\n");
}
