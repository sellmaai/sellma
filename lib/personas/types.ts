// audienceGroup is dynamic; no static catalog import

export interface Location {
    city: string;
    state: string;
    country?: string;
}

export interface Education {
    level: string;
    field: string;
}

export interface Income {
    annual_usd: number;
    type: string;
}

export interface LivingSituation {
    homeownership: string;
    household: string;
}

export interface Profile {
    firstName: string;
    lastName: string;
    age: number;
    gender?: string;
    ethnicity?: string;
    location: Location;
    education: Education;
    occupation: string;
    income: Income;
    living_situation: LivingSituation;
    relationship_status?: string;
}

export interface OceanScores {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
}

export interface Personality {
    ocean_summary: string;
    ocean_scores: OceanScores;
}

export interface PreAdContext {
    scenario: string;
    current_activity: string;
    emotional_state: string[];
    chain_of_thought: string;
}

export interface Persona {
    persona_id: string;
    audienceGroup: string;
    last_updated: string;
    profile: Profile;
    personality: Personality;
    goals_and_motivations: string[];
    pain_points: string[];
    pre_ad_context: PreAdContext;
}

export interface Ad {
    id: number;
    headline: string;
    description: string;
    angle?: string;
    ctr?: string;
}

export type Behavior = 'CLICK' | 'SAVE_FOR_LATER' | 'RESEARCH_FURTHER' | 'IGNORE' | 'SHARE';

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


