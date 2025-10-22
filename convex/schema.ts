import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
export default defineSchema({
  ...authTables,
  messages: defineTable({
    userId: v.id("users"),
    body: v.string(),
  }),
  user_audiences: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
    createdAt: v.string(),
    updatedAt: v.string(),
    audienceId: v.optional(v.string()),
    projectedPersonasCount: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_name", ["userId", "name"]),
  personas: defineTable({
    // Core fields
    audienceId: v.string(),
    personaId: v.string(),
    audienceGroup: v.string(),
    lastUpdated: v.string(),
    userId: v.id("users"),

    // Flattened 'profile' object
    profileFirstName: v.string(),
    profileLastName: v.string(),
    profileAge: v.number(),
    profileGender: v.optional(v.string()),
    profileEthnicity: v.optional(v.string()),
    profileLocationCity: v.string(),
    profileLocationState: v.string(),
    profileLocationCountry: v.optional(v.string()),
    profileEducationLevel: v.string(),
    profileEducationField: v.string(),
    profileOccupation: v.string(),
    profileIncomeAnnualUsd: v.number(),
    profileIncomeType: v.string(),
    profileLivingSituationHomeownership: v.string(),
    profileLivingSituationHousehold: v.string(),
    profileRelationshipStatus: v.optional(v.string()),

    // Flattened 'personality' object
    personalityOceanSummary: v.string(),
    personalityOceanScoresOpenness: v.number(),
    personalityOceanScoresConscientiousness: v.number(),
    personalityOceanScoresExtraversion: v.number(),
    personalityOceanScoresAgreeableness: v.number(),
    personalityOceanScoresNeuroticism: v.number(),

    // Arrays
    goalsAndMotivations: v.array(v.string()),
    painPoints: v.array(v.string()),

    // Flattened 'pre_ad_context' object
    preAdContextScenario: v.string(),
    preAdContextCurrentActivity: v.string(),
    preAdContextEmotionalState: v.array(v.string()),
    preAdContextChainOfThought: v.string(),
  })
    .index("by_group", ["audienceGroup"])
    .index("by_persona_id", ["personaId"])
    .index("by_audience", ["audienceId"])
    .index("by_user", ["userId"]),
});
