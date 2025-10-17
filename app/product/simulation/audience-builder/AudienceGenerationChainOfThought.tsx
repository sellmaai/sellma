'use client'

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from '@/components/ai-elements/chain-of-thought';
import { Search, Sparkles } from 'lucide-react';

interface Group {
  id: string;
  label: string;
  color: string;
  description: string;
}

export interface AudienceGenerationChainOfThought {
  isThinking: boolean;
  groups: Group[];
  groupSuggestStatus: 'pending' | 'active' | 'complete';
  perGroupStatus: Record<string, 'pending' | 'active' | 'complete'>;
}

export default function GenerationChainOfThought({
  isThinking,
  groups,
  groupSuggestStatus,
  perGroupStatus,
}: AudienceGenerationChainOfThought) {
  const shouldShow = isThinking || groups.length > 0 || Object.keys(perGroupStatus).length > 0;
  if (!shouldShow) return null;

  return (
    <div className="mt-6">
      <ChainOfThought defaultOpen>
        <ChainOfThoughtHeader />
        <ChainOfThoughtContent>
          <ChainOfThoughtStep
            icon={Search}
            label="Suggesting audience groups..."
            status={groupSuggestStatus === 'active' ? 'active' : groupSuggestStatus === 'complete' ? 'complete' : 'pending'}
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
              key={`step-${g.id}`}
              icon={Sparkles}
              label={`Generating persona for ${g.label}`}
              status={perGroupStatus[g.id] ?? 'pending'}
            />
          ))}
        </ChainOfThoughtContent>
      </ChainOfThought>
    </div>
  );
}


