"use client";

import { Paperclip, X } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      setSelectedFiles(prev => [...prev, ...newFiles]);
      onFilesChange?.(files);
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
      <Button
        variant="ghost"
        onClick={handleAttachFilesClick}
        className="h-auto min-h-[32px] px-2 py-1 justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedFiles.length === 0 ? (
            <span className="text-sm">Attachements</span>
          ) : (
            selectedFiles.map((file, index) => (
              <Badge
                key={`${file.name}-${index}`}
                variant="outline"
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
        <Paperclip className="h-4 w-4 shrink-0 opacity-50 ml-2" />
      </Button>
      
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
