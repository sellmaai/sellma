import { z } from "zod";
// audienceGroup is now dynamic, not limited to a static catalog

// Schema for AI generation output (without DB-specific fields like id and userId)
export const PersonaAIOutputSchema = z.object({
  personaId: z.string().min(1),
  audienceGroup: z.string().min(1),
  lastUpdated: z.string().min(1), // ISO-8601 string

  // Flattened 'profile' object
  profileFirstName: z.string().min(1),
  profileLastName: z.string().min(1),
  profileAge: z.number().int().min(13).max(120),
  profileGender: z.string().optional(),
  profileEthnicity: z.string().optional(),
  profileLocationCity: z.string().min(1),
  profileLocationState: z.string().min(1),
  profileLocationCountry: z.string().optional(),
  profileEducationLevel: z.string().min(1),
  profileEducationField: z.string().min(1),
  profileOccupation: z.string().min(1),
  profileIncomeAnnualUsd: z.number().nonnegative(),
  profileIncomeType: z.string().min(1),
  profileLivingSituationHomeownership: z.string().min(1),
  profileLivingSituationHousehold: z.string().min(1),
  profileRelationshipStatus: z.string().optional(),

  // Flattened 'personality' object
  personalityOceanSummary: z.string().min(1).max(500),
  personalityOceanScoresOpenness: z.number().min(0).max(1),
  personalityOceanScoresConscientiousness: z.number().min(0).max(1),
  personalityOceanScoresExtraversion: z.number().min(0).max(1),
  personalityOceanScoresAgreeableness: z.number().min(0).max(1),
  personalityOceanScoresNeuroticism: z.number().min(0).max(1),

  // Arrays
  goalsAndMotivations: z.array(z.string().min(1)).min(1).max(10),
  painPoints: z.array(z.string().min(1)).min(1).max(10),

  // Flattened 'pre_ad_context' object
  preAdContextScenario: z.string().min(1),
  preAdContextCurrentActivity: z.string().min(1),
  preAdContextEmotionalState: z.array(z.string().min(1)).min(1).max(5),
  preAdContextChainOfThought: z.string().min(1).max(500),
});

// Complete schema including DB-specific fields
export const FlattenedPersonaSchema = PersonaAIOutputSchema.extend({
  id: z.string().uuid(),
  audienceId: z.string().min(1),
  userId: z.string().uuid(),
});

// Main schema for AI generation (use this in generateObject)
export const PersonaSchema = PersonaAIOutputSchema;

export type PersonaAIOutput = z.infer<typeof PersonaAIOutputSchema>;
export type PersonaOutput = PersonaAIOutput;
export type FlattenedPersonaOutput = z.infer<typeof FlattenedPersonaSchema>;
