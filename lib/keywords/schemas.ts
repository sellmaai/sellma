import { z } from "zod";

export const KeywordMatchTypeEnum = z.enum(["broad", "phrase", "exact"]);

export const PositiveKeywordSchema = z.object({
  keyword: z.string().min(1).max(120),
  matchType: KeywordMatchTypeEnum.optional(),
  intent: z.string().min(1).max(240).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const NegativeKeywordSchema = z.object({
  keyword: z.string().min(1).max(120),
  matchType: KeywordMatchTypeEnum.optional(),
});

export const KeywordSimulationSchema = z.object({
  persona_id: z.string().min(1),
  advertising_goal_summary: z.string().min(1).max(600),
  positive_keywords: z.array(PositiveKeywordSchema).min(1).max(12),
  negative_keywords: z.array(NegativeKeywordSchema).min(1).max(12),
  reasoning: z.string().min(1).max(600),
}).strict(); // Ensure no extra fields are allowed

export type KeywordMatchType = z.infer<typeof KeywordMatchTypeEnum>;
export type PositiveKeyword = z.infer<typeof PositiveKeywordSchema>;
export type NegativeKeyword = z.infer<typeof NegativeKeywordSchema>;
export type KeywordSimulation = z.infer<typeof KeywordSimulationSchema>;
