import { Tag } from "lucide-react";
import { useMemo, useState } from "react";
import type { ManualKeywordDraft } from "@/app/product/simulation/audience-builder/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ManualKeywordsDialog } from "./ManualKeywordsDialog";

interface KeywordsPickerProps {
  keywords: ManualKeywordDraft[];
  onKeywordChange: (id: number, value: string) => void;
  onKeywordAdd: () => void;
  onKeywordRemove: (id: number) => void;
  onKeywordsClear: () => void;
  validationError?: string | null;
  className?: string;
  goal?: string;
  goalError?: string | null;
  onGoalChange?: (value: string) => void;
}

export function KeywordsPicker({
  keywords,
  onKeywordChange,
  onKeywordAdd,
  onKeywordRemove,
  onKeywordsClear,
  validationError,
  className,
  goal,
  goalError,
  onGoalChange,
}: KeywordsPickerProps) {
  const [open, setOpen] = useState(false);
  const [internalGoal, setInternalGoal] = useState("");

  const summary = useMemo(() => {
    const nonEmpty = keywords.filter(
      (keyword) => keyword.value.trim().length > 0
    );
    if (nonEmpty.length === 0) {
      return "Add keywords manually";
    }
    if (nonEmpty.length === 1) {
      return "1 keyword added";
    }
    return `${nonEmpty.length} keywords added`;
  }, [keywords]);

  const previewKeywords = useMemo(
    () =>
      keywords
        .map((keyword) => keyword.value.trim())
        .filter((keyword) => keyword.length > 0)
        .slice(0, 3),
    [keywords]
  );

  return (
    <div className={cn("w-full", className)}>
      <Button
        className="h-auto min-h-[32px] justify-start gap-2 px-2 py-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        onClick={() => setOpen(true)}
        type="button"
        variant="ghost"
      >
        <div className="flex flex-1 flex-col gap-1 text-left">
          <span className="text-sm">{summary}</span>
          {previewKeywords.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {previewKeywords.map((keyword) => (
                <Badge className="font-medium text-xs" key={keyword}>
                  {keyword}
                </Badge>
              ))}
              {keywords.filter((item) => item.value.trim()).length >
              previewKeywords.length ? (
                <span className="text-muted-foreground text-xs">
                  +
                  {keywords.filter((item) => item.value.trim()).length -
                    previewKeywords.length}{" "}
                  more
                </span>
              ) : null}
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">
              Provide seed keywords to steer the recommendations.
            </span>
          )}
        </div>
        <Tag className="mr-1 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      <ManualKeywordsDialog
        goal={goal ?? internalGoal}
        goalError={goalError}
        keywords={keywords}
        onGoalChange={(value) => {
          if (onGoalChange) {
            onGoalChange(value);
          } else {
            setInternalGoal(value);
          }
        }}
        onKeywordAdd={onKeywordAdd}
        onKeywordChange={onKeywordChange}
        onKeywordRemove={onKeywordRemove}
        onKeywordsClear={() => {
          onKeywordsClear();
          if (!onGoalChange) {
            setInternalGoal("");
          }
          setOpen(false);
        }}
        onOpenChange={setOpen}
        open={open}
        validationError={validationError}
      />
    </div>
  );
}
