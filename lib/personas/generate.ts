"use server";

import { z } from "zod";
import { generatePersonasFromPrompt } from "./aiClient";
import { buildPersonaPrompt } from "./prompt";
import type { PersonaAIOutput } from "./schemas";

const InputSchema = z.object({
  group: z.string().min(1),
  count: z.number().int().min(1).max(10).default(1),
  context: z
    .object({
      location: z.string().min(1).optional(),
      audienceDescription: z.string().min(1).optional(),
      segment: z
        .object({
          id: z.string().min(1),
          label: z.string().min(1),
          description: z.string().min(1),
          color: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

export type GeneratePersonasInput = z.infer<typeof InputSchema>;

/**
 * Generates personas using AI without persisting them to the database.
 * Returns personas in flattened format (PersonaAIOutput) without DB-specific fields (id, userId).
 */
export async function generatePersonas(
  input: GeneratePersonasInput
): Promise<PersonaAIOutput[]> {
  const { group, count, context } = InputSchema.parse(input);

  const prompt = buildPersonaPrompt({ group, count, context });

  return await generatePersonasFromPrompt({ prompt });
}
