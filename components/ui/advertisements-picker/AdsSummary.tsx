import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AdsSummaryProps {
  manualAdCount: number;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
}

export function AdsSummary({
  manualAdCount,
  selectedFiles,
  onRemoveFile,
}: AdsSummaryProps) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      {manualAdCount > 0 ? (
        <Badge className="w-fit gap-1 px-2 py-1 text-xs" variant="secondary">
          Manual ads ({manualAdCount})
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
              <button
                aria-label={`Remove ${file.name}`}
                className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemoveFile(index);
                }}
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        : null}

      {manualAdCount === 0 && selectedFiles.length === 0 ? (
        <span className="text-sm">Ads</span>
      ) : null}
    </div>
  );
}
