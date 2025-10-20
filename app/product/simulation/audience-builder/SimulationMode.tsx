"use client";

import { Plus, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdvertisementsPicker } from "@/components/ui/advertisements-picker";
import { AttachFilesPicker } from "@/components/ui/attach-files-picker";
import { type Audience, AudiencePicker } from "@/components/ui/audience-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

interface ManualAdEntry {
  id: number;
  headline: string;
  description: string;
}

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
  const manualEntryRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createManualAd = () => {
    const id = manualAdIdRef.current;
    manualAdIdRef.current += 1;
    return { id, headline: "", description: "" };
  };
  const [manualAds, setManualAds] = useState<ManualAdEntry[]>(() => [
    createManualAd(),
  ]);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

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
        hasAnyAds: nonEmpty.length > 0,
        hasCompleteAds: complete,
        hasIncompleteAds:
          nonEmpty.length > 0 &&
          nonEmpty.some(
            (ad) => ad.headline.length === 0 || ad.description.length === 0
          ),
      };
    }, [manualAds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAudiences.length === 0) {
      setValidationError("Select at least one audience to run simulations.");
      return;
    }
    if (!hasAnyAds) {
      setValidationError("Add at least one ad copy to simulate.");
      return;
    }
    if (!hasCompleteAds) {
      setValidationError(
        "Provide both a headline and description for every ad copy."
      );
      return;
    }
    setValidationError(null);
    onSubmit({
      audiences: selectedAudiences,
      ads: cleanedAds,
      notes: message.trim() ? message.trim() : undefined,
    });
  };

  const handleGoogleAdsClick = () => {
    // TODO: Integrate Google Ads audience import.
  };

  const handleMetaAdsClick = () => {
    // TODO: Integrate Mta Ads audience import.
  };

  const handleAttachFilesClick = (files: FileList | null) => {
    if (files && files.length > 0) {
      // TODO: Implement file processing/upload logic
    }
  };

  const handleManualEntryClick = () => {
    setShowManualEntry(true);
    setIsExpanded(true);
    requestAnimationFrame(() => {
      manualEntryRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const handleManualAdChange = (
    id: number,
    field: "headline" | "description",
    value: string
  ) => {
    setManualAds((prev) =>
      prev.map((ad) => (ad.id === id ? { ...ad, [field]: value } : ad))
    );
    setValidationError(null);
  };

  const handleAddManualAd = () => {
    setManualAds((prev) => [...prev, createManualAd()]);
    setValidationError(null);
  };

  const handleRemoveManualAd = (id: number) => {
    setManualAds((prev) => {
      const next = prev.filter((ad) => ad.id !== id);
      if (next.length > 0) {
        return next;
      }
      return [createManualAd()];
    });
    setValidationError(null);
  };

  const handleAudiencesChange = (audiences: Audience[]) => {
    setSelectedAudiences(audiences);
    if (audiences.length > 0) {
      setValidationError(null);
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
    cleanedAds.length;

  // Determine if textarea should be expanded based on content or pills
  const shouldExpand =
    message.length > 100 ||
    message.includes("\n") ||
    totalPills > 0 ||
    showManualEntry;

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = e.target.value;
    setMessage(nextValue);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    const shouldExpandNext =
      nextValue.length > 100 ||
      nextValue.includes("\n") ||
      totalPills > 0 ||
      showManualEntry;
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
            "mx-auto w-full max-w-2xl cursor-text overflow-clip border border-border bg-transparent bg-clip-padding p-2.5 shadow-lg transition-all duration-200 dark:bg-muted/50",
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
                    onAudiencesChange={handleAudiencesChange}
                    onGoogleAdsClick={handleGoogleAdsClick}
                    onMetaAdsClick={handleMetaAdsClick}
                    placeholder="Audiences"
                    selectedAudiences={selectedAudiences}
                  />
                </div>
                <AdvertisementsPicker
                  onAttachFilesClick={handleAttachFilesClick}
                  onFileCountChange={setAdvertisementFileCount}
                  onGoogleAdsClick={handleGoogleAdsClick}
                  onManualEntryClick={handleManualEntryClick}
                  onMetaAdsClick={handleMetaAdsClick}
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

        {(showManualEntry || hasAnyAds) && (
          <div
            className="mx-auto mt-4 w-full max-w-2xl rounded-2xl border border-muted-foreground/40 border-dashed bg-muted/10 p-4"
            ref={manualEntryRef}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-medium text-sm">Manual ad copies</h3>
                <p className="text-muted-foreground text-xs">
                  Provide headlines and descriptions you want personas to react
                  to.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleAddManualAd}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add ad
                </Button>
                <Button
                  onClick={() => {
                    setManualAds([createManualAd()]);
                    setValidationError(null);
                  }}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Clear all
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {manualAds.map((ad, index) => (
                <div
                  className="rounded-xl border border-border bg-background/90 p-4 shadow-sm"
                  key={ad.id}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                      Ad {index + 1}
                    </span>
                    {manualAds.length > 1 ? (
                      <Button
                        onClick={() => handleRemoveManualAd(ad.id)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-1.5">
                      <Label className="font-medium text-xs uppercase tracking-wide">
                        Headline
                      </Label>
                      <Input
                        onChange={(event) =>
                          handleManualAdChange(
                            ad.id,
                            "headline",
                            event.target.value
                          )
                        }
                        placeholder="Enter an attention-grabbing headline"
                        value={ad.headline}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-medium text-xs uppercase tracking-wide">
                        Description
                      </Label>
                      <Textarea
                        className="min-h-[70px]"
                        onChange={(event) =>
                          handleManualAdChange(
                            ad.id,
                            "description",
                            event.target.value
                          )
                        }
                        placeholder="Add supporting copy that explains the offer"
                        value={ad.description}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {validationError && (
              <p className="mt-3 text-destructive text-sm">{validationError}</p>
            )}
            {!validationError && hasIncompleteAds && (
              <p className="mt-3 text-muted-foreground text-sm">
                Finish filling in every headline and description to run the
                simulation.
              </p>
            )}
          </div>
        )}
      </form>

      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
    </TooltipProvider>
  );
}
