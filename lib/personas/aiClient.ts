import { google } from "@ai-sdk/google";
import { generateObject, NoObjectGeneratedError } from "ai";
import { type PersonaAIOutput, PersonaSchema } from "./schemas";

interface RunGenerationOptions {
  prompt: string;
}

export async function generatePersonasFromPrompt(
  options: RunGenerationOptions
): Promise<PersonaAIOutput[]> {
  try {
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      output: "array",
      schema: PersonaSchema,
      schemaName: "Persona",
      schemaDescription:
        "A standardized marketing persona used for ad simulations.",
      prompt: options.prompt,
      temperature: 0.2,
    });

    return object as PersonaAIOutput[];
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      // Allow callers to handle structured failures uniformly.
    }
    throw error;
  }
}
