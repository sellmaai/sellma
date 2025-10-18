import { action } from './_generated/server';
import { v } from 'convex/values';
import { generateObject, NoObjectGeneratedError } from 'ai';
import { google } from '@ai-sdk/google';
import { AudienceSuggestionBundleSchema, AudienceOverviewSchema } from '../lib/personas/grouping/schemas';
import { buildAudienceSuggestionBundlePrompt, buildAudienceOverviewPrompt, buildAudienceSubsegmentsPrompt } from '../lib/personas/grouping/prompt';


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
      if (!NoObjectGeneratedError.isInstance(error)) throw error;
      console.warn('convex.audienceGroups.suggestBundle falling back to two-step', {
        cause: error.cause,
        text: error.text,
        response: error.response,
        usage: error.usage,
      });

      // Fallback 1: Overview only
      const { object: overviewObj } = await generateObject({
        model: google('gemini-2.5-pro'),
        output: 'object',
        schema: AudienceOverviewSchema,
        schemaName: 'AudienceOverview',
        schemaDescription: 'Audience overview description only.',
        prompt: buildAudienceOverviewPrompt({ text: args.text }),
      });

      // Fallback 2: Subsegments only
      const { object: groupsObj } = await generateObject({
        model: google('gemini-2.5-pro'),
        output: 'object',
        schema: AudienceSuggestionBundleSchema.pick({ groups: true }),
        schemaName: 'AudienceGroupsOnly',
        schemaDescription: 'Audience subsegment suggestions only.',
        prompt: buildAudienceSubsegmentsPrompt({ text: args.text, count: args.count ?? 6 }),
      });

      // Normalize percents to ensure integer sum = 100
      const groups = Array.isArray((groupsObj as any).groups) ? (groupsObj as any).groups : [];
      const rawPercents = groups.map((g) => Math.max(1, Math.min(100, Math.round(Number(g.percent) || 0))));
      let sum = rawPercents.reduce((a: number, b: number) => a + b, 0);
      if (sum === 0) {
        // Even split if model failed
        const n = Math.max(4, Math.min(args.count ?? 6, 6));
        const base = Math.floor(100 / n);
        const remainder = 100 % n;
        for (let i = 0; i < groups.length; i++) rawPercents[i] = base + (i < remainder ? 1 : 0);
        sum = 100;
      }
      // Adjust to 100 if needed
      const diff = 100 - sum;
      if (diff !== 0 && groups.length > 0) {
        rawPercents[0] = Math.max(1, Math.min(100, rawPercents[0] + diff));
      }
      const normalizedGroups = groups.map((g, i: number) => ({ ...g, percent: rawPercents[i] ?? g.percent }));

      return {
        description: (overviewObj as any).description,
        groups: normalizedGroups,
      };
    }
  },
});


