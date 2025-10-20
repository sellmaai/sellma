import { z } from "zod";

const trimString = (schema: z.ZodString) =>
  z
    .string()
    .transform((value) => value.trim())
    .pipe(schema);

export const KeywordMatchTypeEnum = z.enum(["broad", "phrase", "exact"]);

const MatchTypeSchema = z
  .preprocess((value) => {
    if (typeof value === "string") {
      const trimmed = value.trim().toLowerCase();
      if (trimmed.length === 0) {
        return;
      }
      return trimmed;
    }
    return value;
  }, KeywordMatchTypeEnum)
  .optional();

const ConfidenceSchema = z
  .preprocess((value) => {
    if (typeof value === "string") {
      const parsed = Number.parseFloat(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
      return;
    }
    return value;
  }, z.number().min(0).max(1))
  .optional()
  .describe("Confidence that the persona will respond well, 0-1.");

export const PositiveKeywordSchema = z.object({
  keyword: trimString(z.string().min(1).max(100)),
  matchType: MatchTypeSchema,
  intent: trimString(
    z
      .string()
      .min(1)
      .max(200, { message: "Keep keyword intent explanations concise." })
  ).optional(),
  confidence: ConfidenceSchema,
});

export const NegativeKeywordSchema = z.object({
  keyword: trimString(z.string().min(1).max(100)),
  matchType: MatchTypeSchema,
});

const RawKeywordSimulationSchema = z.object({
  persona_id: trimString(z.string().min(1)).optional(),
  personaId: trimString(z.string().min(1)).optional(),
  advertising_goal_summary: trimString(
    z.string().min(1).max(600, { message: "Summaries must be brief." })
  ),
  positive_keywords: z.array(PositiveKeywordSchema).min(1).max(12),
  negative_keywords: z.array(NegativeKeywordSchema).min(1).max(12),
  reasoning: trimString(
    z.string().min(1).max(500, {
      message: "Keep reasoning concise and privacy-safe.",
    })
  ),
});

export const KeywordSimulationSchema = RawKeywordSimulationSchema.transform(
  (data, ctx) => {
    const personaId = data.persona_id ?? data.personaId;
    if (!personaId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "persona_id is required",
        path: ["persona_id"],
      });
      return z.NEVER;
    }
    return {
      persona_id: personaId,
      advertising_goal_summary: data.advertising_goal_summary,
      positive_keywords: data.positive_keywords,
      negative_keywords: data.negative_keywords,
      reasoning: data.reasoning,
    };
  }
);

export type KeywordMatchType = z.infer<typeof KeywordMatchTypeEnum>;
export type PositiveKeyword = z.infer<typeof PositiveKeywordSchema>;
export type NegativeKeyword = z.infer<typeof NegativeKeywordSchema>;
export type KeywordSimulation = z.infer<typeof KeywordSimulationSchema>;
