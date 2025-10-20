"use client";

import { Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdvertisementsPicker } from "@/components/ui/advertisements-picker";
import { AttachFilesPicker } from "@/components/ui/attach-files-picker";
import { type Audience, AudiencePicker } from "@/components/ui/audience-picker";
import { Button } from "@/components/ui/button";
import {
  type GoogleAdsAccount,
  GoogleAdsAccountPicker,
} from "@/components/ui/google-ads-account-picker";
import { type AdGroup } from "@/components/ui/campaign-ad-group-picker";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
import type { ManualAdDraft } from "./types";

export interface SimulationSubmission {
  audiences: Audience[];
  ads: Array<{
    id: number;
    headline: string;
    description: string;
  }>;
  notes?: string;
}

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
  const [message, setMessage] = useState("");
  const [, setIsExpanded] = useState(false);
  const [selectedAudiences, setSelectedAudiences] = useState<Audience[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [advertisementFileCount, setAdvertisementFileCount] = useState(0);
  const manualAdIdRef = useRef(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createManualAd = (): ManualAdDraft => {
    const id = manualAdIdRef.current;
    manualAdIdRef.current += 1;
    return { id, headline: "", description: "" };
  };
  const [manualAds, setManualAds] = useState<ManualAdDraft[]>(() => [
    createManualAd(),
  ]);
  const [manualError, setManualError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAudiences.length === 0) {
      setFormError("Select at least one audience to run simulations.");
      return;
    }
    if (!hasAnyAds) {
      setFormError(null);
      setManualError("Add at least one ad copy to simulate.");
      return;
    }
    if (!hasCompleteAds) {
      setFormError(null);
      // Only show this error if there are manual ads that are incomplete
      if (cleanedAds.length > 0) {
        setManualError(
          "Provide both a headline and description for every ad copy."
        );
      } else {
        setManualError("Add at least one ad copy to simulate.");
      }
      return;
    }
    setFormError(null);
    setManualError(null);
    
    // Convert Google Ads ad groups to the expected ad format
    const googleAdsAds = selectedAdsAdGroups.map((adGroup, index) => ({
      id: 1000 + index, // Use high IDs to avoid conflicts with manual ads
      headline: `Google Ads: ${adGroup.name}`,
      description: `Ad Group from campaign ${adGroup.campaignId}`,
    }));
    
    onSubmit({
      audiences: selectedAudiences,
      ads: [...cleanedAds, ...googleAdsAds],
      notes: message.trim() ? message.trim() : undefined,
    });
  };

  const handleGoogleAdsClick = () => {
    setIsGoogleAdsAccountPickerOpen(true);
  };

  const handleGoogleAdsAdsClick = () => {
    // Open Google Ads advertisements picker (different from audience picker)
    setIsGoogleAdsAdsPickerOpen(true);
  };

  const handleGoogleAdsAccountSelect = (account: GoogleAdsAccount) => {
    // Don't add audience here - only store the account for later use
    // The audience will be added when ad groups are actually selected
    setFormError(null);
  };

  const handleAdGroupsSelect = (adGroups: AdGroup[]) => {
    setSelectedAdGroups(adGroups);
    
    // Only add Google Ads audience if ad groups are actually selected
    if (adGroups.length > 0) {
      // Find the account that was selected (we need to get this from the picker)
      // For now, we'll use a placeholder - in a real implementation, 
      // we'd need to pass the account info through the ad groups selection
      const googleAdsAudience: Audience = {
        id: `google-ads-${Date.now()}`, // Use timestamp to ensure uniqueness
        name: `Google Ads (${adGroups.length} Ad Groups)`,
        source: "google-ads",
        count: adGroups.length,
      };

      // Check if we already have a Google Ads audience
      const existingGoogleAdsAudience = selectedAudiences.find(
        (audience) => audience.source === "google-ads"
      );

      if (existingGoogleAdsAudience) {
        // Update the existing audience instead of adding a new one
        setSelectedAudiences((prev) =>
          prev.map((audience) =>
            audience.source === "google-ads"
              ? { ...audience, name: `Google Ads (${adGroups.length} Ad Groups)`, count: adGroups.length }
              : audience
          )
        );
      } else {
        // Add new Google Ads audience
        setSelectedAudiences((prev) => [...prev, googleAdsAudience]);
      }
    } else {
      // If no ad groups selected, remove any existing Google Ads audience
      setSelectedAudiences((prev) => prev.filter((audience) => audience.source !== "google-ads"));
    }
  };

  const handleAdGroupsClear = () => {
    setSelectedAdGroups([]);
    // Also remove the Google Ads audience when ad groups are cleared
    setSelectedAudiences((prev) => prev.filter((audience) => audience.source !== "google-ads"));
  };

  const handleGoogleAdsAdsSelect = (account: GoogleAdsAccount) => {
    // TODO: Implement actual Google Ads advertisements import logic
    // For now, we'll just show a success message or add placeholder ads
    console.log("Selected Google Ads account for advertisements:", account);
    setIsGoogleAdsAdsPickerOpen(false);
  };

  const handleGoogleAdsAdsGroupsSelect = (adGroups: AdGroup[]) => {
    // Store the selected ad groups for advertisements
    setSelectedAdsAdGroups(adGroups);
    console.log("Selected ad groups for advertisements:", adGroups);
    setIsGoogleAdsAdsPickerOpen(false);
  };

  const handleRemoveAdsAdGroups = () => {
    setSelectedAdsAdGroups([]);
  };

  const handleMetaAdsClick = () => {
    // TODO: Integrate Mta Ads audience import.
  };

  const handleAttachFilesClick = (files: FileList | null) => {
    if (files && files.length > 0) {
      // TODO: Implement file processing/upload logic
    }
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
    if (!hasAnyAds) {
      return "Add at least one ad copy";
    }
    if (hasIncompleteAds) {
      return "Complete headline and description for every ad";
    }
    return "Run simulation";
  };

  // Calculate total number of pills
  const totalPills =
    selectedAudiences.length +
    attachedFiles.length +
    advertisementFileCount +
    cleanedAds.length +
    selectedAdsAdGroups.length;

  // Determine if textarea should be expanded based on content or pills
  const shouldExpand =
    message.length > 100 || message.includes("\n") || totalPills > 0;

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = e.target.value;
    setMessage(nextValue);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    const shouldExpandNext =
      nextValue.length > 100 || nextValue.includes("\n") || totalPills > 0;
    setIsExpanded(shouldExpandNext);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Update expansion state when pills change
  useEffect(() => {
    setIsExpanded(shouldExpand);
  }, [shouldExpand]);

  return (
    <TooltipProvider delayDuration={300}>
      <form className="group/composer w-full" onSubmit={handleSubmit}>
        <div
          className={cn(
            "mx-auto w-full max-w-4xl cursor-text overflow-clip border border-border bg-transparent bg-clip-padding p-2.5 shadow-lg transition-all duration-200 dark:bg-muted/50",
            {
              "grid grid-cols-1 grid-rows-[auto_1fr_auto] rounded-3xl":
                shouldExpand,
              "grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] rounded-[28px]":
                !shouldExpand,
            }
          )}
          style={{
            gridTemplateAreas: shouldExpand
              ? "'header' 'primary' 'footer'"
              : "'header header header' 'leading primary trailing' '. footer .'",
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
                placeholder="Add optional context for the simulation (notes, scenario, etc.)"
                ref={textareaRef}
                rows={3}
                value={message}
              />

              {/* Audience Picker, Advertisements, and Attach Files - positioned at bottom */}
              <div className="absolute right-2 bottom-2 left-2 flex gap-2">
                <div className="flex-1">
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
                <AdvertisementsPicker
                  hasIncompleteManualAds={
                    hasIncompleteAds && manualError === null
                  }
                  manualAdCount={cleanedAds.length}
                  manualAds={manualAds}
                  manualValidationError={manualError}
                  onAttachFilesClick={handleAttachFilesClick}
                  onFileCountChange={setAdvertisementFileCount}
                  onGoogleAdsClick={handleGoogleAdsAdsClick}
                  onManualAdAdd={handleAddManualAd}
                  onManualAdChange={handleManualAdChange}
                  onManualAdRemove={handleRemoveManualAd}
                  onManualAdsClear={handleClearManualAds}
                  onMetaAdsClick={handleMetaAdsClick}
                  onRemoveAdGroups={handleRemoveAdsAdGroups}
                  selectedAdGroups={selectedAdsAdGroups}
                />
                <AttachFilesPicker
                  onSelectedFilesChange={setAttachedFiles}
                  selectedFiles={attachedFiles}
                />
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
                        !hasCompleteAds
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
      {manualError ? (
        <p className="mt-3 text-destructive text-sm">{manualError}</p>
      ) : null}
      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}

      <GoogleAdsAccountPicker
        onAccountSelect={handleGoogleAdsAccountSelect}
        onAdGroupsSelect={handleAdGroupsSelect}
        onOpenChange={setIsGoogleAdsAccountPickerOpen}
        open={isGoogleAdsAccountPickerOpen}
      />

      {/* Google Ads Advertisements Picker */}
      <GoogleAdsAccountPicker
        onAccountSelect={handleGoogleAdsAdsSelect}
        onAdGroupsSelect={handleGoogleAdsAdsGroupsSelect}
        onOpenChange={setIsGoogleAdsAdsPickerOpen}
        open={isGoogleAdsAdsPickerOpen}
      />
    </TooltipProvider>
  );
}
