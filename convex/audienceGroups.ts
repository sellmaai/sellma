import { action } from './_generated/server';
import { v } from 'convex/values';
import { generateObject, NoObjectGeneratedError } from 'ai';
import { google } from '@ai-sdk/google';
import { AudienceSuggestionBundleSchema} from '../lib/personas/grouping/schemas';
import { buildAudienceSuggestionBundlePrompt } from '../lib/personas/grouping/prompt';


export const suggestBundle = action({
  args: {
    text: v.string(),
    location: v.optional(v.string()),
    count: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    try {
      const { object } = await generateObject({
        model: google('gemini-2.5-pro'),
        output: 'object',
        schema: AudienceSuggestionBundleSchema,
        schemaName: 'AudienceSuggestionBundle',
        schemaDescription: 'Audience overview description and subsegment suggestions.',
        prompt: buildAudienceSuggestionBundlePrompt({
          text: args.text,
          count: args.count ?? 6,
        }),
      });
      return object; // { description: string; groups: AudienceGroupSuggestion[] }
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        console.warn('convex.audienceGroups.suggestBundle falling back to two-step', {
          cause: error.cause,
          text: error.text,
          response: error.response,
          usage: error.usage,
        });
      }
        // Fallback: generate groups and description separatel      }
      throw error;
    }
  },
});


