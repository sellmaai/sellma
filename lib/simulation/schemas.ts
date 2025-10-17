import { z } from 'zod';

export const BehaviorEnum = z.enum([
  'CLICK',
  'SAVE_FOR_LATER',
  'RESEARCH_FURTHER',
  'IGNORE',
  'SHARE',
]);

export const ReactionToAdSchema = z.object({
  variant_id: z.number().int().nonnegative(),
  emotional_response: z.array(z.string().min(1)).min(1).max(5),
  cognitive_response: z.string().min(1).max(500),
  predicted_behavior: BehaviorEnum,
  engagement_score: z.number().min(0).max(1),
  justification: z.string().min(1).max(500),
});

export const AdReactionsSchema = z.object({
  persona_id: z.string().min(1),
  reactions_to_variants: z.array(ReactionToAdSchema).min(1),
});

export type ReactionToAd = z.infer<typeof ReactionToAdSchema>;
export type AdReactions = z.infer<typeof AdReactionsSchema>;


