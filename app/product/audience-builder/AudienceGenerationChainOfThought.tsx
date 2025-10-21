"use client";

import { Search, Sparkles } from "lucide-react";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";

interface Group {
  id: string;
  label: string;
  color: string;
  description: string;
}

export interface AudienceGenerationChainOfThought {
  isThinking: boolean;
  groups: Group[];
  groupSuggestStatus: "pending" | "active" | "complete";
  perGroupStatus: Record<string, "pending" | "active" | "complete">;
}

export default function GenerationChainOfThought({
  isThinking,
  groups,
  groupSuggestStatus,
  perGroupStatus,
}: AudienceGenerationChainOfThought) {
  const shouldShow =
    isThinking || groups.length > 0 || Object.keys(perGroupStatus).length > 0;
  if (!shouldShow) {
    return null;
  }

  const getGroupSuggestStatusValue = () => {
    if (groupSuggestStatus === "active") {
      return "active";
    }
    if (groupSuggestStatus === "complete") {
      return "complete";
    }
    return "pending";
  };

  return (
    <div className="mt-6">
      <ChainOfThought defaultOpen>
        <ChainOfThoughtHeader />
        <ChainOfThoughtContent>
          <ChainOfThoughtStep
            icon={Search}
            label="Suggesting audience groups..."
            status={getGroupSuggestStatusValue()}
          >
            {groups.length > 0 && (
              <ChainOfThoughtSearchResults>
                {groups.map((g) => (
                  <ChainOfThoughtSearchResult key={g.id}>
                    {g.label}
                  </ChainOfThoughtSearchResult>
                ))}
              </ChainOfThoughtSearchResults>
            )}
          </ChainOfThoughtStep>

          {groups.map((g) => (
            <ChainOfThoughtStep
              icon={Sparkles}
              key={`step-${g.id}`}
              label={`Generating persona for ${g.label}`}
              status={perGroupStatus[g.id] ?? "pending"}
            />
          ))}
        </ChainOfThoughtContent>
      </ChainOfThought>
    </div>
  );
}
