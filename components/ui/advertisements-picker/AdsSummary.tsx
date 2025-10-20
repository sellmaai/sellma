import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AdGroup } from "@/components/ui/campaign-ad-group-picker";

interface AdsSummaryProps {
  manualAdCount: number;
  selectedFiles: File[];
  selectedAdGroups?: AdGroup[];
  onRemoveFile: (index: number) => void;
  onRemoveAdGroups?: () => void;
}

export function AdsSummary({
  manualAdCount,
  selectedFiles,
  selectedAdGroups = [],
  onRemoveFile,
  onRemoveAdGroups,
}: AdsSummaryProps) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      {manualAdCount > 0 ? (
        <Badge className="w-fit gap-1 px-2 py-1 text-xs" variant="secondary">
          Manual ads ({manualAdCount})
        </Badge>
      ) : null}

      {selectedAdGroups.length > 0 ? (
        <Badge className="flex w-fit items-center gap-1 px-2 py-1 text-xs" variant="secondary">
          <span>Google Ads ({selectedAdGroups.length} Ad Groups)</span>
          {onRemoveAdGroups && (
            <div
              aria-label="Remove Google Ads ad groups"
              className="ml-1 cursor-pointer rounded-full p-0.5 hover:bg-destructive/20"
              onClick={(event) => {
                event.stopPropagation();
                onRemoveAdGroups();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onRemoveAdGroups();
                }
              }}
              role="button"
              tabIndex={0}
            >
              <X className="h-3 w-3" />
            </div>
          )}
        </Badge>
      ) : null}

      {selectedFiles.length > 0
        ? selectedFiles.map((file, index) => (
            <Badge
              className="flex items-center gap-1 px-2 py-1 text-xs"
              key={`${file.name}-${index}`}
              variant="secondary"
            >
              <span className="max-w-[120px] truncate">{file.name}</span>
              <div
                aria-label={`Remove ${file.name}`}
                className="ml-1 cursor-pointer rounded-full p-0.5 hover:bg-destructive/20"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemoveFile(index);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    onRemoveFile(index);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <X className="h-3 w-3" />
              </div>
            </Badge>
          ))
        : null}

      {manualAdCount === 0 && selectedFiles.length === 0 && selectedAdGroups.length === 0 ? (
        <span className="text-sm">Ads</span>
      ) : null}
    </div>
  );
}
