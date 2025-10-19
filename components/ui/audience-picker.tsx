"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, X, ExternalLink, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useInfiniteAudiences } from "@/hooks/use-infinite-audiences";

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
  const convertedAudiences: Audience[] = savedAudiences.map(audience => ({
    id: audience._id,
    name: audience.name,
    source: "saved" as const,
  }));

  const handleSelect = (audience: Audience) => {
    const isSelected = selectedAudiences.some(a => a.id === audience.id);
    
    if (isSelected) {
      onAudiencesChange(selectedAudiences.filter(a => a.id !== audience.id));
    } else {
      onAudiencesChange([...selectedAudiences, audience]);
    }
  };

  const handleRemove = (audienceId: string) => {
    onAudiencesChange(selectedAudiences.filter(a => a.id !== audienceId));
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

  // Handle scroll to load more
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !isLoadingMore) {
      loadMore();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            className="h-auto min-h-[32px] px-2 py-1 justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <div className="flex flex-col gap-1 flex-1">
              {selectedAudiences.length === 0 ? (
                <span className="text-sm">{placeholder}</span>
              ) : (
                selectedAudiences.map((audience) => (
                  <Badge
                    key={audience.id}
                    variant={getAudienceBadgeVariant(audience.source)}
                    className="flex items-center gap-1 px-2 py-1 text-xs w-fit"
                  >
                    <span>
                      {getAudienceDisplayName(audience)}
                    </span>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(audience.id);
                      }}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(audience.id);
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </div>
                  </Badge>
                ))
              )}
            </div>
            <Users className="h-4 w-4 shrink-0 opacity-50 mr-1" />
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search audiences..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList
              ref={scrollRef}
              onScroll={handleScroll}
              className="max-h-[300px] overflow-y-auto"
            >
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading audiences...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center p-4">
                  <span className="text-sm text-destructive">Failed to load audiences</span>
                </div>
              ) : (
                <>
                  <CommandEmpty>No audiences found.</CommandEmpty>
                  
                  {/* External Sources Section */}
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">External Sources</h4>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onGoogleAdsClick}
                        className="flex-1 justify-center text-center min-h-[40px] px-3"
                      >
                        <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-xs font-medium">Google Ads</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onMetaAdsClick}
                        className="flex-1 justify-center text-center min-h-[40px] px-3"
                      >
                        <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-xs font-medium">Meta Ads</span>
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Saved Audiences Section */}
                  <CommandGroup heading="Saved Audiences">
                    {convertedAudiences.map((audience) => (
                      <CommandItem
                        key={audience.id}
                        value={audience.name}
                        onSelect={() => handleSelect(audience)}
                        className="flex items-center justify-between"
                      >
                        <span>{audience.name}</span>
                        {selectedAudiences.some(a => a.id === audience.id) && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </CommandItem>
                    ))}
                    
                    {/* Load More Button */}
                    {hasMore && (
                      <div className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={loadMore}
                          disabled={isLoadingMore}
                          className="w-full justify-center"
                        >
                          {isLoadingMore ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
