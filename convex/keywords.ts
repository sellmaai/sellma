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
    adGroups: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        campaignId: v.string(),
        campaignName: v.string(),
        status: v.string(),
      })
    ),
  },
  handler: async (_ctx, args) => {
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const { object } = await generateObject({
          model: google("gemini-2.5-flash"),
          output: "object",
          schema: KeywordSimulationSchema,
          schemaName: "KeywordSimulation",
          schemaDescription:
            "Recommended positive and negative keywords for the persona.",
          temperature: 0.2,
          prompt: buildKeywordSimulationPrompt({
            persona: args.persona,
            advertisingGoal: args.advertisingGoal,
            seedKeywords: args.seedKeywords ?? undefined,
            audienceSummary: args.audienceSummary ?? undefined,
            adGroups: args.adGroups,
          }),
        });
        return object;
      } catch (error) {
        const errorInstance =
          error instanceof Error ? error : new Error(String(error));
        lastError = errorInstance;

        if (NoObjectGeneratedError.isInstance(error)) {
          // If this is the last attempt, throw a user-friendly error
          if (attempt === maxRetries) {
            throw new Error(
              "Failed to generate keyword recommendations after multiple attempts. The AI response didn't match the expected format. Please try again with different inputs."
            );
          }

          // Wait a bit before retrying
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (attempt + 1))
          );
          continue;
        }

        // For non-schema errors, don't retry
        throw error;
      }
    }

    throw (
      lastError || new Error("Unknown error occurred during keyword simulation")
    );
  },
});
