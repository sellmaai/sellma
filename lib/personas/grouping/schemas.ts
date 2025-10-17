import { z } from 'zod';

export const AudienceGroupSuggestionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  color: z.string().min(1),
  description: z.string().min(1).max(200),
});

export type AudienceGroupSuggestion = z.infer<typeof AudienceGroupSuggestionSchema>;


export const AudienceSuggestionBundleSchema = z.object({
  description: z.string().min(40).max(800),
  groups: z.array(AudienceGroupSuggestionSchema).min(3).max(8),
});


