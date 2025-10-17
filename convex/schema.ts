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
  personas: defineTable({
    persona_id: v.string(),
    personaGroup: v.string(),
    last_updated: v.string(),
    profile: v.object({
      firstName: v.string(),
      lastName: v.string(),
      age: v.number(),
      gender: v.optional(v.string()),
      ethnicity: v.optional(v.string()),
      location: v.object({ city: v.string(), state: v.string(), country: v.optional(v.string()) }),
      education: v.object({ level: v.string(), field: v.string() }),
      occupation: v.string(),
      income: v.object({ annual_usd: v.number(), type: v.string() }),
      living_situation: v.object({ homeownership: v.string(), household: v.string() }),
      relationship_status: v.optional(v.string()),
    }),
    personality: v.object({
      ocean_summary: v.string(),
      ocean_scores: v.object({
        openness: v.number(),
        conscientiousness: v.number(),
        extraversion: v.number(),
        agreeableness: v.number(),
        neuroticism: v.number(),
      }),
    }),
    goals_and_motivations: v.array(v.string()),
    pain_points: v.array(v.string()),
    pre_ad_context: v.object({
      scenario: v.string(),
      current_activity: v.string(),
      emotional_state: v.array(v.string()),
      chain_of_thought: v.string(),
    }),
  })
    .index('by_group', ['personaGroup'])
    .index('by_persona_id', ['persona_id'])
});
