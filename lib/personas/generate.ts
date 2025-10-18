'use server';

import { generateObject, NoObjectGeneratedError } from 'ai';
import { z } from 'zod';
import { google } from '@ai-sdk/google';
import { PersonaSchema } from './schemas';
// No static audience groups; accept dynamic ids
import { buildPersonaPrompt } from './prompt';

const InputSchema = z.object({
  group: z.string().min(1),
  count: z.number().int().min(1).max(10).default(1),
  context: z.object({ location: z.string().min(1).optional() }).optional(),
});

export type GeneratePersonasInput = z.infer<typeof InputSchema>;

export async function generatePersonas(input: GeneratePersonasInput) {
  const { group, count, context } = InputSchema.parse(input);

  const prompt = buildPersonaPrompt({ group, count, context });

  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      output: 'array',
      schema: PersonaSchema,
      schemaName: 'Persona',
      schemaDescription: 'A standardized marketing persona used for ad simulations.',
      prompt,
      temperature: 0.2,
    });

    // object is Persona[] due to output: 'array' with Persona element schema
    return object;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      console.error('generatePersonas NoObjectGeneratedError', {
        cause: error.cause,
        text: error.text,
        response: error.response,
        usage: error.usage,
      });
    }
    throw error;
  }
}


