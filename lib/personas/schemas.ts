import { z } from 'zod';
import { audienceGroupIds } from './audienceGroups';

export const LocationSchema = z.object({
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().optional(),
});

export const EducationSchema = z.object({
  level: z.string().min(1),
  field: z.string().min(1),
});

export const IncomeSchema = z.object({
  annual_usd: z.number().nonnegative(),
  type: z.string().min(1),
});

export const LivingSituationSchema = z.object({
  homeownership: z.string().min(1),
  household: z.string().min(1),
});

export const ProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  age: z.number().int().min(13).max(120),
  gender: z.string().optional(),
  ethnicity: z.string().optional(),
  location: LocationSchema,
  education: EducationSchema,
  occupation: z.string().min(1),
  income: IncomeSchema,
  living_situation: LivingSituationSchema,
  relationship_status: z.string().optional(),
});

export const OceanScoresSchema = z.object({
  openness: z.number().min(0).max(1),
  conscientiousness: z.number().min(0).max(1),
  extraversion: z.number().min(0).max(1),
  agreeableness: z.number().min(0).max(1),
  neuroticism: z.number().min(0).max(1),
});

export const PersonalitySchema = z.object({
  ocean_summary: z.string().min(1).max(500),
  ocean_scores: OceanScoresSchema,
});

export const PreAdContextSchema = z.object({
  scenario: z.string().min(1),
  current_activity: z.string().min(1),
  emotional_state: z.array(z.string().min(1)).min(1).max(5),
  chain_of_thought: z.string().min(1).max(500),
});

export const PersonaSchema = z.object({
  persona_id: z.string().min(1),
  audienceGroup: z.union(
    audienceGroupIds.map((id) => z.literal(id)) as [
      z.ZodLiteral<string>,
      ...z.ZodLiteral<string>[]
    ]
  ),
  last_updated: z.string().min(1), // ISO strings enforced at prompt level
  profile: ProfileSchema,
  personality: PersonalitySchema,
  goals_and_motivations: z.array(z.string().min(1)).min(1).max(10),
  pain_points: z.array(z.string().min(1)).min(1).max(10),
  pre_ad_context: PreAdContextSchema,
});

export type PersonaOutput = z.infer<typeof PersonaSchema>;


