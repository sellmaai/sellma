import { action } from './_generated/server';
import { v } from 'convex/values';
import { generateObject, NoObjectGeneratedError } from 'ai';
import { openai } from '@ai-sdk/openai';
import { PersonaGroupSuggestionSchema } from '../lib/personas/grouping/schemas';
import { buildPersonaGroupSuggestionsPrompt } from '../lib/personas/grouping/prompt';

export const suggest = action({
  args: {
    text: v.string(),
    location: v.string(),
    count: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    try {
      const { object } = await generateObject({
        model: openai('gpt-5'),
        output: 'array',
        schema: PersonaGroupSuggestionSchema,
        schemaName: 'PersonaGroupSuggestion',
        schemaDescription: 'A suggested persona group subsegment for the requested audience.',
        prompt: buildPersonaGroupSuggestionsPrompt({
          text: args.text,
          location: args.location,
          count: args.count ?? 6,
        }),
        providerOptions: { openai: { strictJsonSchema: true } },
      });
      return object; // PersonaGroupSuggestion[]
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        console.error('convex.personaGroups.suggest NoObjectGeneratedError', {
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


