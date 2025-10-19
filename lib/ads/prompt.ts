export function buildAdVariantsPrompt(params: {
  count: number;
  source: { headline: string; description: string; angle?: string };
  audienceHint?: string; // optional targeting hint
}) {
  const { count, source, audienceHint } = params;
  const lines: string[] = [];
  lines.push(
    `Generate ${count} compelling ad variants derived from the source ad.`,
    "Each variant must be returned as JSON only (no markdown), validating against the schema.",
    "Vary tone, structure, and focus while staying faithful to the product value."
  );
  if (audienceHint) {
    lines.push(`Audience hint: ${audienceHint}`);
  }
  lines.push(
    "Source Ad:",
    `- Headline: ${source.headline}`,
    `- Description: ${source.description}`,
    source.angle ? `- Angle: ${source.angle}` : "",
    "Constraints:",
    "- headline <= 120 chars",
    "- description <= 300 chars",
    "- angle is optional and brief if present",
    "- Do not include IDs or CTR fields"
  );
  return lines.filter(Boolean).join("\n");
}
