"use client";

import { ChevronDown, ExternalLink, Users, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface Audience {
  id: string;
  name: string;
  source: "google-ads" | "meta-ads" | "saved";
  count?: number;
}

interface AudiencePickerProps {
  selectedAudiences: Audience[];
  onAudiencesChange: (audiences: Audience[]) => void;
  placeholder?: string;
  className?: string;
  onGoogleAdsClick?: () => void;
  onMetaAdsClick?: () => void;
}

export function AudiencePicker({
  selectedAudiences,
  onAudiencesChange,
  placeholder = "Select audiences...",
  className,
  onGoogleAdsClick,
  onMetaAdsClick,
}: AudiencePickerProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSelect = (audience: Audience) => {
    const isSelected = selectedAudiences.some((a) => a.id === audience.id);

    if (isSelected) {
      onAudiencesChange(selectedAudiences.filter((a) => a.id !== audience.id));
    } else {
      onAudiencesChange([...selectedAudiences, audience]);
    }
  };

  const handleRemove = (audienceId: string) => {
    onAudiencesChange(selectedAudiences.filter((a) => a.id !== audienceId));
  };

  const getAudienceDisplayName = (audience: Audience) => {
    if (audience.source === "google-ads") {
      return `Google Ads Audience (${audience.count || 0})`;
    }
    if (audience.source === "meta-ads") {
      return `Meta Ads Audience (${audience.count || 0})`;
    }
    return audience.name;
  };

  const getAudienceBadgeVariant = (source: Audience["source"]) => {
    switch (source) {
      case "google-ads":
        return "default";
      case "meta-ads":
        return "secondary";
      case "saved":
        return "outline";
      default:
        return "default";
    }
  };

  // Mock data for now - will be replaced with real data in later phases
  const mockAudiences: Audience[] = [
    { id: "1", name: "High-value customers", source: "saved" },
    { id: "2", name: "Lookalike audience", source: "saved" },
    { id: "3", name: "Retargeting list", source: "saved" },
    { id: "4", name: "Email subscribers", source: "saved" },
    { id: "5", name: "Cart abandoners", source: "saved" },
  ];

  const filteredAudiences = mockAudiences.filter((audience) =>
    audience.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className={cn("w-full", className)}>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className="h-auto min-h-[32px] justify-start px-2 py-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            role="combobox"
            variant="ghost"
          >
            <div className="flex flex-1 flex-wrap gap-1">
              {selectedAudiences.length === 0 ? (
                <span className="text-sm">{placeholder}</span>
              ) : (
                selectedAudiences.map((audience) => (
                  <Badge
                    className="flex items-center gap-1 px-2 py-1 text-xs"
                    key={audience.id}
                    variant={getAudienceBadgeVariant(audience.source)}
                  >
                    <span>{getAudienceDisplayName(audience)}</span>
                    <button
                      aria-label={`Remove ${getAudienceDisplayName(audience)}`}
                      className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(audience.id);
                      }}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
            <Users className="mr-1 h-4 w-4 shrink-0 opacity-50" />
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-96 p-0">
          <Command>
            <CommandInput
              onValueChange={setSearchValue}
              placeholder="Search audiences..."
              value={searchValue}
            />
            <CommandList>
              <CommandEmpty>No audiences found.</CommandEmpty>

              {/* External Sources Section */}
              <div className="p-3">
                <h4 className="mb-2 font-medium text-muted-foreground text-sm">
                  External Sources
                </h4>
                <div className="flex gap-3">
                  <Button
                    className="min-h-[40px] flex-1 justify-center px-3 text-center"
                    onClick={onGoogleAdsClick}
                    size="sm"
                    variant="outline"
                  >
                    <ExternalLink className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="font-medium text-xs">Google Ads</span>
                  </Button>
                  <Button
                    className="min-h-[40px] flex-1 justify-center px-3 text-center"
                    onClick={onMetaAdsClick}
                    size="sm"
                    variant="outline"
                  >
                    <ExternalLink className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="font-medium text-xs">Meta Ads</span>
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Saved Audiences Section */}
              <CommandGroup heading="Saved Audiences">
                {filteredAudiences.map((audience) => (
                  <CommandItem
                    className="flex items-center justify-between"
                    key={audience.id}
                    onSelect={() => handleSelect(audience)}
                    value={audience.name}
                  >
                    <span>{audience.name}</span>
                    {selectedAudiences.some((a) => a.id === audience.id) && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
