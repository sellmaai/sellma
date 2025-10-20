"use client";

import {
  ChevronDown,
  ExternalLink,
  Megaphone,
  Paperclip,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "./badge";

interface AdvertisementsPickerProps {
  onGoogleAdsClick?: () => void;
  onMetaAdsClick?: () => void;
  onAttachFilesClick?: (files: FileList | null) => void;
  onFileCountChange?: (count: number) => void;
  onManualEntryClick?: () => void;
  className?: string;
}

export function AdvertisementsPicker({
  onGoogleAdsClick,
  onMetaAdsClick,
  onFileCountChange,
  onManualEntryClick,
  className,
}: AdvertisementsPickerProps) {
  const [open, setOpen] = useState(false);
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
      // Don't call onAttachFilesClick here to avoid duplication
    }
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev: File[]) =>
      prev.filter((_: File, i: number) => i !== index)
    );
  };

  // Notify parent when file count changes
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
            <div className="flex flex-1 flex-col gap-1">
              {selectedFiles.length === 0 ? (
                <span className="text-sm">Ads</span>
              ) : (
                selectedFiles.map((file, index) => (
                  <Badge
                    className="flex items-center gap-1 px-2 py-1 text-xs"
                    key={`${file.name}-${index}`}
                    variant="secondary"
                  >
                    <span className="max-w-[120px] truncate">{file.name}</span>
                    <button
                      aria-label={`Remove ${file.name}`}
                      className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
            <Megaphone className="mr-1 h-4 w-4 shrink-0 opacity-50" />
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-1">
          <div className="space-y-1">
            <Button
              className="h-9 w-full justify-start px-3 text-left"
              onClick={() => {
                onManualEntryClick?.();
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
            <Button
              className="h-9 w-full justify-start px-3 text-left"
              onClick={onMetaAdsClick}
              size="sm"
              variant="ghost"
            >
              <ExternalLink className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="text-sm">From Meta Ads</span>
            </Button>
            <Button
              className="h-9 w-full justify-start px-3 text-left"
              onClick={handleAttachFilesClick}
              size="sm"
              variant="ghost"
            >
              <Paperclip className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="text-sm">Attach Ad Files</span>
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Hidden file input */}
      <input
        accept="image/*,.pdf,.doc,.docx,.txt"
        className="hidden"
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        type="file"
      />
    </div>
  );
}
