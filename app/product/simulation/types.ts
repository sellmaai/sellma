import type { Audience } from "@/components/ui/audience-picker";
import type { AdGroup } from "@/components/ui/campaign-ad-group-picker";
import type { KeywordSimulation } from "@/lib/keywords/types";
import type { AdReactions, Persona } from "@/lib/personas/types";

export type SimulationKind = "ads" | "keywords";

export interface ManualAdDraft {
  id: number;
  headline: string;
  description: string;
}

export interface ManualKeywordDraft {
  id: number;
  value: string;
}

export interface ManualKeywordAdGroupDraft {
  id: number;
  name: string;
  campaignName: string;
}

interface BaseSimulationSubmission {
  audiences: Audience[];
  notes?: string;
}

export interface AdSimulationSubmission extends BaseSimulationSubmission {
  mode: "ads";
  ads: ManualAdDraft[];
}

export interface KeywordSimulationSubmission extends BaseSimulationSubmission {
  mode: "keywords";
  advertisingGoal: string;
  seedKeywords: string[];
  adGroups: AdGroup[];
}

export type SimulationSubmission =
  | AdSimulationSubmission
  | KeywordSimulationSubmission;

export interface AdSimulationResult {
  mode: "ads";
  audience: Audience;
  persona: Persona;
  reactions: AdReactions;
  ads: ManualAdDraft[];
  notes?: string;
}

export interface KeywordSimulationResult {
  mode: "keywords";
  audience: Audience;
  persona: Persona;
  keywords: KeywordSimulation;
  advertisingGoal: string;
  seedKeywords: string[];
  adGroups: AdGroup[];
  notes?: string;
}

export type SimulationResult = AdSimulationResult | KeywordSimulationResult;
