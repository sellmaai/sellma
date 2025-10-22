"use client";

import { ChevronDown, ExternalLink, Megaphone, Paperclip } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ManualAdDraft } from "@/app/product/simulation/types";
import { Button } from "@/components/ui/button";
import type { AdGroup } from "@/components/ui/campaign-ad-group-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AdsSummary } from "./AdsSummary";
import { ManualAdsDialog } from "./ManualAdsDialog";

interface AdvertisementsPickerProps {
  onGoogleAdsClick?: () => void;
  onAttachFilesClick?: (files: FileList | null) => void;
  onFileCountChange?: (count: number) => void;
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
  manualValidationError?: string | null;
  hasIncompleteManualAds?: boolean;
  selectedAdGroups?: AdGroup[];
  onRemoveAdGroups?: () => void;
  className?: string;
}

export function AdvertisementsPicker({
  onGoogleAdsClick,
  onFileCountChange,
  manualAds,
  manualAdCount,
  onManualAdChange,
  onManualAdAdd,
  onManualAdRemove,
  onManualAdsClear,
  manualValidationError,
  hasIncompleteManualAds,
  selectedAdGroups = [],
  onRemoveAdGroups,
  className,
}: AdvertisementsPickerProps) {
  const [open, setOpen] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachFilesClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setSelectedFiles((prev: File[]) => [...prev, ...newFiles]);
      // Avoid double-calling upstream handler; parent can react via onFileCountChange
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    onFileCountChange?.(selectedFiles.length);
  }, [selectedFiles.length, onFileCountChange]);

  return (
    <div className={className}>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className="h-auto min-h-[32px] justify-start px-2 py-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            role="combobox"
            variant="ghost"
          >
            <AdsSummary
              manualAdCount={manualAdCount}
              onRemoveAdGroups={onRemoveAdGroups}
              onRemoveFile={handleRemoveFile}
              selectedAdGroups={selectedAdGroups}
              selectedFiles={selectedFiles}
            />
            <Megaphone className="mr-1 h-4 w-4 shrink-0 opacity-50" />
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 space-y-1 p-1">
          <Button
            className="h-9 w-full justify-start px-3 text-left"
            onClick={() => {
              setShowManualDialog(true);
              setOpen(false);
            }}
            size="sm"
            variant="ghost"
          >
            <Megaphone className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Manual entry</span>
          </Button>
          <Button
            className="h-9 w-full justify-start px-3 text-left"
            onClick={onGoogleAdsClick}
            size="sm"
            variant="ghost"
          >
            <ExternalLink className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="text-sm">From Google Ads</span>
          </Button>
          {/* <Button
            className="h-9 w-full justify-start px-3 text-left"
            onClick={onMetaAdsClick}
            size="sm"
            variant="ghost"
          >
            <ExternalLink className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="text-sm">From Meta Ads</span>
          </Button> */}
          <Button
            className="h-9 w-full justify-start px-3 text-left"
            onClick={handleAttachFilesClick}
            size="sm"
            variant="ghost"
          >
            <Paperclip className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Attach Ad Files</span>
          </Button>
        </PopoverContent>
      </Popover>

      <input
        accept="image/*,.pdf,.doc,.docx,.txt"
        className="hidden"
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        type="file"
      />

      <ManualAdsDialog
        hasIncompleteManualAds={hasIncompleteManualAds}
        manualAds={manualAds}
        manualValidationError={manualValidationError}
        onManualAdAdd={onManualAdAdd}
        onManualAdChange={onManualAdChange}
        onManualAdRemove={onManualAdRemove}
        onManualAdsClear={() => {
          onManualAdsClear();
          setShowManualDialog(false);
        }}
        onOpenChange={setShowManualDialog}
        open={showManualDialog}
      />
    </div>
  );
}
