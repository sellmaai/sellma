"use client";

import { Megaphone, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import type {
  ManualAdDraft,
  ManualKeywordDraft,
  SimulationKind,
} from "@/app/product/simulation/audience-builder/types";
import { ManualAdsDialog } from "@/components/ui/advertisements-picker/ManualAdsDialog";
import { Button } from "@/components/ui/button";
import { ManualKeywordsDialog } from "@/components/ui/keywords-picker/ManualKeywordsDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SimulationContentPickerProps {
  simulationKind: SimulationKind;
  onSimulationKindChange: (kind: SimulationKind) => void;
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
  manualKeywords: ManualKeywordDraft[];
  keywordGoal: string;
  keywordGoalError: string | null;
  onManualKeywordChange: (id: number, value: string) => void;
  onManualKeywordAdd: () => void;
  onManualKeywordRemove: (id: number) => void;
  onManualKeywordsClear: () => void;
  onKeywordGoalChange: (value: string) => void;
}

export function SimulationContentPicker({
  simulationKind,
  onSimulationKindChange,
  manualAds,
  manualAdCount,
  onManualAdChange,
  onManualAdAdd,
  onManualAdRemove,
  onManualAdsClear,
  manualValidationError,
  hasIncompleteManualAds,
  manualKeywords,
  keywordGoal,
  keywordGoalError,
  onManualKeywordChange,
  onManualKeywordAdd,
  onManualKeywordRemove,
  onManualKeywordsClear,
  onKeywordGoalChange,
}: SimulationContentPickerProps) {
  const [open, setOpen] = useState(false);
  const [showAdsDialog, setShowAdsDialog] = useState(false);
  const [showKeywordsDialog, setShowKeywordsDialog] = useState(false);

  const totalKeywordCount = useMemo(
    () => manualKeywords.filter((item) => item.value.trim().length > 0).length,
    [manualKeywords]
  );

  const selectedLabel = useMemo(() => {
    if (simulationKind === "ads") {
      if (manualAdCount === 0) {
        return "Configure ad reactions";
      }
      if (manualAdCount === 1) {
        return "1 ad ready";
      }
      return `${manualAdCount} ads ready`;
    }
    if (totalKeywordCount === 0) {
      return "Configure keyword strategy";
    }
    if (totalKeywordCount === 1) {
      return "1 keyword ready";
    }
    return `${totalKeywordCount} keywords ready`;
  }, [manualAdCount, simulationKind, totalKeywordCount]);

  const secondaryContent = useMemo(() => {
    if (simulationKind === "ads") {
      if (manualAdCount === 0) {
        return (
          <span className="text-muted-foreground text-xs">
            Add manual ad variants for the simulation.
          </span>
        );
      }
      const previews = manualAds
        .filter(
          (ad) =>
            ad.headline.trim().length > 0 || ad.description.trim().length > 0
        )
        .slice(0, 2)
        .map((ad) =>
          ad.headline.trim().length > 0
            ? ad.headline.trim()
            : ad.description.trim()
        );
      if (previews.length === 0) {
        return (
          <span className="text-muted-foreground text-xs">
            Add manual ad variants for the simulation.
          </span>
        );
      }
      return (
        <span className="text-muted-foreground text-xs">
          {previews.join(" • ")}
          {manualAdCount > previews.length ? " • …" : null}
        </span>
      );
    }

    if (totalKeywordCount === 0) {
      return (
        <span className="text-muted-foreground text-xs">
          Add seed keywords (optional) and describe the goal.
        </span>
      );
    }

    const previewPills = manualKeywords
      .map((item) => item.value.trim())
      .filter((value) => value.length > 0)
      .slice(0, 3);

    return (
      <span className="flex flex-wrap items-center gap-1 text-muted-foreground text-xs">
        {previewPills.map((value) => (
          <span
            className="rounded-full bg-muted px-2 py-0.5 text-foreground text-xs"
            key={value}
          >
            {value}
          </span>
        ))}
        {totalKeywordCount > previewPills.length ? (
          <span>+{totalKeywordCount - previewPills.length} more</span>
        ) : null}
      </span>
    );
  }, [
    manualAdCount,
    manualAds,
    manualKeywords,
    simulationKind,
    totalKeywordCount,
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
            {simulationKind === "ads" ? (
              <Megaphone className="mr-1 h-4 w-4 shrink-0 opacity-50" />
            ) : (
              <Tag className="mr-1 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 space-y-1 p-2">
          <Button
            className="h-9 w-full justify-start px-3 text-left"
            onClick={() => {
              setOpen(false);
              onSimulationKindChange("ads");
              setShowAdsDialog(true);
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
            onClick={() => {
              setOpen(false);
              onSimulationKindChange("keywords");
              setShowKeywordsDialog(true);
            }}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Tag className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Configure keywords</span>
          </Button>
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
          setShowAdsDialog(false);
        }}
        onOpenChange={setShowAdsDialog}
        open={showAdsDialog}
      />

      <ManualKeywordsDialog
        goal={keywordGoal}
        goalError={keywordGoalError}
        keywords={manualKeywords}
        onGoalChange={onKeywordGoalChange}
        onKeywordAdd={onManualKeywordAdd}
        onKeywordChange={onManualKeywordChange}
        onKeywordRemove={onManualKeywordRemove}
        onKeywordsClear={() => {
          onManualKeywordsClear();
          setShowKeywordsDialog(false);
        }}
        onOpenChange={setShowKeywordsDialog}
        open={showKeywordsDialog}
        validationError={null}
      />
    </>
  );
}
