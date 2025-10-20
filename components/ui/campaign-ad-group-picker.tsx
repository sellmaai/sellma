"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface AdGroup {
  id: string;
  name: string;
  status: "ENABLED" | "PAUSED" | "REMOVED";
  campaignId: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: "ENABLED" | "PAUSED" | "REMOVED";
  adGroups: AdGroup[];
}

interface CampaignAdGroupPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdGroupsSelect: (adGroups: AdGroup[]) => void;
  accountId: string;
}

// Mock API call to fetch campaigns and ad groups
const fetchCampaignsAndAdGroups = async (accountId: string): Promise<Campaign[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock response with campaigns and ad groups
  return [
    {
      id: "campaign-1",
      name: "Summer Sale Campaign",
      status: "ENABLED",
      adGroups: [
        {
          id: "adgroup-1",
          name: "Electronics",
          status: "ENABLED",
          campaignId: "campaign-1",
        },
        {
          id: "adgroup-2",
          name: "Clothing",
          status: "ENABLED",
          campaignId: "campaign-1",
        },
        {
          id: "adgroup-3",
          name: "Home & Garden",
          status: "PAUSED",
          campaignId: "campaign-1",
        },
      ],
    },
    {
      id: "campaign-2",
      name: "Holiday Specials",
      status: "ENABLED",
      adGroups: [
        {
          id: "adgroup-4",
          name: "Gift Cards",
          status: "ENABLED",
          campaignId: "campaign-2",
        },
        {
          id: "adgroup-5",
          name: "Decorations",
          status: "ENABLED",
          campaignId: "campaign-2",
        },
      ],
    },
    {
      id: "campaign-3",
      name: "Brand Awareness",
      status: "PAUSED",
      adGroups: [
        {
          id: "adgroup-6",
          name: "Social Media",
          status: "ENABLED",
          campaignId: "campaign-3",
        },
        {
          id: "adgroup-7",
          name: "Display Ads",
          status: "PAUSED",
          campaignId: "campaign-3",
        },
        {
          id: "adgroup-8",
          name: "Video Ads",
          status: "ENABLED",
          campaignId: "campaign-3",
        },
      ],
    },
  ];
};

export function CampaignAdGroupPicker({
  open,
  onOpenChange,
  onAdGroupsSelect,
  accountId,
}: CampaignAdGroupPickerProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedAdGroups, setSelectedAdGroups] = useState<Set<string>>(new Set());
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedCampaigns = await fetchCampaignsAndAdGroups(accountId);
      setCampaigns(fetchedCampaigns);
      // Expand all campaigns by default
      setExpandedCampaigns(new Set(fetchedCampaigns.map(c => c.id)));
    } catch (_err) {
      setError("Failed to load campaigns and ad groups. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (open) {
      loadCampaigns();
    }
  }, [open, loadCampaigns]);

  const toggleCampaignExpansion = (campaignId: string) => {
    setExpandedCampaigns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(campaignId)) {
        newSet.delete(campaignId);
      } else {
        newSet.add(campaignId);
      }
      return newSet;
    });
  };

  const toggleAdGroupSelection = (adGroupId: string) => {
    setSelectedAdGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(adGroupId)) {
        newSet.delete(adGroupId);
      } else {
        newSet.add(adGroupId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allAdGroupIds = campaigns.flatMap(campaign => 
      campaign.adGroups.map(adGroup => adGroup.id)
    );
    setSelectedAdGroups(new Set(allAdGroupIds));
  };

  const handleDeselectAll = () => {
    setSelectedAdGroups(new Set());
  };

  const handleConfirmSelection = () => {
    const selectedAdGroupsList = campaigns
      .flatMap(campaign => campaign.adGroups)
      .filter(adGroup => selectedAdGroups.has(adGroup.id));
    
    onAdGroupsSelect(selectedAdGroupsList);
    onOpenChange(false);
    setSelectedAdGroups(new Set());
  };

  const getStatusBadgeVariant = (status: "ENABLED" | "PAUSED" | "REMOVED") => {
    switch (status) {
      case "ENABLED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "REMOVED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const allAdGroupsCount = campaigns.reduce((total, campaign) => total + campaign.adGroups.length, 0);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Ad Groups</DialogTitle>
          <DialogDescription>
            Choose ad groups from campaigns. Only ad groups can be selected for audience import.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Selection Controls */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={isLoading || campaigns.length === 0}
              >
                Select All ({allAdGroupsCount})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                disabled={isLoading || selectedAdGroups.size === 0}
              >
                Deselect All
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedAdGroups.size} of {allAdGroupsCount} ad groups selected
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <span className="text-muted-foreground">
                Loading campaigns and ad groups...
              </span>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="mb-4 text-destructive">{error}</p>
              <Button onClick={loadCampaigns} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Campaigns and Ad Groups Tree */}
          {!isLoading && !error && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg">
                  <Collapsible
                    open={expandedCampaigns.has(campaign.id)}
                    onOpenChange={() => toggleCampaignExpansion(campaign.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                        <div className="flex items-center gap-3">
                          {expandedCampaigns.has(campaign.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{campaign.name}</span>
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-1 font-medium text-xs",
                                getStatusBadgeVariant(campaign.status)
                              )}
                            >
                              {campaign.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {campaign.adGroups.length} ad groups
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t bg-muted/20">
                        {campaign.adGroups.map((adGroup) => (
                          <div
                            key={adGroup.id}
                            className={cn(
                              "flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors",
                              selectedAdGroups.has(adGroup.id) && "bg-primary/5"
                            )}
                          >
                            <Checkbox
                              id={adGroup.id}
                              checked={selectedAdGroups.has(adGroup.id)}
                              onCheckedChange={() => toggleAdGroupSelection(adGroup.id)}
                            />
                            <label
                              htmlFor={adGroup.id}
                              className="flex-1 flex items-center gap-2 cursor-pointer"
                            >
                              <span className="font-medium">{adGroup.name}</span>
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2 py-1 font-medium text-xs",
                                  getStatusBadgeVariant(adGroup.status)
                                )}
                              >
                                {adGroup.status}
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button
            disabled={selectedAdGroups.size === 0 || isLoading}
            onClick={handleConfirmSelection}
          >
            Select {selectedAdGroups.size} Ad Groups
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
