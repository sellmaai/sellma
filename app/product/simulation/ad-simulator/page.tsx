"use client";

import { useAction, useQuery } from "convex/react";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  AudiencePicker,
  type AudienceRecord,
} from "@/components/personas/AudiencePicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import type { ReactionToAd } from "@/lib/personas/types";

type PersonaDoc = Doc<"personas">;

type AdDraft = {
  id: number;
  headline: string;
  description: string;
  angle: string;
};

type SimulationAd = {
  id: number;
  headline: string;
  description: string;
  angle?: string;
};

type PersonaSimulationResult = {
  persona: PersonaDoc;
  reactions: ReactionToAd[];
};

const MAX_ADS = 5;
const PERSONA_SAMPLE_LIMIT = 3;

const createInitialAds = (): AdDraft[] =>
  Array.from({ length: MAX_ADS }, (_, index) => ({
    id: index + 1,
    headline: "",
    description: "",
    angle: "",
  }));

const formatEngagementScore = (score: number) => score.toFixed(2);

export default function AdSimulatorPage() {
  const [ads, setAds] = useState<AdDraft[]>(createInitialAds);
  const [selectedAudienceId, setSelectedAudienceId] = useState<string | null>(
    null
  );
  const [selectedAudienceMeta, setSelectedAudienceMeta] =
    useState<AudienceRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PersonaSimulationResult[]>([]);
  const [lastRunAds, setLastRunAds] = useState<SimulationAd[]>([]);
  const [generatingAdId, setGeneratingAdId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const simulate = useAction(api.simulation.simulate);
  const generateVariants = useAction(api.ads.generateVariants);

  const personas = useQuery(
    api.personas.listByAudienceId,
    selectedAudienceId
      ? {
          audienceId: selectedAudienceId,
          limit: PERSONA_SAMPLE_LIMIT,
        }
      : undefined
  );

  const sampledPersonas = useMemo(
    () => (personas ?? []).slice(0, PERSONA_SAMPLE_LIMIT),
    [personas]
  );

  const audienceHint = useMemo(() => {
    if (!selectedAudienceMeta?.groups.length) {
      return "";
    }
    return selectedAudienceMeta.groups.join(", ");
  }, [selectedAudienceMeta]);

  useEffect(() => {
    setResults([]);
    setLastRunAds([]);
    setError(null);
  }, [selectedAudienceId]);

  const handleAdChange = (
    index: number,
    field: keyof Omit<AdDraft, "id">,
    value: string
  ) => {
    setAds((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSimulate = () => {
    if (!selectedAudienceId) {
      setError("Select an audience session to simulate against.");
      return;
    }

    const trimmedAds = ads.map((ad) => ({
      id: ad.id,
      headline: ad.headline.trim(),
      description: ad.description.trim(),
      angle: ad.angle.trim(),
    }));

    const preparedAds = trimmedAds
      .filter((ad) => ad.headline && ad.description)
      .map((ad, index) => ({
        id: index + 1,
        headline: ad.headline,
        description: ad.description,
        angle: ad.angle ? ad.angle : undefined,
      }));

    if (preparedAds.length === 0) {
      setError("Provide at least one ad with a headline and description.");
      return;
    }

    if (sampledPersonas.length === 0) {
      setError(
        "No saved personas found for this audience session. Generate personas first."
      );
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        setResults([]);
        setLastRunAds(preparedAds);

        const responses = await Promise.all(
          sampledPersonas.map(async (persona) => {
            const reaction = await simulate({
              persona,
              ads: preparedAds,
            });
            return {
              persona,
              reactions: reaction.reactions_to_variants,
            };
          })
        );

        setResults(responses);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to run simulation. Please try again."
        );
      }
    });
  };

  const handleGenerateAd = async (index: number) => {
    if (index === 0) {
      setError("Provide the first ad manually before generating variations.");
      return;
    }
    const sourceAd = ads[index - 1];
    if (!sourceAd.headline.trim() || !sourceAd.description.trim()) {
      setError(
        "Complete the previous ad’s headline and description before generating a variation."
      );
      return;
    }
    setError(null);
    setGeneratingAdId(index);
    try {
      const variants = await generateVariants({
        count: 1,
        source: {
          headline: sourceAd.headline,
          description: sourceAd.description,
          angle: sourceAd.angle ? sourceAd.angle : undefined,
        },
        audienceHint: audienceHint ? audienceHint : undefined,
      });
      const generated = variants?.[0];
      if (!generated) {
        setError("The AI did not return a new ad. Try again.");
        return;
      }
      setAds((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          headline: generated.headline,
          description: generated.description,
          angle: generated.angle ?? "",
        };
        return next;
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate an ad variation. Please try again."
      );
    } finally {
      setGeneratingAdId(null);
    }
  };

  return (
    <div className="w-full overflow-x-hidden p-6 pb-24">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold leading-tight text-foreground">
            Ad Simulator
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Choose an audience, craft up to five ad variations, and simulate how
            recently generated personas will respond.
          </p>
        </header>

        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audience</CardTitle>
              <CardDescription>
                Simulations use the latest {PERSONA_SAMPLE_LIMIT} personas from
                the selected audience session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AudiencePicker
                allowClear
                onSelectAudience={setSelectedAudienceMeta}
                onChange={setSelectedAudienceId}
                value={selectedAudienceId}
              />
              {selectedAudienceId && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {sampledPersonas.length} persona
                  {sampledPersonas.length === 1 ? "" : "s"} available for
                  simulation.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ad Variations</CardTitle>
              <CardDescription>
                Headlines must stay under 120 characters and descriptions under
                300 characters for best results.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {ads.map((ad, index) => (
                <div
                  key={ad.id}
                  className="rounded-xl border border-border p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-medium text-sm text-muted-foreground">
                      Ad {index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      {generatingAdId === index && (
                        <span className="text-xs text-muted-foreground">
                          Generating...
                        </span>
                      )}
                      {index > 0 && (
                        <Button
                          disabled={generatingAdId !== null}
                          onClick={() => handleGenerateAd(index)}
                          size="sm"
                          type="button"
                          variant="secondary"
                        >
                          Auto-generate
                        </Button>
                      )}
                      {ad.headline.trim() && ad.description.trim() && (
                        <Badge variant="outline">Ready</Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <Field>
                      <FieldLabel>Headline</FieldLabel>
                      <FieldContent>
                        <Input
                          maxLength={120}
                          onChange={(event) =>
                            handleAdChange(index, "headline", event.target.value)
                          }
                          placeholder="Enter a compelling headline"
                          value={ad.headline}
                        />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>Description</FieldLabel>
                      <FieldContent>
                        <Textarea
                          maxLength={300}
                          onChange={(event) =>
                            handleAdChange(
                              index,
                              "description",
                              event.target.value
                            )
                          }
                          placeholder="Describe the ad in more detail"
                          rows={4}
                          value={ad.description}
                        />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>Angle (Optional)</FieldLabel>
                      <FieldContent>
                        <Input
                          onChange={(event) =>
                            handleAdChange(index, "angle", event.target.value)
                          }
                          placeholder="e.g. Eco-conscious commuters"
                          value={ad.angle}
                        />
                      </FieldContent>
                    </Field>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button
              className="self-start"
              disabled={isPending}
              onClick={handleSimulate}
              type="button"
            >
              {isPending ? "Simulating..." : "Run Simulation"}
            </Button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold text-foreground">
              Persona Reactions
            </h2>
            <p className="text-muted-foreground text-sm">
              Each card shows how an individual persona in the selected audience
              responds to the supplied ads.
            </p>
          </div>

          {isPending && results.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Generating simulated reactions...
              </CardContent>
            </Card>
          )}

          {!isPending && results.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No simulations yet. Select an audience session, add ads, and run
                the simulator.
              </CardContent>
            </Card>
          )}

          {results.map((result) => (
            <Card key={`${result.persona._id}`}>
              <CardHeader>
                <CardTitle className="flex flex-col gap-1 text-lg">
                  <span>
                    {result.persona.profileFirstName}{" "}
                    {result.persona.profileLastName}
                  </span>
                  <span className="text-muted-foreground text-sm font-normal">
                    {result.persona.profileOccupation} ·{" "}
                    {result.persona.profileLocationCity},{" "}
                    {result.persona.profileLocationState}
                  </span>
                </CardTitle>
                <CardDescription>
                  Personality: {result.persona.personalityOceanSummary}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  {result.reactions.map((reaction) => {
                    const relatedAd = lastRunAds.find(
                      (ad) => ad.id === reaction.variant_id
                    );
                    return (
                      <div
                        key={`${result.persona._id}-${reaction.variant_id}`}
                        className="flex flex-col gap-3 rounded-lg border border-border bg-card/40 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold text-foreground">
                              Ad {reaction.variant_id}
                            </div>
                            {relatedAd && (
                              <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                                <div className="font-medium text-foreground">
                                  {relatedAd.headline}
                                </div>
                                <p>{relatedAd.description}</p>
                                {relatedAd.angle && (
                                  <div className="text-xs italic">
                                    Angle: {relatedAd.angle}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <Badge variant="outline">
                            {reaction.predicted_behavior}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm leading-relaxed">
                          <div>
                            <span className="font-medium text-foreground">
                              Emotional Response:
                            </span>{" "}
                            {reaction.emotional_response.join(", ")}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">
                              Cognitive Response:
                            </span>{" "}
                            {reaction.cognitive_response}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">
                              Engagement Score:
                            </span>{" "}
                            {formatEngagementScore(reaction.engagement_score)}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">
                              Justification:
                            </span>{" "}
                            {reaction.justification}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}
