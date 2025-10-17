import { action } from './_generated/server';
import { v } from 'convex/values';
import { generateObject, NoObjectGeneratedError } from 'ai';
import { google } from '@ai-sdk/google';
import { AdReactionsSchema } from '../lib/simulation/schemas';
import { buildSimulationPrompt } from '../lib/simulation/prompt';

export const simulate = action({
  args: {
    persona: v.any(),
    ads: v.array(v.object({
      id: v.optional(v.number()),
      headline: v.string(),
      description: v.string(),
      angle: v.optional(v.string()),
    })),
  },
  handler: async (_ctx, args) => {
    try {
      const { object } = await generateObject({
        model: google('gemini-1.5-pro'),
        output: 'object',
        schema: AdReactionsSchema,
        schemaName: 'AdReactions',
        schemaDescription: 'Complete reaction set for a persona across ad variants.',
        prompt: buildSimulationPrompt({ persona: args.persona, ads: args.ads }),
      });
      return object; // AdReactions
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        console.error('convex.simulation.simulate NoObjectGeneratedError', {
          cause: error.cause,
          text: error.text,
          response: error.response,
          usage: error.usage,
        });
      }
      throw error;
    }
  },
});


