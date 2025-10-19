"use client";

import { CornerDownLeft, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AdvertisementsPicker } from "@/components/ui/advertisements-picker";
import { AttachFilesPicker } from "@/components/ui/attach-files-picker";
import { type Audience, AudiencePicker } from "@/components/ui/audience-picker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

interface SimulationModeProps {
  onSubmit: (message: string) => void;
  isPending: boolean;
  error: string | null;
}

export function SimulationMode({
  onSubmit,
  isPending,
  error,
}: SimulationModeProps) {
  const [message, setMessage] = useState("");
  const [, setIsExpanded] = useState(false);
  const [selectedAudiences, setSelectedAudiences] = useState<Audience[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [advertisementFileCount, setAdvertisementFileCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || selectedAudiences.length === 0) {
      return;
    }
    onSubmit(message);
    setMessage("");
    setIsExpanded(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleGoogleAdsClick = () => {
    // TODO: Integrate Google Ads audience import.
  };

  const handleMetaAdsClick = () => {
    // TODO: Integrate Meta Ads audience import.
  };

  const handleAttachFilesClick = (files: FileList | null) => {
    if (files && files.length > 0) {
      // TODO: Implement file processing/upload logic
    }
  };

  const getTooltipText = () => {
    if (selectedAudiences.length === 0) {
      return "Please select at least one audience";
    }
    if (!message.trim()) {
      return "Please enter your question";
    }
    return "Send message";
  };

  // Calculate total number of pills
  const totalPills =
    selectedAudiences.length + attachedFiles.length + advertisementFileCount;

  // Determine if textarea should be expanded based on content or pills
  const shouldExpand =
    message.length > 100 || message.includes("\n") || totalPills > 0;

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    setIsExpanded(shouldExpand);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Update expansion state when pills change
  useEffect(() => {
    setIsExpanded(shouldExpand);
  }, [shouldExpand]);

  return (
    <TooltipProvider delayDuration={300}>
      <form className="group/composer w-full" onSubmit={handleSubmit}>
        <div
          className={cn(
            "mx-auto w-full max-w-2xl cursor-text overflow-clip border border-border bg-transparent bg-clip-padding p-2.5 shadow-lg transition-all duration-200 dark:bg-muted/50",
            {
              "grid grid-cols-1 grid-rows-[auto_1fr_auto] rounded-3xl":
                shouldExpand,
              "grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] rounded-[28px]":
                !shouldExpand,
            }
          )}
          style={{
            gridTemplateAreas: shouldExpand
              ? "'header' 'primary' 'footer'"
              : "'header header header' 'leading primary trailing' '. footer .'",
          }}
        >
          <div
            className={cn(
              "relative flex min-h-20 items-start overflow-x-hidden px-1.5",
              {
                "mb-0 px-2 py-1": shouldExpand,
                "-my-2.5": !shouldExpand,
              }
            )}
            style={{ gridArea: "primary" }}
          >
            <div className="max-h-52 flex-1 overflow-auto">
              <Textarea
                className="scrollbar-thin min-h-0 resize-none rounded-none border-0 px-0 pt-3 pb-12 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent"
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Type in what you want to ask your selected audiences..."
                ref={textareaRef}
                rows={3}
                value={message}
              />

              {/* Audience Picker, Advertisements, and Attach Files - positioned at bottom */}
              <div className="absolute right-2 bottom-2 left-2 flex gap-2">
                <div className="flex-1">
                  <AudiencePicker
                    onAudiencesChange={setSelectedAudiences}
                    onGoogleAdsClick={handleGoogleAdsClick}
                    onMetaAdsClick={handleMetaAdsClick}
                    placeholder="Audiences"
                    selectedAudiences={selectedAudiences}
                  />
                </div>
                <AdvertisementsPicker
                  onAttachFilesClick={handleAttachFilesClick}
                  onFileCountChange={setAdvertisementFileCount}
                  onGoogleAdsClick={handleGoogleAdsClick}
                  onMetaAdsClick={handleMetaAdsClick}
                />
                <AttachFilesPicker
                  onSelectedFilesChange={setAttachedFiles}
                  selectedFiles={attachedFiles}
                />
              </div>
            </div>
          </div>
          <div
            className="flex items-center gap-2"
            style={{ gridArea: shouldExpand ? "footer" : "trailing" }}
          >
            <div className="ms-auto flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      className="h-9 w-9 rounded-full"
                      disabled={
                        isPending ||
                        !message.trim() ||
                        selectedAudiences.length === 0
                      }
                      size="icon"
                      type="submit"
                    >
                      {message.trim() ? (
                        <Send className="size-5" />
                      ) : (
                        <CornerDownLeft className="size-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getTooltipText()}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </form>

      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
    </TooltipProvider>
  );
}
