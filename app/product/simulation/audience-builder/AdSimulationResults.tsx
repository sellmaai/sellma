"use client";

import {
  Brain,
  Heart,
  Loader2,
  MessageSquare,
  Share2,
  Star,
  Target,
  ThumbsDown,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PersonaDisplay } from "@/components/ui/persona-display";
import type { Behavior } from "@/lib/personas/types";
import type { AdSimulationResult } from "./types";

const behaviorMeta: Record<
  Behavior,
  { color: string; icon: typeof Target; label: string }
> = {
  CLICK: { color: "#0EA5E9", icon: Target, label: "Click" },
  SAVE_FOR_LATER: { color: "#F59E0B", icon: Star, label: "Save for later" },
  RESEARCH_FURTHER: {
    color: "#8B5CF6",
    icon: Brain,
    label: "Research further",
  },
  IGNORE: { color: "#9CA3AF", icon: ThumbsDown, label: "Ignore" },
  SHARE: { color: "#22C55E", icon: Share2, label: "Share" },
};

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

const getEngagementColor = (score: number) => {
  if (score >= 0.8) {
    return "#22C55E";
  }
  if (score >= 0.6) {
    return "#F59E0B";
  }
  if (score >= 0.4) {
    return "#FACC15";
  }
  return "#EF4444";
};

interface PersonaReactionCardProps {
  reaction: AdSimulationResult["reactions"]["reactions_to_variants"][number];
  persona: AdSimulationResult["persona"];
  ads: AdSimulationResult["ads"];
  audienceName: string;
}

const formatAudienceGroupLabel = (audienceGroup: string) => {
  if (!audienceGroup) {
    return "Audience";
  }
  return audienceGroup
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const PersonaReactionCard = ({
  reaction,
  persona,
  ads,
  audienceName,
}: PersonaReactionCardProps) => {
  const [showPersonaDetails, setShowPersonaDetails] = useState(false);
  const behavior = behaviorMeta[reaction.predicted_behavior];
  const engagementPercent = Math.round(reaction.engagement_score * 100);
  const groupColor = getGroupColor(persona.audienceGroup);
  const ad = useMemo(
    () => ads.find((item) => item.id === reaction.variant_id),
    [ads, reaction.variant_id]
  );

  return (
    <div className="rounded-3xl border border-border/60 bg-background/95 p-6 shadow-sm transition hover:shadow-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex w-full flex-1 flex-col gap-3">
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
                  Audience: {audienceName}
                </span>
                <span className="text-muted-foreground">
                  Ad Variant #{reaction.variant_id}
                </span>
              </div>
            </div>
          </div>

          {ad ? (
            <div className="rounded-2xl border border-muted-foreground/40 border-dashed bg-muted/20 p-4">
              <p className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                Ad copy
              </p>
              <p className="mt-2 font-medium text-base leading-6">
                {ad.headline}
              </p>
              <p className="mt-1 text-muted-foreground text-sm">
                {ad.description}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-none flex-col items-center gap-2 sm:items-end">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${behavior.color}20` }}
          >
            <behavior.icon
              className="h-5 w-5"
              style={{ color: behavior.color }}
            />
          </div>
          <div className="text-right">
            <p
              className="font-semibold text-2xl tabular-nums"
              style={{ color: getEngagementColor(reaction.engagement_score) }}
            >
              {engagementPercent}%
            </p>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Engagement
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-muted-foreground/30 bg-muted/10 p-4">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500" />
            <p className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
              Emotional Response
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {reaction.emotional_response.map((emotion) => (
              <Badge
                className="rounded-xl px-3 py-1.5 text-sm capitalize"
                key={`${reaction.variant_id}-${emotion}`}
                style={{ backgroundColor: "#FCE7F3", color: "#BE185D" }}
              >
                {emotion}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-muted-foreground/30 bg-muted/10 p-4">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-violet-600" />
            <p className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
              Cognitive Response
            </p>
          </div>
          <p className="text-muted-foreground text-sm leading-6">
            {reaction.cognitive_response}
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-muted-foreground/30 bg-muted/10 p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-sky-600" />
            <p className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
              Analysis
            </p>
          </div>
          <p className="text-muted-foreground text-sm leading-6">
            {reaction.justification}
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-muted-foreground/30 bg-muted/10 p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-600" />
            <p className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
              Predicted Behavior
            </p>
          </div>
          <Badge
            className="text-sm capitalize"
            style={{
              backgroundColor: `${behavior.color}1f`,
              color: behavior.color,
            }}
          >
            {behavior.label}
          </Badge>
        </div>
      </div>

      <div className="mt-6">
        <Button
          onClick={() => setShowPersonaDetails((prev) => !prev)}
          size="sm"
          type="button"
          variant="ghost"
        >
          {showPersonaDetails ? "Hide persona profile" : "View persona profile"}
        </Button>
        {showPersonaDetails ? (
          <div className="mt-4">
            <PersonaDisplay defaultOpen persona={persona} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

interface AdSimulationResultsProps {
  results: AdSimulationResult[];
  isLoading: boolean;
  error: string | null;
}

export function AdSimulationResults({
  results,
  isLoading,
  error,
}: AdSimulationResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-muted-foreground/40 border-dashed bg-muted/10 p-6 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Running simulations...</span>
      </div>
    );
  }

  if (!isLoading && results.length === 0) {
    return (
      <div className="rounded-2xl border border-muted-foreground/40 border-dashed bg-muted/10 p-6 text-center text-muted-foreground text-sm">
        {error ??
          "Select an audience and add ad copies to see simulated reactions."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-destructive text-sm">
          {error}
        </div>
      ) : null}

      <div className="max-h-[640px] space-y-4 overflow-y-auto pr-2">
        {results.map((result) =>
          result.reactions.reactions_to_variants.map((reaction) => (
            <PersonaReactionCard
              ads={result.ads}
              audienceName={result.audience.name}
              key={`${result.persona.personaId}-${reaction.variant_id}`}
              persona={result.persona}
              reaction={reaction}
            />
          ))
        )}
      </div>
    </div>
  );
}
