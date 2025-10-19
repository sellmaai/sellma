// audienceGroup is dynamic; no static catalog import

// Flattened Persona interface matching the database schema
export interface Persona {
  _id: string;
  audienceId: string;
  personaId: string;
  audienceGroup: string;
  lastUpdated: string; // ISO-8601 string (stored as string in Convex)
  userId: string;

  // Flattened 'profile' object
  profileFirstName: string;
  profileLastName: string;
  profileAge: number;
  profileGender?: string;
  profileEthnicity?: string;
  profileLocationCity: string;
  profileLocationState: string;
  profileLocationCountry?: string;
  profileEducationLevel: string;
  profileEducationField: string;
  profileOccupation: string;
  profileIncomeAnnualUsd: number;
  profileIncomeType: string;
  profileLivingSituationHomeownership: string;
  profileLivingSituationHousehold: string;
  profileRelationshipStatus?: string;

  // Flattened 'personality' object
  personalityOceanSummary: string;
  personalityOceanScoresOpenness: number;
  personalityOceanScoresConscientiousness: number;
  personalityOceanScoresExtraversion: number;
  personalityOceanScoresAgreeableness: number;
  personalityOceanScoresNeuroticism: number;

  // Arrays
  goalsAndMotivations: string[];
  painPoints: string[];

  // Flattened 'pre_ad_context' object
  preAdContextScenario: string;
  preAdContextCurrentActivity: string;
  preAdContextEmotionalState: string[];
  preAdContextChainOfThought: string;
}

export interface Ad {
  id: number;
  headline: string;
  description: string;
  angle?: string;
  ctr?: string;
}

export type Behavior =
  | "CLICK"
  | "SAVE_FOR_LATER"
  | "RESEARCH_FURTHER"
  | "IGNORE"
  | "SHARE";

export interface ReactionToAd {
  variant_id: number;
  emotional_response: string[];
  cognitive_response: string;
  predicted_behavior: Behavior;
  engagement_score: number;
  justification: string;
}

export interface AdReactions {
  persona_id: string;
  reactions_to_variants: ReactionToAd[];
}
