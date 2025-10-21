"use client";

import { useMemo, useRef, useState } from "react";
import { type Audience, AudiencePicker } from "@/components/ui/audience-picker";
import { Button } from "@/components/ui/button";
import type { AdGroup } from "@/components/ui/campaign-ad-group-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  type GoogleAdsAccount,
  GoogleAdsAccountPicker,
} from "@/components/ui/google-ads-account-picker";
import { SimulationContentPicker } from "@/components/ui/simulation-content-picker";
import { Textarea } from "@/components/ui/textarea";
import type {
  ManualAdDraft,
  ManualKeywordDraft,
  SimulationKind,
  SimulationSubmission,
} from "./types";

interface SimulationFormProps {
  onSubmit: (payload: SimulationSubmission) => Promise<void> | void;
  isPending: boolean;
  error: string | null;
}

export function SimulationForm({
  onSubmit,
  isPending,
  error,
}: SimulationFormProps) {
  const [simulationKind, setSimulationKind] = useState<SimulationKind>("ads");
  const [contextValue, setContextValue] = useState("");
  const [keywordGoal, setKeywordGoal] = useState("");
  const [keywordGoalError, setKeywordGoalError] = useState<string | null>(null);
  const [selectedAudiences, setSelectedAudiences] = useState<Audience[]>([]);
  const [manualError, setManualError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const manualAdIdRef = useRef(1);
  const manualKeywordIdRef = useRef(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isGoogleAdsAccountPickerOpen, setIsGoogleAdsAccountPickerOpen] =
    useState(false);
  const [isGoogleAdsAdsPickerOpen, setIsGoogleAdsAdsPickerOpen] =
    useState(false);
  const [selectedAdGroups, setSelectedAdGroups] = useState<AdGroup[]>([]);
  const [selectedAdsAdGroups, setSelectedAdsAdGroups] = useState<AdGroup[]>([]);

  const createManualAd = (): ManualAdDraft => {
    const id = manualAdIdRef.current;
    manualAdIdRef.current += 1;
    return { id, headline: "", description: "" };
  };

  const createManualKeyword = (): ManualKeywordDraft => {
    const id = manualKeywordIdRef.current;
    manualKeywordIdRef.current += 1;
    return { id, value: "" };
  };

  const [manualAds, setManualAds] = useState<ManualAdDraft[]>(() => [
    createManualAd(),
  ]);

  const [manualKeywords, setManualKeywords] = useState<ManualKeywordDraft[]>(
    () => [createManualKeyword()]
  );

  const { cleanedAds, hasAnyAds, hasCompleteAds, hasIncompleteAds } =
    useMemo(() => {
      const trimmed = manualAds.map((ad) => ({
        id: ad.id,
        headline: ad.headline.trim(),
        description: ad.description.trim(),
      }));
      const nonEmpty = trimmed.filter(
        (ad) => ad.headline.length > 0 || ad.description.length > 0
      );
      const complete =
        nonEmpty.length > 0 &&
        nonEmpty.every(
          (ad) => ad.headline.length > 0 && ad.description.length > 0
        );
      return {
        cleanedAds: nonEmpty.map((ad, index) => ({
          id: index + 1,
          headline: ad.headline,
          description: ad.description,
        })),
        hasAnyAds: nonEmpty.length > 0 || selectedAdsAdGroups.length > 0,
        hasCompleteAds: complete || selectedAdsAdGroups.length > 0,
        hasIncompleteAds:
          nonEmpty.length > 0 &&
          nonEmpty.some(
            (ad) => ad.headline.length === 0 || ad.description.length === 0
          ),
      };
    }, [manualAds, selectedAdsAdGroups]);

  const { seedKeywords } = useMemo(() => {
    const trimmed = manualKeywords
      .map((item) => item.value.trim())
      .filter((value) => value.length > 0);
    const unique = Array.from(new Set(trimmed));
    return { seedKeywords: unique };
  }, [manualKeywords]);

  const googleAdsAds = useMemo(
    () =>
      selectedAdsAdGroups.map((adGroup, index) => ({
        id: 1000 + index,
        headline: `Google Ads: ${adGroup.name}`,
        description: `Ad group from campaign ${adGroup.campaignName}`,
      })),
    [selectedAdsAdGroups]
  );

  const submitDisabledReason = (() => {
    if (selectedAudiences.length === 0) {
      return "Select at least one audience to run simulations.";
    }
    if (simulationKind === "ads") {
      if (!hasAnyAds) {
        return "Add at least one ad copy or import from Google Ads.";
      }
      if (!hasCompleteAds) {
        return "Provide both a headline and description for every ad copy.";
      }
      return null;
    }
    if (keywordGoal.trim().length === 0) {
      return "Describe the advertising goal to simulate keywords.";
    }
    return null;
  })();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedContext = contextValue.trim();
    const trimmedGoal = keywordGoal.trim();

    if (selectedAudiences.length === 0) {
      setFormError("Select at least one audience to run simulations.");
      return;
    }

    if (simulationKind === "ads") {
      if (!hasAnyAds) {
        setFormError(null);
        setManualError("Add at least one ad copy to simulate.");
        return;
      }
      if (!hasCompleteAds) {
        setFormError(null);
        setManualError(
          "Provide both a headline and description for every ad copy."
        );
        return;
      }

      setFormError(null);
      setManualError(null);
      setKeywordGoalError(null);
      onSubmit({
        mode: "ads",
        audiences: selectedAudiences,
        ads: [...cleanedAds, ...googleAdsAds],
        notes: trimmedContext ? trimmedContext : undefined,
      });
      return;
    }

    if (trimmedGoal.length === 0) {
      setFormError(null);
      setManualError(null);
      setKeywordGoalError(
        "Describe the advertising goal to simulate keywords."
      );
      return;
    }

    setFormError(null);
    setManualError(null);
    setKeywordGoalError(null);
    onSubmit({
      mode: "keywords",
      audiences: selectedAudiences,
      advertisingGoal: trimmedGoal,
      seedKeywords,
      notes: trimmedContext ? trimmedContext : undefined,
    });
  };

  const handleGoogleAdsClick = () => {
    setIsGoogleAdsAccountPickerOpen(true);
  };

  const handleGoogleAdsAccountSelect = (_account: GoogleAdsAccount) => {
    setFormError(null);
  };

  const handleAdGroupsSelect = (adGroups: AdGroup[]) => {
    setSelectedAdGroups(adGroups);

    if (adGroups.length === 0) {
      setSelectedAudiences((prev) =>
        prev.filter((audience) => audience.source !== "google-ads")
      );
      setIsGoogleAdsAccountPickerOpen(false);
      return;
    }

    const googleAdsAudience: Audience = {
      id: `google-ads-${Date.now()}`,
      name: `Google Ads (${adGroups.length} Ad Groups)`,
      source: "google-ads",
      count: adGroups.length,
    };

    setSelectedAudiences((prev) => {
      const existingGoogleAdsAudience = prev.find(
        (audience) => audience.source === "google-ads"
      );

      if (existingGoogleAdsAudience) {
        return prev.map((audience) =>
          audience.source === "google-ads"
            ? {
                ...audience,
                name: `Google Ads (${adGroups.length} Ad Groups)`,
                count: adGroups.length,
              }
            : audience
        );
      }

      return [...prev, googleAdsAudience];
    });
    setFormError(null);
    setIsGoogleAdsAccountPickerOpen(false);
  };

  const handleAdGroupsClear = () => {
    setSelectedAdGroups([]);
    setSelectedAudiences((prev) =>
      prev.filter((audience) => audience.source !== "google-ads")
    );
  };

  const handleGoogleAdsAdsClick = () => {
    setSimulationKind("ads");
    setIsGoogleAdsAdsPickerOpen(true);
  };

  const handleGoogleAdsAdsSelect = (_account: GoogleAdsAccount) => {
    setManualError(null);
    setFormError(null);
  };

  const handleGoogleAdsAdsGroupsSelect = (adGroups: AdGroup[]) => {
    setSelectedAdsAdGroups(adGroups);
    if (adGroups.length > 0) {
      setManualError(null);
    }
    setIsGoogleAdsAdsPickerOpen(false);
  };

  const handleRemoveAdsAdGroups = () => {
    setSelectedAdsAdGroups([]);
  };

  const handleMetaAdsClick = () => {
    // TODO: Integrate Meta Ads audience import.
  };

  const handleManualAdChange = (
    id: number,
    field: "headline" | "description",
    value: string
  ) => {
    setManualAds((prev) =>
      prev.map((ad) => (ad.id === id ? { ...ad, [field]: value } : ad))
    );
    setManualError(null);
  };

  const handleAddManualAd = () => {
    setManualAds((prev) => [...prev, createManualAd()]);
    setManualError(null);
  };

  const handleRemoveManualAd = (id: number) => {
    setManualAds((prev) => {
      const next = prev.filter((ad) => ad.id !== id);
      if (next.length > 0) {
        return next;
      }
      return [createManualAd()];
    });
    setManualError(null);
  };

  const handleClearManualAds = () => {
    manualAdIdRef.current = 1;
    setManualAds([createManualAd()]);
    setManualError(null);
  };

  const handleManualKeywordChange = (id: number, value: string) => {
    setManualKeywords((prev) =>
      prev.map((keyword) =>
        keyword.id === id ? { ...keyword, value } : keyword
      )
    );
    if (formError) {
      setFormError(null);
    }
  };

  const handleAddManualKeyword = () => {
    setManualKeywords((prev) => [...prev, createManualKeyword()]);
  };

  const handleRemoveManualKeyword = (id: number) => {
    setManualKeywords((prev) => {
      const next = prev.filter((keyword) => keyword.id !== id);
      if (next.length > 0) {
        return next;
      }
      return [createManualKeyword()];
    });
  };

  const handleClearManualKeywords = () => {
    manualKeywordIdRef.current = 1;
    setManualKeywords([createManualKeyword()]);
  };

  const handleAudiencesChange = (audiences: Audience[]) => {
    setSelectedAudiences(audiences);
    if (audiences.length > 0) {
      setFormError(null);
    }
  };

  const handleContextChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const nextValue = event.target.value;
    setContextValue(nextValue);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <form
      className="mx-auto flex w-full max-w-6xl flex-col gap-6"
      onSubmit={handleSubmit}
    >
      <Card>
        <CardHeader>
          <CardTitle>Simulation setup</CardTitle>
          <CardDescription>
            Configure your audiences and inputs, then run persona simulations on
            ad variants or keyword strategies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="space-y-6">
            <FieldSet>
              <Field>
                <FieldLabel>Audience selection</FieldLabel>
                <AudiencePicker
                  onAdGroupsClear={handleAdGroupsClear}
                  onAudiencesChange={handleAudiencesChange}
                  onGoogleAdsClick={handleGoogleAdsClick}
                  onMetaAdsClick={handleMetaAdsClick}
                  placeholder="Select audiences"
                  selectedAdGroupsCount={selectedAdGroups.length}
                  selectedAudiences={selectedAudiences}
                />
                {formError ? (
                  <FieldDescription className="text-destructive">
                    {formError}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <FieldLabel>Simulation type</FieldLabel>
                <SimulationContentPicker
                  googleAdsAdGroupCount={selectedAdsAdGroups.length}
                  hasIncompleteManualAds={
                    hasIncompleteAds && manualError === null
                  }
                  keywordGoal={keywordGoal}
                  keywordGoalError={keywordGoalError}
                  manualAdCount={cleanedAds.length}
                  manualAds={manualAds}
                  manualKeywords={manualKeywords}
                  manualValidationError={manualError}
                  onClearGoogleAdsSelection={handleRemoveAdsAdGroups}
                  onGoogleAdsImport={handleGoogleAdsAdsClick}
                  onKeywordGoalChange={(value) => {
                    setKeywordGoal(value);
                    if (value.trim().length > 0) {
                      setKeywordGoalError(null);
                    }
                  }}
                  onManualAdAdd={handleAddManualAd}
                  onManualAdChange={handleManualAdChange}
                  onManualAdRemove={handleRemoveManualAd}
                  onManualAdsClear={handleClearManualAds}
                  onManualKeywordAdd={handleAddManualKeyword}
                  onManualKeywordChange={handleManualKeywordChange}
                  onManualKeywordRemove={handleRemoveManualKeyword}
                  onManualKeywordsClear={handleClearManualKeywords}
                  onSimulationKindChange={(kind) => {
                    setSimulationKind(kind);
                    setFormError(null);
                    setManualError(null);
                    setKeywordGoalError(null);
                  }}
                  simulationKind={simulationKind}
                />
                {simulationKind === "ads" && manualError ? (
                  <FieldDescription className="text-destructive">
                    {manualError}
                  </FieldDescription>
                ) : null}
                {simulationKind === "keywords" && keywordGoalError ? (
                  <FieldDescription className="text-destructive">
                    {keywordGoalError}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="simulation-notes">Notes</FieldLabel>
                <Textarea
                  id="simulation-notes"
                  onChange={handleContextChange}
                  placeholder="Add optional context or notes for this simulation"
                  ref={textareaRef}
                  rows={4}
                  value={contextValue}
                />
              </Field>
            </FieldSet>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {submitDisabledReason ? (
            <p className="text-muted-foreground text-sm">
              {submitDisabledReason}
            </p>
          ) : (
            <span className="text-muted-foreground text-sm">
              Ready to run simulations.
            </span>
          )}
          <Button
            disabled={isPending || Boolean(submitDisabledReason)}
            type="submit"
          >
            {isPending ? "Running…" : "Run simulation"}
          </Button>
        </CardFooter>
      </Card>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <GoogleAdsAccountPicker
        onAccountSelect={handleGoogleAdsAccountSelect}
        onAdGroupsSelect={handleAdGroupsSelect}
        onOpenChange={setIsGoogleAdsAccountPickerOpen}
        open={isGoogleAdsAccountPickerOpen}
        pickerType="audience"
      />

      <GoogleAdsAccountPicker
        onAccountSelect={handleGoogleAdsAdsSelect}
        onAdGroupsSelect={handleGoogleAdsAdsGroupsSelect}
        onOpenChange={setIsGoogleAdsAdsPickerOpen}
        open={isGoogleAdsAdsPickerOpen}
      />
    </form>
  );
}
