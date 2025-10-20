"use client";

import { ChevronDown, ExternalLink, Loader2, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { useInfiniteAudiences } from "@/hooks/use-infinite-audiences";
import { cn } from "@/lib/utils";

export interface Audience {
  id: string;
  name: string;
  source: "google-ads" | "meta-ads" | "saved";
  count?: number;
  audienceId?: string;
}

interface AudiencePickerProps {
  selectedAudiences: Audience[];
  onAudiencesChange: (audiences: Audience[]) => void;
  placeholder?: string;
  className?: string;
  onGoogleAdsClick?: () => void;
  onMetaAdsClick?: () => void;
  selectedAdGroupsCount?: number;
  onAdGroupsClear?: () => void;
}

export function AudiencePicker({
  selectedAudiences,
  onAudiencesChange,
  placeholder = "Select audiences...",
  className,
  onGoogleAdsClick,
  onMetaAdsClick,
  selectedAdGroupsCount = 0,
  onAdGroupsClear,
}: AudiencePickerProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    audiences: savedAudiences,
    isLoading,
    error,
    hasMore,
    loadMore,
    isLoadingMore,
    setSearchQuery,
  } = useInfiniteAudiences();

  // Update search query when searchValue changes
  useEffect(() => {
    setSearchQuery(searchValue);
  }, [searchValue, setSearchQuery]);

  // Convert saved audiences to the expected format
  const convertedAudiences: Audience[] = savedAudiences.map((audience) => ({
    id: audience._id,
    name: audience.name,
    source: "saved" as const,
    audienceId: audience.audienceId ?? undefined,
  }));

  const handleSelect = (audience: Audience) => {
    const isSelected = selectedAudiences.some((a) => a.id === audience.id);

    if (isSelected) {
      onAudiencesChange(selectedAudiences.filter((a) => a.id !== audience.id));
    } else {
      onAudiencesChange([...selectedAudiences, audience]);
    }
  };

  const handleRemove = (audienceId: string) => {
    const audience = selectedAudiences.find((a) => a.id === audienceId);
    if (audience?.source === "google-ads" && selectedAdGroupsCount > 0) {
      // If removing Google Ads audience and there are selected ad groups, clear ad groups too
      onAdGroupsClear?.();
    }
    onAudiencesChange(selectedAudiences.filter((a) => a.id !== audienceId));
  };

  const getAudienceDisplayName = (audience: Audience) => {
    if (audience.source === "google-ads") {
      if (selectedAdGroupsCount > 0) {
        return `Google Ads (${selectedAdGroupsCount} Ad Groups)`;
      }
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
        return "secondary";
      case "meta-ads":
        return "secondary";
      case "saved":
        return "outline";
      default:
        return "default";
    }
  };

  // Handle scroll to load more
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight + 50 &&
      hasMore &&
      !isLoadingMore
    ) {
      loadMore();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className="h-auto min-h-[36px] items-center justify-start gap-2 px-2 py-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            role="combobox"
            variant="ghost"
          >
            <div className="flex flex-1 flex-wrap items-center gap-1">
              {selectedAudiences.length === 0 ? (
                <span className="truncate text-left text-sm">
                  {placeholder}
                </span>
              ) : (
                selectedAudiences.map((audience) => (
                  <Badge
                    className="flex max-w-[200px] items-center gap-1 px-2 py-1 text-xs"
                    key={audience.id}
                    variant={getAudienceBadgeVariant(audience.source)}
                  >
                    <span
                      className="max-w-[150px] truncate"
                      title={getAudienceDisplayName(audience)}
                    >
                      {getAudienceDisplayName(audience)}
                    </span>
                    <div
                      className="ml-1 cursor-pointer rounded-full p-0.5 hover:bg-destructive/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(audience.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(audience.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <X className="h-3 w-3" />
                    </div>
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
            <CommandList
              className="max-h-[300px] overflow-y-auto"
              onScroll={handleScroll}
              ref={scrollRef}
            >
              {isLoading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground text-sm">
                    Loading audiences...
                  </span>
                </div>
              )}

              {error && (
                <div className="flex items-center justify-center p-4">
                  <span className="text-destructive text-sm">
                    Failed to load audiences
                  </span>
                </div>
              )}

              {!(isLoading || error) && (
                <>
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
                    {convertedAudiences.map((audience) => (
                      <CommandItem
                        className="flex items-center justify-between"
                        key={audience.id}
                        onSelect={() => handleSelect(audience)}
                        value={audience.name}
                      >
                        <span>{audience.name}</span>
                        {selectedAudiences.some(
                          (a) => a.id === audience.id
                        ) && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </CommandItem>
                    ))}

                    {/* Load More Button */}
                    {hasMore && (
                      <div className="p-2">
                        <Button
                          className="w-full justify-center"
                          disabled={isLoadingMore}
                          onClick={loadMore}
                          size="sm"
                          variant="ghost"
                        >
                          {isLoadingMore ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading more...
                            </>
                          ) : (
                            "Load more audiences"
                          )}
                        </Button>
                      </div>
                    )}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
