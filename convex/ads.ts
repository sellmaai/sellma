import { google } from "@ai-sdk/google";
import { generateObject, NoObjectGeneratedError } from "ai";
import { v } from "convex/values";
import { buildAdVariantsPrompt } from "../lib/ads/prompt";
import { AdVariantSchema } from "../lib/ads/schemas";
import { action } from "./_generated/server";

export const generateVariants = action({
  args: {
    count: v.number(),
    source: v.object({
      headline: v.string(),
      description: v.string(),
      angle: v.optional(v.string()),
    }),
    audienceHint: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    try {
      const { object } = await generateObject({
        model: google("gemini-2.5-flash"),
        output: "array",
        schema: AdVariantSchema,
        schemaName: "AdVariant",
        schemaDescription:
          "An ad variant with headline, description, optional angle.",
        prompt: buildAdVariantsPrompt({
          count: Math.min(Math.max(args.count, 1), 10),
          source: args.source,
          audienceHint: args.audienceHint,
        }),
      });
      return object; // AdVariant[]
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        // Log error details if needed for debugging
      }
      throw error;
    }
  },
});
