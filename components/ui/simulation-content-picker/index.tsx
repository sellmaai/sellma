"use client";

import { Megaphone, Tag } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import type {
  ManualAdDraft,
  ManualKeywordAdGroupDraft,
  ManualKeywordDraft,
} from "@/app/product/simulation/types";
import { ManualAdsDialog } from "@/components/ui/advertisements-picker/ManualAdsDialog";
import { Button } from "@/components/ui/button";
import type { AdGroup } from "@/components/ui/campaign-ad-group-picker";
import { ManualKeywordsDialog } from "@/components/ui/keywords-picker/ManualKeywordsDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AdContentPickerProps {
  manualAds: ManualAdDraft[];
  manualAdCount: number;
  onManualAdChange: (
    id: number,
    field: "headline" | "description",
    value: string
  ) => void;
  onManualAdAdd: () => void;
  onManualAdRemove: (id: number) => void;
  onManualAdsClear: () => void;
  manualValidationError: string | null;
  hasIncompleteManualAds: boolean;
  googleAdsAdGroupCount?: number;
  onGoogleAdsImport?: () => void;
  onClearGoogleAdsSelection?: () => void;
}

export function AdContentPicker({
  manualAds,
  manualAdCount,
  onManualAdChange,
  onManualAdAdd,
  onManualAdRemove,
  onManualAdsClear,
  manualValidationError,
  hasIncompleteManualAds,
  googleAdsAdGroupCount = 0,
  onGoogleAdsImport,
  onClearGoogleAdsSelection,
}: AdContentPickerProps) {
  const [open, setOpen] = useState(false);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);

  const trimmedManualAds = useMemo(
    () =>
      manualAds
        .map((ad) => ({
          headline: ad.headline.trim(),
          description: ad.description.trim(),
        }))
        .filter((ad) => ad.headline.length > 0 || ad.description.length > 0),
    [manualAds]
  );

  const manualPreviewLabels = useMemo(
    () =>
      trimmedManualAds
        .slice(0, 2)
        .map((ad) => (ad.headline.length > 0 ? ad.headline : ad.description)),
    [trimmedManualAds]
  );

  const totalAdsCount = manualAdCount + googleAdsAdGroupCount;

  const selectedLabel = useMemo(() => {
    if (totalAdsCount === 0) {
      return "Configure ad reactions";
    }
    if (totalAdsCount === 1) {
      return "1 ad ready";
    }
    return `${totalAdsCount} ads ready`;
  }, [totalAdsCount]);

  const secondaryContent = useMemo(() => {
    if (totalAdsCount === 0) {
      return (
        <span className="text-muted-foreground text-xs">
          Add manual ad variants or import from Google Ads.
        </span>
      );
    }

    const parts: string[] = [];

    if (googleAdsAdGroupCount > 0) {
      parts.push(`Google Ads import (${googleAdsAdGroupCount})`);
    }

    if (manualPreviewLabels.length > 0) {
      const label = manualPreviewLabels.join(" • ");
      parts.push(
        manualAdCount > manualPreviewLabels.length ? `${label} • …` : label
      );
    }

    if (parts.length === 0) {
      return (
        <span className="text-muted-foreground text-xs">
          Configure at least one ad variant to get started.
        </span>
      );
    }

    return (
      <span className="text-muted-foreground text-xs">{parts.join(" • ")}</span>
    );
  }, [
    googleAdsAdGroupCount,
    manualAdCount,
    manualPreviewLabels,
    totalAdsCount,
  ]);

  return (
    <>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            className="h-auto min-h-[32px] justify-start gap-2 px-2 py-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            type="button"
            variant="ghost"
          >
            <div className="flex flex-1 flex-col gap-1 text-left">
              <span className="text-sm">{selectedLabel}</span>
              {secondaryContent}
            </div>
            <Megaphone className="mr-1 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 space-y-2 p-2">
          <Button
            className="h-9 w-full justify-start px-3 text-left"
            onClick={() => {
              setOpen(false);
              setManualDialogOpen(true);
            }}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Megaphone className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Configure ads</span>
          </Button>
          <Button
            className="h-9 w-full justify-start px-3 text-left"
            disabled={!onGoogleAdsImport}
            onClick={() => {
              if (!onGoogleAdsImport) {
                return;
              }
              setOpen(false);
              onGoogleAdsImport();
            }}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Megaphone className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Import from Google Ads</span>
          </Button>

          {googleAdsAdGroupCount > 0 ? (
            <div className="rounded-md bg-muted px-3 py-2 text-muted-foreground text-xs">
              <div className="flex items-center justify-between gap-2">
                <span>Google Ads import ready</span>
                {onClearGoogleAdsSelection ? (
                  <Button
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      onClearGoogleAdsSelection();
                      setOpen(false);
                    }}
                    type="button"
                    variant="ghost"
                  >
                    Clear
                  </Button>
                ) : null}
              </div>
              <p className="mt-1">
                {googleAdsAdGroupCount} ad group
                {googleAdsAdGroupCount === 1 ? "" : "s"} selected.
              </p>
            </div>
          ) : null}

          {(() => {
            if (manualValidationError) {
              return (
                <p className="text-destructive text-xs">
                  {manualValidationError}
                </p>
              );
            }
            if (hasIncompleteManualAds) {
              return (
                <p className="text-muted-foreground text-xs">
                  Finish every headline and description to run simulations.
                </p>
              );
            }
            return null;
          })()}

          {manualPreviewLabels.length > 0 ? (
            <div className="rounded-md border border-dashed px-3 py-2 text-xs">
              <p className="font-medium">Manual preview</p>
              <p className="text-muted-foreground">
                {manualPreviewLabels.join(" • ")}
                {manualAdCount > manualPreviewLabels.length
                  ? ` • +${manualAdCount - manualPreviewLabels.length} more`
                  : ""}
              </p>
            </div>
          ) : null}

          {onGoogleAdsImport ? null : (
            <p className="text-muted-foreground text-xs">
              Connect Google Ads to enable imports.
            </p>
          )}
        </PopoverContent>
      </Popover>

      <ManualAdsDialog
        hasIncompleteManualAds={hasIncompleteManualAds}
        manualAds={manualAds}
        manualValidationError={manualValidationError}
        onManualAdAdd={onManualAdAdd}
        onManualAdChange={onManualAdChange}
        onManualAdRemove={onManualAdRemove}
        onManualAdsClear={() => {
          onManualAdsClear();
          setManualDialogOpen(false);
        }}
        onOpenChange={setManualDialogOpen}
        open={manualDialogOpen}
      />
    </>
  );
}

interface KeywordContentPickerProps {
  adGroups: AdGroup[];
  adGroupError: string | null;
  importedAdGroups: AdGroup[];
  manualAdGroups: ManualKeywordAdGroupDraft[];
  manualKeywords: ManualKeywordDraft[];
  keywordGoal: string;
  onManualKeywordChange: (id: number, value: string) => void;
  onManualKeywordAdd: () => void;
  onManualKeywordRemove: (id: number) => void;
  onManualKeywordsClear: () => void;
  onKeywordGoalChange: (value: string) => void;
  onManualAdGroupChange: (
    id: number,
    field: "name" | "campaignName",
    value: string
  ) => void;
  onManualAdGroupAdd: () => void;
  onManualAdGroupRemove: (id: number) => void;
  onManualAdGroupsClear: () => void;
  onAdGroupsImport: () => void;
  onClearAdGroups: () => void;
}

export function KeywordContentPicker({
  adGroups,
  adGroupError,
  importedAdGroups,
  manualAdGroups,
  manualKeywords,
  keywordGoal,
  onManualKeywordChange,
  onManualKeywordAdd,
  onManualKeywordRemove,
  onManualKeywordsClear,
  onKeywordGoalChange,
  onManualAdGroupChange,
  onManualAdGroupAdd,
  onManualAdGroupRemove,
  onManualAdGroupsClear,
  onAdGroupsImport,
  onClearAdGroups,
}: KeywordContentPickerProps) {
  const [open, setOpen] = useState(false);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);

  const adGroupCount = adGroups.length;
  const importedAdGroupCount = importedAdGroups.length;
  const trimmedKeywords = useMemo(
    () =>
      manualKeywords
        .map((item) => item.value.trim())
        .filter((value) => value.length > 0),
    [manualKeywords]
  );
  const keywordPreview = trimmedKeywords.slice(0, 3);
  const goalText = keywordGoal.trim();

  const selectedLabel = useMemo(() => {
    if (adGroupCount === 0) {
      return "Select ad groups";
    }
    if (adGroupCount === 1) {
      return `Ad group: ${adGroups[0]?.name ?? "Selected"}`;
    }
    return `${adGroupCount} ad groups selected`;
  }, [adGroupCount, adGroups]);

  const secondaryContent = useMemo(() => {
    const nodes: ReactNode[] = [];

    if (adGroupCount === 0) {
      nodes.push(
        <span className="text-muted-foreground text-xs" key="adgroups">
          Import Google Ads ad groups to ground keyword suggestions.
        </span>
      );
    } else {
      const previewNames = adGroups
        .slice(0, 3)
        .map((group) => group.name)
        .join(" • ");
      const overflow = adGroupCount - Math.min(3, adGroupCount);
      nodes.push(
        <span className="text-muted-foreground text-xs" key="adgroups">
          {previewNames}
          {overflow > 0 ? ` • +${overflow} more` : ""}
        </span>
      );
    }

    if (trimmedKeywords.length > 0) {
      nodes.push(
        <span
          className="flex flex-wrap items-center gap-1 text-muted-foreground text-xs"
          key="keywords"
        >
          {keywordPreview.map((value) => (
            <span
              className="rounded-full bg-muted px-2 py-0.5 text-foreground"
              key={value}
            >
              {value}
            </span>
          ))}
          {trimmedKeywords.length > keywordPreview.length ? (
            <span>+{trimmedKeywords.length - keywordPreview.length} more</span>
          ) : null}
        </span>
      );
    } else if (goalText.length > 0) {
      nodes.push(
        <span className="text-muted-foreground text-xs" key="goal">
          Goal noted. Add optional seed keywords.
        </span>
      );
    }

    if (nodes.length === 0) {
      nodes.push(
        <span className="text-muted-foreground text-xs" key="placeholder">
          Add context before running simulations.
        </span>
      );
    }

    return <div className="flex flex-col gap-1">{nodes}</div>;
  }, [
    adGroupCount,
    adGroups,
    goalText.length,
    keywordPreview,
    trimmedKeywords.length,
  ]);

  return (
    <>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            className="h-auto min-h-[32px] justify-start gap-2 px-2 py-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            type="button"
            variant="ghost"
          >
            <div className="flex flex-1 flex-col gap-1 text-left">
              <span className="text-sm">{selectedLabel}</span>
              {secondaryContent}
            </div>
            <Tag className="mr-1 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 space-y-2 p-2">
          <Button
            className="h-9 w-full justify-start px-3 text-left"
            onClick={() => {
              setOpen(false);
              setManualDialogOpen(true);
            }}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Tag className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Configure keywords</span>
          </Button>
          <Button
            className="h-9 w-full justify-start px-3 text-left"
            onClick={() => {
              setOpen(false);
              onAdGroupsImport();
            }}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Tag className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Import from Google Ads</span>
          </Button>

          {adGroupCount > 0 ? (
            <div className="rounded-md border border-dashed px-3 py-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">Selected ad groups</p>
                {importedAdGroupCount > 0 ? (
                  <Button
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      onClearAdGroups();
                      setOpen(false);
                    }}
                    type="button"
                    variant="ghost"
                  >
                    Clear imports
                  </Button>
                ) : null}
              </div>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {adGroups.slice(0, 5).map((group) => (
                  <li key={group.id}>
                    <span className="font-medium text-foreground">
                      {group.name}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      ({group.campaignName})
                    </span>
                  </li>
                ))}
              </ul>
              {adGroupCount > 5 ? (
                <p className="text-muted-foreground text-xs">
                  +{adGroupCount - 5} more
                </p>
              ) : null}
              {importedAdGroupCount === 0 ? (
                <p className="text-muted-foreground text-xs">
                  Manage manual ad groups from the manual entry dialog.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">
              No ad groups selected yet.
            </p>
          )}

          {goalText.length > 0 ? (
            <div className="rounded-md border border-dashed px-3 py-2 text-xs">
              <p className="font-medium">Goal</p>
              <p className="text-muted-foreground">{goalText}</p>
            </div>
          ) : null}

          {keywordPreview.length > 0 ? (
            <div className="rounded-md border border-dashed px-3 py-2 text-xs">
              <p className="font-medium">Keywords</p>
              <p className="text-muted-foreground">
                {keywordPreview.join(", ")}
                {trimmedKeywords.length > keywordPreview.length
                  ? `, +${trimmedKeywords.length - keywordPreview.length} more`
                  : ""}
              </p>
            </div>
          ) : null}

          {adGroupError ? (
            <p className="text-destructive text-xs">{adGroupError}</p>
          ) : null}
        </PopoverContent>
      </Popover>

      <ManualKeywordsDialog
        adGroupError={adGroupError ?? undefined}
        adGroups={manualAdGroups}
        goal={keywordGoal}
        keywords={manualKeywords}
        onAdGroupAdd={onManualAdGroupAdd}
        onAdGroupChange={onManualAdGroupChange}
        onAdGroupRemove={onManualAdGroupRemove}
        onAdGroupsClear={onManualAdGroupsClear}
        onGoalChange={onKeywordGoalChange}
        onKeywordAdd={onManualKeywordAdd}
        onKeywordChange={onManualKeywordChange}
        onKeywordRemove={onManualKeywordRemove}
        onKeywordsClear={() => {
          onManualKeywordsClear();
          setManualDialogOpen(false);
        }}
        onOpenChange={setManualDialogOpen}
        open={manualDialogOpen}
        validationError={null}
      />
    </>
  );
}
