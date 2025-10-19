"use client";

import { ChevronDown, ExternalLink, Paperclip, X, Megaphone } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AdvertisementsPickerProps {
  onGoogleAdsClick?: () => void;
  onMetaAdsClick?: () => void;
  onAttachFilesClick?: (files: FileList | null) => void;
  className?: string;
}

export function AdvertisementsPicker({
  onGoogleAdsClick,
  onMetaAdsClick,
  onAttachFilesClick,
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
      setSelectedFiles(prev => [...prev, ...newFiles]);
      onAttachFilesClick?.(files);
    }
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            className="h-auto min-h-[32px] px-2 py-1 justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {selectedFiles.length === 0 ? (
                <span className="text-sm">Ads</span>
              ) : (
                selectedFiles.map((file, index) => (
                  <Badge
                    key={`${file.name}-${index}`}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1 text-xs"
                  >
                    <span className="truncate max-w-[120px]">
                      {file.name}
                    </span>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </div>
                  </Badge>
                ))
              )}
            </div>
            <Megaphone className="h-4 w-4 shrink-0 opacity-50 mr-1" />
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-1" align="start">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onGoogleAdsClick}
              className="w-full justify-start text-left h-9 px-3"
            >
              <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm">From Google Ads</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMetaAdsClick}
              className="w-full justify-start text-left h-9 px-3"
            >
              <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm">From Meta Ads</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAttachFilesClick}
              className="w-full justify-start text-left h-9 px-3"
            >
              <Paperclip className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm">Attach Files</span>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
