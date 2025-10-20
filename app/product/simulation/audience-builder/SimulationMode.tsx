"use client";

import { Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AttachFilesPicker } from "@/components/ui/attach-files-picker";
import { type Audience, AudiencePicker } from "@/components/ui/audience-picker";
import { Button } from "@/components/ui/button";
import type { AdGroup } from "@/components/ui/campaign-ad-group-picker";
import {
  type GoogleAdsAccount,
  GoogleAdsAccountPicker,
} from "@/components/ui/google-ads-account-picker";
import { SimulationContentPicker } from "@/components/ui/simulation-content-picker";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type {
  ManualAdDraft,
  ManualKeywordDraft,
  SimulationKind,
  SimulationSubmission,
} from "./types";

interface SimulationModeProps {
  onSubmit: (payload: SimulationSubmission) => void;
  isPending: boolean;
  error: string | null;
}

export function SimulationMode({
  onSubmit,
  isPending,
  error,
}: SimulationModeProps) {
  const [simulationKind, setSimulationKind] = useState<SimulationKind>("ads");
  const [contextValue, setContextValue] = useState("");
  const [keywordGoal, setKeywordGoal] = useState("");
  const [keywordGoalError, setKeywordGoalError] = useState<string | null>(null);
  const [, setIsExpanded] = useState(false);
  const [selectedAudiences, setSelectedAudiences] = useState<Audience[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const manualAdIdRef = useRef(1);
  const manualKeywordIdRef = useRef(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [manualError, setManualError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

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
  const [isGoogleAdsAccountPickerOpen, setIsGoogleAdsAccountPickerOpen] =
    useState(false);
  const [isGoogleAdsAdsPickerOpen, setIsGoogleAdsAdsPickerOpen] =
    useState(false);
  const [selectedAdGroups, setSelectedAdGroups] = useState<AdGroup[]>([]);
  const [selectedAdsAdGroups, setSelectedAdsAdGroups] = useState<AdGroup[]>([]);

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

  const { seedKeywords, keywordCount } = useMemo(() => {
    const trimmed = manualKeywords
      .map((item) => item.value.trim())
      .filter((value) => value.length > 0);
    const unique = Array.from(new Set(trimmed));
    return { seedKeywords: unique, keywordCount: unique.length };
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

  const totalPills =
    selectedAudiences.length +
    (simulationKind === "ads"
      ? attachedFiles.length + cleanedAds.length + selectedAdsAdGroups.length
      : keywordCount + (keywordGoal.trim().length > 0 ? 1 : 0));

  const shouldExpand =
    contextValue.length > 100 || contextValue.includes("\n") || totalPills > 0;

  const textareaPlaceholder =
    "Add optional context or notes for this simulation (optional)";

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

      setManualError(null);
      setFormError(null);
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
      setManualError(null);
      setKeywordGoalError(
        "Describe the advertising goal to simulate keywords."
      );
      return;
    }

    setManualError(null);
    setFormError(null);
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

  const getTooltipText = () => {
    if (selectedAudiences.length === 0) {
      return "Please select at least one audience";
    }
    if (simulationKind === "ads") {
      if (!hasAnyAds) {
        return "Add at least one ad copy";
      }
      if (hasIncompleteAds) {
        return "Complete headline and description for every ad";
      }
      return "Run simulation";
    }
    if (keywordGoal.trim().length === 0) {
      return "Describe the advertising goal";
    }
    return "Run keyword simulation";
  };

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const nextValue = event.target.value;
    setContextValue(nextValue);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    const shouldExpandNext =
      nextValue.length > 100 || nextValue.includes("\n") || totalPills > 0;
    setIsExpanded(shouldExpandNext);
    if (formError && nextValue.trim().length > 0) {
      setFormError(null);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  useEffect(() => {
    setIsExpanded(shouldExpand);
  }, [shouldExpand]);

  return (
    <TooltipProvider delayDuration={300}>
      <form className="group/composer w-full" onSubmit={handleSubmit}>
        <div
          className={cn(
            "mx-auto w-full max-w-2xl overflow-clip border border-border bg-transparent bg-clip-padding p-2.5 shadow-lg transition-all duration-200 dark:bg-muted/50",
            {
              "grid grid-cols-1 grid-rows-[1fr_auto] rounded-3xl": shouldExpand,
              "grid grid-cols-[auto_1fr_auto] grid-rows-[1fr_auto] rounded-[28px]":
                !shouldExpand,
            }
          )}
          style={{
            gridTemplateAreas: shouldExpand
              ? "'primary' 'footer'"
              : "'leading primary trailing' '. footer .'",
          }}
        >
          <div
            className={cn(
              "relative flex min-h-20 items-start overflow-x-hidden px-1.5",
              {
                "mb-0 px-2 py-1": shouldExpand,
                "-my-2.5": !shouldExpand,
              }
            )}
            style={{ gridArea: "primary" }}
          >
            <div className="max-h-52 flex-1 overflow-auto">
              <Textarea
                className="scrollbar-thin min-h-0 resize-none rounded-none border-0 px-0 pt-3 pb-12 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent"
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder={textareaPlaceholder}
                ref={textareaRef}
                rows={3}
                value={contextValue}
              />

              <div className="absolute right-2 bottom-2 left-2 flex min-h-[40px] flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="min-w-[200px] flex-1">
                  <AudiencePicker
                    onAdGroupsClear={handleAdGroupsClear}
                    onAudiencesChange={handleAudiencesChange}
                    onGoogleAdsClick={handleGoogleAdsClick}
                    onMetaAdsClick={handleMetaAdsClick}
                    placeholder="Audiences"
                    selectedAdGroupsCount={selectedAdGroups.length}
                    selectedAudiences={selectedAudiences}
                  />
                </div>
                <div className="min-w-[220px] flex-1 sm:max-w-[280px]">
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
                </div>
                {simulationKind === "ads" ? (
                  <AttachFilesPicker
                    className="w-full min-w-[200px] sm:w-[220px]"
                    onSelectedFilesChange={setAttachedFiles}
                    selectedFiles={attachedFiles}
                  />
                ) : (
                  <div className="hidden min-h-[40px] w-[220px] sm:block" />
                )}
              </div>
            </div>
          </div>

          <div
            className="flex items-center gap-2"
            style={{ gridArea: shouldExpand ? "footer" : "trailing" }}
          >
            <div className="ms-auto flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      className="h-9 w-9 rounded-full"
                      disabled={
                        isPending ||
                        selectedAudiences.length === 0 ||
                        (simulationKind === "ads"
                          ? !hasCompleteAds
                          : keywordGoal.trim().length === 0)
                      }
                      size="icon"
                      type="submit"
                    >
                      <Send className="size-5" />
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getTooltipText()}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </form>

      {formError ? (
        <p className="mt-3 text-destructive text-sm">{formError}</p>
      ) : null}
      {simulationKind === "ads" && manualError ? (
        <p className="mt-3 text-destructive text-sm">{manualError}</p>
      ) : null}
      {simulationKind === "keywords" && keywordGoalError ? (
        <p className="mt-3 text-destructive text-sm">{keywordGoalError}</p>
      ) : null}
      {error ? <p className="mt-4 text-red-600 text-sm">{error}</p> : null}

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
    </TooltipProvider>
  );
}
