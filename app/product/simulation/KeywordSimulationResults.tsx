"use client";

import {
  AlertTriangle,
  Lightbulb,
  ListChecks,
  Loader2,
  Target,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PersonaDisplay } from "@/components/ui/persona-display";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { KeywordSimulationResult } from "./types";

const groupPalette = [
  "#6366F1",
  "#0EA5E9",
  "#14B8A6",
  "#F97316",
  "#F43F5E",
  "#8B5CF6",
  "#22C55E",
  "#E11D48",
  "#64748B",
  "#F59E0B",
];

const getGroupColor = (groupId: string) => {
  const index =
    groupId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    groupPalette.length;
  return groupPalette[index];
};

const formatAudienceGroupLabel = (audienceGroup: string) => {
  if (!audienceGroup) {
    return "Audience";
  }
  return audienceGroup
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatMatchType = (matchType?: string) => {
  if (!matchType) {
    return null;
  }
  switch (matchType) {
    case "broad":
      return "Broad";
    case "phrase":
      return "Phrase";
    case "exact":
      return "Exact";
    default:
      return matchType;
  }
};

const formatConfidenceLabel = (confidence?: number) => {
  if (confidence === undefined) {
    return null;
  }
  const percent = Math.round(confidence * 100);
  return `${percent}% confidence`;
};

interface KeywordResultCardProps {
  result: KeywordSimulationResult;
}

const KeywordResultCard = ({ result }: KeywordResultCardProps) => {
  const {
    persona,
    audience,
    keywords,
    seedKeywords,
    advertisingGoal,
    adGroups,
  } = result;
  const groupColor = useMemo(
    () => getGroupColor(persona.audienceGroup),
    [persona.audienceGroup]
  );
  const goalSummary = keywords.advertising_goal_summary;
  const advertisingGoalDisplay = advertisingGoal.trim().length
    ? advertisingGoal
    : "No specific advertising goal provided.";

  return (
    <div className="rounded-3xl border border-border/60 bg-background/95 p-6 shadow-sm transition hover:shadow-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {persona.profileFirstName} {persona.profileLastName}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                <Badge
                  style={{
                    backgroundColor: `${groupColor}22`,
                    color: groupColor,
                  }}
                  variant="secondary"
                >
                  {formatAudienceGroupLabel(persona.audienceGroup)}
                </Badge>
                <span className="text-muted-foreground">
                  Audience: {audience.name}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border border-muted-foreground/40 border-dashed bg-muted/10 p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm uppercase tracking-wide">
              <Target className="h-4 w-4" />
              Advertising Goal
            </div>
            <p className="text-base leading-6">{advertisingGoalDisplay}</p>
            <p className="text-muted-foreground text-sm leading-6">
              {goalSummary}
            </p>
            {seedKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {seedKeywords.map((keyword) => (
                  <Badge className="rounded-xl px-3 py-1 text-xs" key={keyword}>
                    {keyword}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-xs italic">
                No manual seed keywords provided.
              </p>
            )}
            {adGroups.length > 0 ? (
              <div className="pt-3">
                <p className="text-muted-foreground text-xs uppercase tracking-wide">
                  Source Ad Groups
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {adGroups.map((group) => (
                    <Badge
                      className="rounded-xl bg-background px-3 py-1 text-foreground text-xs"
                      key={group.id}
                      variant="outline"
                    >
                      <span className="font-medium">{group.name}</span>
                      {group.campaignName ? (
                        <span className="text-muted-foreground">
                          {` • ${group.campaignName}`}
                        </span>
                      ) : null}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="space-y-2 rounded-2xl border border-border/60 bg-background p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold text-foreground text-sm uppercase tracking-wide">
              <ListChecks className="h-4 w-4" />
              <span>
                <span className="text-emerald-600">Positive</span> Keywords
              </span>
            </div>
            <span className="text-muted-foreground text-xs">
              {keywords.positive_keywords.length} suggestions
            </span>
          </div>
          <div className="space-y-2">
            {keywords.positive_keywords.map((item) => {
              const matchTypeLabel = formatMatchType(item.matchType);
              const confidenceLabel = formatConfidenceLabel(item.confidence);
              return (
                <div
                  className="rounded-xl border border-border/50 bg-muted/10 px-3 py-2"
                  key={`${persona.personaId}-positive-${item.keyword}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <span className="font-semibold text-foreground">
                      {item.keyword}
                    </span>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      {matchTypeLabel ? (
                        <Badge className="rounded-md px-2 py-0.5 text-xs">
                          {matchTypeLabel}
                        </Badge>
                      ) : null}
                      {confidenceLabel ? <span>{confidenceLabel}</span> : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-border/60 bg-background p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold text-foreground text-sm uppercase tracking-wide">
              <AlertTriangle className="h-4 w-4" />
              <span>
                <span className="text-rose-600">Negative</span> Keywords
              </span>
            </div>
            <span className="text-muted-foreground text-xs">
              {keywords.negative_keywords.length} exclusions
            </span>
          </div>
          <div className="space-y-2">
            {keywords.negative_keywords.map((item) => {
              const matchTypeLabel = formatMatchType(item.matchType);
              return (
                <div
                  className="rounded-xl border border-border/50 bg-muted/10 px-3 py-2"
                  key={`${persona.personaId}-negative-${item.keyword}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <span className="font-semibold text-foreground">
                      {item.keyword}
                    </span>
                    {matchTypeLabel ? (
                      <Badge className="rounded-md px-2 py-0.5 text-xs">
                        {matchTypeLabel}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <PersonaDisplay
          persona={persona}
          trigger={
            <Button size="sm" type="button" variant="outline">
              View persona profile
            </Button>
          }
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" type="button" variant="ghost">
              <Lightbulb className="mr-2 h-4 w-4" />
              View reasoning
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="max-w-lg text-muted-foreground"
            side="top"
          >
            <p className="text-sm leading-6">{keywords.reasoning}</p>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

interface KeywordSimulationResultsProps {
  results: KeywordSimulationResult[];
  isLoading: boolean;
  error: string | null;
  selectedAudiences: Array<KeywordSimulationResult['audience']>;
}

export function KeywordSimulationResults({
  results,
  isLoading,
  error,
  selectedAudiences,
}: KeywordSimulationResultsProps) {
  const [open, setOpen] = useState(false);
  const hasResults = results.length > 0;

  useEffect(() => {
    if (!isLoading && hasResults) {
      setOpen(true);
    }
  }, [hasResults, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-muted-foreground/40 border-dashed bg-muted/10 p-6 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Running keyword simulations...</span>
      </div>
    );
  }

  if (!isLoading && results.length === 0) {
    return (
      <div className="rounded-2xl border border-muted-foreground/40 border-dashed bg-muted/10 p-6 text-center text-muted-foreground text-sm">
        {error ??
          "Select audiences and describe your advertising goal to preview keyword recommendations."}
      </div>
    );
  }

  const personaCount = results.length;
  const triggerLabel = `View ${personaCount} keyword recommendation${personaCount === 1 ? "" : "s"}`;

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <div className="flex justify-end">
        <DialogTrigger asChild>
          <Button type="button" variant="outline">
            {triggerLabel}
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent className="max-h-[85vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyword simulation results</DialogTitle>
          <DialogDescription>
            Review persona-aligned keyword suggestions, including positive and
            negative matches.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {results.map((result) => (
            <KeywordResultCard
              key={`${result.persona.personaId}-${result.audience.id}`}
              result={result}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
