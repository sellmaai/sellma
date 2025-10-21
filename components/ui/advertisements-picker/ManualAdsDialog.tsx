import { X } from "lucide-react";
import type { ManualAdDraft } from "@/app/product/simulation/types";
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
import { Textarea } from "@/components/ui/textarea";

interface ManualAdsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manualAds: ManualAdDraft[];
  manualValidationError?: string | null;
  hasIncompleteManualAds?: boolean;
  onManualAdChange: (
    id: number,
    field: "headline" | "description",
    value: string
  ) => void;
  onManualAdAdd: () => void;
  onManualAdRemove: (id: number) => void;
  onManualAdsClear: () => void;
}

export function ManualAdsDialog({
  open,
  onOpenChange,
  manualAds,
  manualValidationError,
  hasIncompleteManualAds,
  onManualAdChange,
  onManualAdAdd,
  onManualAdRemove,
  onManualAdsClear,
}: ManualAdsDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl space-y-4">
        <DialogHeader>
          <DialogTitle>Manual ad entry</DialogTitle>
          <DialogDescription>
            Provide custom headlines and descriptions you want personas to react
            to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {manualAds.map((ad, index) => (
            <div
              className="space-y-3 rounded-xl border border-border/60 p-4"
              key={ad.id}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                  Ad {index + 1}
                </span>
                {manualAds.length > 1 ? (
                  <Button
                    onClick={() => onManualAdRemove(ad.id)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`manual-ad-${ad.id}-headline`}>
                    Headline
                  </Label>
                  <Input
                    id={`manual-ad-${ad.id}-headline`}
                    onChange={(event) =>
                      onManualAdChange(ad.id, "headline", event.target.value)
                    }
                    placeholder="Enter an attention-grabbing headline"
                    value={ad.headline}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`manual-ad-${ad.id}-description`}>
                    Description
                  </Label>
                  <Textarea
                    className="min-h-[90px]"
                    id={`manual-ad-${ad.id}-description`}
                    onChange={(event) =>
                      onManualAdChange(ad.id, "description", event.target.value)
                    }
                    placeholder="Add supporting copy that explains the offer"
                    value={ad.description}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {(() => {
          if (manualValidationError) {
            return (
              <p className="text-destructive text-sm">
                {manualValidationError}
              </p>
            );
          }
          if (hasIncompleteManualAds) {
            return (
              <p className="text-muted-foreground text-sm">
                Finish filling in every headline and description to run the
                simulation.
              </p>
            );
          }
          return null;
        })()}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button onClick={onManualAdAdd} type="button" variant="outline">
              Add ad
            </Button>
            <Button onClick={onManualAdsClear} type="button" variant="ghost">
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
