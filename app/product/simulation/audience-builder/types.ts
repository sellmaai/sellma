import type { Audience } from "@/components/ui/audience-picker";
import type { AdReactions, Persona } from "@/lib/personas/types";
import type { SimulationSubmission } from "./SimulationMode";

export interface SimulationResult {
  audience: Audience;
  persona: Persona;
  reactions: AdReactions;
  ads: SimulationSubmission["ads"];
}
