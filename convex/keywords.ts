import { google } from "@ai-sdk/google";
import { generateObject, NoObjectGeneratedError } from "ai";
import { v } from "convex/values";
import { buildKeywordSimulationPrompt } from "../lib/keywords/prompt";
import { KeywordSimulationSchema } from "../lib/keywords/schemas";
import { action } from "./_generated/server";

export const simulate = action({
  args: {
    persona: v.any(),
    advertisingGoal: v.string(),
    seedKeywords: v.optional(v.array(v.string())),
    audienceSummary: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    try {
      const { object } = await generateObject({
        model: google("gemini-2.5-flash"),
        output: "object",
        schema: KeywordSimulationSchema,
        schemaName: "KeywordSimulation",
        schemaDescription:
          "Recommended positive and negative keywords for the persona.",
        prompt: buildKeywordSimulationPrompt({
          persona: args.persona,
          advertisingGoal: args.advertisingGoal,
          seedKeywords: args.seedKeywords ?? undefined,
          audienceSummary: args.audienceSummary ?? undefined,
        }),
      });
      return object;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        // Optionally capture provider response here.
      }
      throw error;
    }
  },
});
