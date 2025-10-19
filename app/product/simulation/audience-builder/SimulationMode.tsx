"use client";

import { Send, CornerDownLeft } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AudiencePicker, type Audience } from "@/components/ui/audience-picker";
import { AdvertisementsPicker } from "@/components/ui/advertisements-picker";
import { AttachFilesPicker } from "@/components/ui/attach-files-picker";
import { cn } from "@/lib/utils";

interface SimulationModeProps {
  onSubmit: (message: string) => void;
  isPending: boolean;
  error: string | null;
}

export function SimulationMode({ onSubmit, isPending, error }: SimulationModeProps) {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAudiences, setSelectedAudiences] = useState<Audience[]>([]);
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
    // TODO: Implement Google Ads integration
    console.log("Google Ads clicked");
  };

  const handleMetaAdsClick = () => {
    // TODO: Implement Meta Ads integration
    console.log("Meta Ads clicked");
  };

  const handleAttachFilesClick = (files: FileList | null) => {
    if (files && files.length > 0) {
      console.log("Files selected:", Array.from(files).map(file => file.name));
      // TODO: Implement file processing/upload logic
    }
  };

  const handleFilesChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      console.log("Files attached:", Array.from(files).map(file => file.name));
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

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    setIsExpanded(e.target.value.length > 100 || e.target.value.includes("\n"));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <form className="group/composer w-full" onSubmit={handleSubmit}>
        <div
          className={cn(
            "mx-auto w-full max-w-2xl cursor-text overflow-clip border border-border bg-transparent bg-clip-padding p-2.5 shadow-lg transition-all duration-200 dark:bg-muted/50",
            {
              "grid grid-cols-1 grid-rows-[auto_1fr_auto] rounded-3xl":
                isExpanded,
              "grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] rounded-[28px]":
                !isExpanded,
            }
          )}
          style={{
            gridTemplateAreas: isExpanded
              ? "'header' 'primary' 'footer'"
              : "'header header header' 'leading primary trailing' '. footer .'",
          }}
        >
          <div
            className={cn(
              "flex min-h-20 items-start overflow-x-hidden px-1.5 relative",
              {
                "mb-0 px-2 py-1": isExpanded,
                "-my-2.5": !isExpanded,
              }
            )}
            style={{ gridArea: "primary" }}
          >
            <div className="max-h-52 flex-1 overflow-auto">
              <Textarea
                className="scrollbar-thin min-h-0 resize-none rounded-none border-0 pt-3 px-0 pb-12 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent"
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Type in what you want to ask your selected audiences..."
                ref={textareaRef}
                rows={3}
                value={message}
              />
              
              {/* Audience Picker, Advertisements, and Attach Files - positioned at bottom */}
              <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                <div className="flex-1">
                  <AudiencePicker
                    selectedAudiences={selectedAudiences}
                    onAudiencesChange={setSelectedAudiences}
                    onGoogleAdsClick={handleGoogleAdsClick}
                    onMetaAdsClick={handleMetaAdsClick}
                    placeholder="Audiences"
                  />
                </div>
                <AdvertisementsPicker
                  onGoogleAdsClick={handleGoogleAdsClick}
                  onMetaAdsClick={handleMetaAdsClick}
                  onAttachFilesClick={handleAttachFilesClick}
                />
                <AttachFilesPicker
                  onFilesChange={handleFilesChange}
                />
              </div>
            </div>
          </div>
          <div
            className="flex items-center gap-2"
            style={{ gridArea: isExpanded ? "footer" : "trailing" }}
          >
            <div className="ms-auto flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      className="h-9 w-9 rounded-full"
                      disabled={isPending || !message.trim() || selectedAudiences.length === 0}
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
