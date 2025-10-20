import type { Audience } from "@/components/ui/audience-picker";
import type { AdReactions, Persona } from "@/lib/personas/types";

export interface ManualAdDraft {
  id: number;
  headline: string;
  description: string;
}

export interface SimulationResult {
  audience: Audience;
  persona: Persona;
  reactions: AdReactions;
  ads: ManualAdDraft[];
}
