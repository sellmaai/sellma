import { z } from 'zod';

export const AudienceGroupSuggestionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  color: z.string().min(1),
  description: z.string().min(1).max(200),
  percent: z.number().int().min(1).max(100),
});

export type AudienceGroupSuggestion = z.infer<typeof AudienceGroupSuggestionSchema>;


export const AudienceSuggestionBundleSchema = z.object({
  description: z.string().min(20).max(1200),
  groups: z.array(AudienceGroupSuggestionSchema).min(3).max(8),
});

export const AudienceOverviewSchema = z.object({
  description: z.string().min(20).max(1200),
});


