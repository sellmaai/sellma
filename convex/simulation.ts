import { google } from "@ai-sdk/google";
import { generateObject, NoObjectGeneratedError } from "ai";
import { v } from "convex/values";
import { buildSimulationPrompt } from "../lib/simulation/prompt";
import { AdReactionsSchema } from "../lib/simulation/schemas";
import { action } from "./_generated/server";

export const simulate = action({
  args: {
    persona: v.any(),
    ads: v.array(
      v.object({
        id: v.optional(v.number()),
        headline: v.string(),
        description: v.string(),
        angle: v.optional(v.string()),
      })
    ),
  },
  handler: async (_ctx, args) => {
    try {
      const { object } = await generateObject({
        model: google("gemini-2.5-flash"),
        output: "object",
        schema: AdReactionsSchema,
        schemaName: "AdReactions",
        schemaDescription:
          "Complete reaction set for a persona across ad variants.",
        prompt: buildSimulationPrompt({ persona: args.persona, ads: args.ads }),
      });
      return object; // AdReactions
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        // Log error details if needed for debugging
      }
      throw error;
    }
  },
});
