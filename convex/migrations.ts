import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { generatePersonasFromPrompt } from "../lib/personas/aiClient";
import { buildPersonaPrompt } from "../lib/personas/prompt";
import {
  type PersistedPersona,
  type PersonaAIOutput,
  TrustedPersonaSchema,
} from "../lib/personas/schemas";
import { api } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { action } from "./_generated/server";

const generateRandomId = () =>
  typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const PERSONA_ID_PATTERN = /^[a-z0-9_-]{3,64}$/i;

const coercePersonaId = (candidate: string): string => {
  const trimmed = candidate.trim();
  if (PERSONA_ID_PATTERN.test(trimmed)) {
    return trimmed;
  }
  return `pers_${generateRandomId()}`;
};

const buildTrustedPersona = (
  persona: PersonaAIOutput,
  metadata: {
    audienceGroup: string;
    audienceId: string;
    userId: Id<"users">;
  }
): PersistedPersona =>
  TrustedPersonaSchema.parse({
    ...persona,
    personaId: coercePersonaId(persona.personaId),
    audienceGroup: metadata.audienceGroup,
    lastUpdated: new Date().toISOString(),
    audienceId: metadata.audienceId,
    userId: metadata.userId,
  });

/**
 * Data migration: Generate senior citizen personas for Google Ads audiences
 * This migration ensures that whenever a Google Ads audience is selected for simulation,
 * personas corresponding to "senior citizens looking to make bathroom accessible" are generated
 * and associated with the Google Ads audience.
 */
export const generateSeniorCitizenPersonasForGoogleAds = action({
  args: {
    googleAdsAudienceId: v.string(),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Doc<"personas">[]> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Must be signed in to generate personas");
    }

    const count = Math.min(Math.max(args.count ?? 5, 1), 10);
    const audienceGroup = "senior-citizens-bathroom-accessibility";
    
    // Build prompt specifically for senior citizens looking to make bathroom accessible
    const prompt = buildPersonaPrompt({
      group: audienceGroup,
      count,
      context: {
        audienceDescription: "Senior citizens (65+ years old) who are looking to make their bathrooms more accessible and safe. These individuals may have mobility challenges, balance issues, or other age-related concerns that make traditional bathroom fixtures difficult or dangerous to use. They are interested in safety modifications, accessibility features, and products that can help them maintain independence in their daily routines.",
        location: "United States", // Default location, can be made configurable
      },
    });

    // Generate personas using AI
    const personas = await generatePersonasFromPrompt({ prompt });

    // Build trusted personas with proper metadata
    const personasWithMetadata = personas.map((persona) =>
      buildTrustedPersona(persona, {
        audienceGroup,
        audienceId: args.googleAdsAudienceId,
        userId,
      })
    );

    // Save personas to database
    return await ctx.runMutation(api.personas.saveMany, {
      personas: personasWithMetadata,
    });
  },
});

/**
 * Check if senior citizen personas already exist for a Google Ads audience
 */
export const checkSeniorCitizenPersonasExist = action({
  args: {
    googleAdsAudienceId: v.string(),
  },
  handler: async (ctx, args): Promise<{ exists: boolean; count: number }> => {
    const existingPersonas: Doc<"personas">[] = await ctx.runQuery(api.personas.listByAudienceId, {
      audienceId: args.googleAdsAudienceId,
    });

    // Check if any existing personas are for senior citizens bathroom accessibility
    const seniorCitizenPersonas: Doc<"personas">[] = existingPersonas.filter(
      (persona: Doc<"personas">) => persona.audienceGroup === "senior-citizens-bathroom-accessibility"
    );

    return {
      exists: seniorCitizenPersonas.length > 0,
      count: seniorCitizenPersonas.length,
    };
  },
});

/**
 * Ensure senior citizen personas exist for Google Ads audience
 * This is the main function to call when a Google Ads audience is selected
 */
export const ensureSeniorCitizenPersonasForGoogleAds = action({
  args: {
    googleAdsAudienceId: v.string(),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Doc<"personas">[]> => {
    // First check if personas already exist
    const { exists } = await ctx.runAction(api.migrations.checkSeniorCitizenPersonasExist, {
      googleAdsAudienceId: args.googleAdsAudienceId,
    });

    if (exists) {
      // Personas already exist, return them
      return await ctx.runQuery(api.personas.listByAudienceId, {
        audienceId: args.googleAdsAudienceId,
      });
    }

    // Generate new personas
    return await ctx.runAction(api.migrations.generateSeniorCitizenPersonasForGoogleAds, {
      googleAdsAudienceId: args.googleAdsAudienceId,
      count: args.count,
    });
  },
});
