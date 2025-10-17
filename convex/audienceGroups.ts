import { action } from './_generated/server';
import { v } from 'convex/values';
import { generateObject, NoObjectGeneratedError } from 'ai';
import { google } from '@ai-sdk/google';
import { AudienceGroupSuggestionSchema, AudienceSuggestionBundleSchema } from '../lib/personas/grouping/schemas';
import { buildAudienceGroupSuggestionsPrompt, buildAudienceSuggestionBundlePrompt } from '../lib/personas/grouping/prompt';

export const suggest = action({
  args: {
    text: v.string(),
    location: v.optional(v.string()),
    count: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    try {
      const { object } = await generateObject({
        model: google('gemini-2.5-flash'),
        output: 'array',
        schema: AudienceGroupSuggestionSchema,
        schemaName: 'AudienceGroupSuggestion',
        schemaDescription: 'A suggested Audience group subsegment for the requested audience.',
        prompt: buildAudienceGroupSuggestionsPrompt({
          text: args.text,
          count: args.count ?? 6,
        }),
      });
      return object; // AudienceGroupSuggestion[]
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        console.error('convex.audienceGroups.suggest NoObjectGeneratedError', {
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
        console.error('convex.audienceGroups.suggestBundle NoObjectGeneratedError', {
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


