import { X } from "lucide-react";
import type {
  ManualKeywordAdGroupDraft,
  ManualKeywordDraft,
} from "@/app/product/simulation/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ManualKeywordsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keywords: ManualKeywordDraft[];
  onKeywordChange: (id: number, value: string) => void;
  onKeywordAdd: () => void;
  onKeywordRemove: (id: number) => void;
  onKeywordsClear: () => void;
  validationError?: string | null;
  goal: string;
  goalError?: string | null;
  onGoalChange: (value: string) => void;
  adGroups: ManualKeywordAdGroupDraft[];
  adGroupError?: string | null;
  onAdGroupChange: (
    id: number,
    field: "name" | "campaignName",
    value: string
  ) => void;
  onAdGroupAdd: () => void;
  onAdGroupRemove: (id: number) => void;
  onAdGroupsClear: () => void;
}

export function ManualKeywordsDialog({
  open,
  onOpenChange,
  keywords,
  onKeywordChange,
  onKeywordAdd,
  onKeywordRemove,
  onKeywordsClear,
  validationError,
  goal,
  goalError,
  onGoalChange,
  adGroups,
  adGroupError,
  onAdGroupChange,
  onAdGroupAdd,
  onAdGroupRemove,
  onAdGroupsClear,
}: ManualKeywordsDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-lg space-y-4">
        <DialogHeader>
          <DialogTitle>Manual keyword entry</DialogTitle>
          <DialogDescription>
            Provide seed keywords to guide the simulation. These can be single
            terms or short phrases.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="keyword-goal">Advertising goal</Label>
          <Input
            id="keyword-goal"
            onChange={(event) => onGoalChange(event.target.value)}
            placeholder="Describe the advertising goal personas should optimize for"
            value={goal}
          />
          <p className="text-muted-foreground text-xs">
            Optional. Leave blank to let personas inform the direction.
          </p>
          {goalError ? (
            <p className="text-destructive text-sm">{goalError}</p>
          ) : null}
        </div>

        <div className="space-y-3">
          {keywords.map((keyword, index) => (
            <div
              className="flex items-center gap-3 rounded-lg border border-border/60 p-3"
              key={keyword.id}
            >
              <div className="flex-1 space-y-1.5">
                <Label htmlFor={`manual-keyword-${keyword.id}`}>
                  Keyword {index + 1}
                </Label>
                <Input
                  id={`manual-keyword-${keyword.id}`}
                  onChange={(event) =>
                    onKeywordChange(keyword.id, event.target.value)
                  }
                  placeholder="e.g., eco-friendly commuter bike"
                  value={keyword.value}
                />
              </div>
              {keywords.length > 1 ? (
                <Button
                  aria-label="Remove keyword"
                  onClick={() => onKeywordRemove(keyword.id)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          ))}
        </div>

        {validationError ? (
          <p className="text-destructive text-sm">{validationError}</p>
        ) : null}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Manual ad groups</Label>
            <div className="flex items-center gap-2">
              <Button onClick={onAdGroupAdd} type="button" variant="outline">
                Add ad group
              </Button>
              <Button onClick={onAdGroupsClear} type="button" variant="ghost">
                Clear ad groups
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            Provide ad group names (and optional campaign labels) if you are not
            importing them from Google Ads.
          </p>
          {adGroups.map((adGroup, index) => (
            <div
              className="space-y-3 rounded-lg border border-border/60 p-3"
              key={adGroup.id}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
                  Ad group {index + 1}
                </span>
                {adGroups.length > 1 ? (
                  <Button
                    aria-label="Remove ad group"
                    onClick={() => onAdGroupRemove(adGroup.id)}
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
                  <Label htmlFor={`manual-adgroup-${adGroup.id}-name`}>
                    Ad group name
                  </Label>
                  <Input
                    id={`manual-adgroup-${adGroup.id}-name`}
                    onChange={(event) =>
                      onAdGroupChange(adGroup.id, "name", event.target.value)
                    }
                    placeholder="e.g., Eco-friendly commuters"
                    value={adGroup.name}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`manual-adgroup-${adGroup.id}-campaign`}>
                    Campaign label (optional)
                  </Label>
                  <Input
                    id={`manual-adgroup-${adGroup.id}-campaign`}
                    onChange={(event) =>
                      onAdGroupChange(
                        adGroup.id,
                        "campaignName",
                        event.target.value
                      )
                    }
                    placeholder="e.g., Summer launch"
                    value={adGroup.campaignName}
                  />
                </div>
              </div>
            </div>
          ))}
          {adGroupError ? (
            <p className="text-destructive text-sm">{adGroupError}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button onClick={onKeywordAdd} type="button" variant="outline">
              Add keyword
            </Button>
            <Button onClick={onKeywordsClear} type="button" variant="ghost">
              Clear all
            </Button>
          </div>
          <Button onClick={() => onOpenChange(false)} type="button">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
