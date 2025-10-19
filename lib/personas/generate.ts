"use server";

import { google } from "@ai-sdk/google";
import { generateObject, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { buildPersonaPrompt } from "./prompt";
import { type PersonaAIOutput, PersonaSchema } from "./schemas";

const InputSchema = z.object({
  group: z.string().min(1),
  count: z.number().int().min(1).max(10).default(1),
  context: z.object({ location: z.string().min(1).optional() }).optional(),
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

  try {
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      output: "array",
      schema: PersonaSchema,
      schemaName: "Persona",
      schemaDescription:
        "A standardized marketing persona used for ad simulations.",
      prompt,
      temperature: 0.2,
    });

    // object is PersonaAIOutput[] - flattened personas without DB-specific fields
    return object as PersonaAIOutput[];
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      // Log error details if needed for debugging
    }
    throw error;
  }
}
