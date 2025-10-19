"use client";

import { Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AttachFilesPickerProps {
  onFilesChange?: (files: FileList | null) => void;
  className?: string;
}

export function AttachFilesPicker({
  onFilesChange,
  className,
}: AttachFilesPickerProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachFilesClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      onFilesChange?.(files);
    }
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={className}>
      <Button
        className="h-auto min-h-[32px] justify-start px-2 py-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        onClick={handleAttachFilesClick}
        variant="ghost"
      >
        <div className="flex flex-1 flex-wrap gap-1">
          {selectedFiles.length === 0 ? (
            <span className="text-sm">Attachements</span>
          ) : (
            selectedFiles.map((file, index) => (
              <Badge
                className="flex items-center gap-1 px-2 py-1 text-xs"
                key={`${file.name}-${index}`}
                variant="outline"
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
        <Paperclip className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

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
