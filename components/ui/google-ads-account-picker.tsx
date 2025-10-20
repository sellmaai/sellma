"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CampaignAdGroupPicker, AdGroup } from "@/components/ui/campaign-ad-group-picker";
import { AudienceCampaignAdGroupPicker } from "@/components/ui/audience-campaign-ad-group-picker";
import { cn } from "@/lib/utils";

export interface GoogleAdsAccount {
  id: string;
  name: string;
  customerId: string;
  currency: string;
  timeZone: string;
  status: "ENABLED" | "PAUSED" | "REMOVED";
}

interface GoogleAdsAccountPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountSelect: (account: GoogleAdsAccount) => void;
  onAdGroupsSelect?: (adGroups: AdGroup[]) => void;
  pickerType?: "audience" | "advertisement"; // New prop to distinguish picker type
}

// Mock API call to fetch Google Ads accounts
const fetchGoogleAdsAccounts = async (): Promise<GoogleAdsAccount[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock response with different Google Ads accounts
  return [
    {
      id: "1234567890",
      name: "Sellma",
      customerId: "219-560-8947",
      currency: "USD",
      timeZone: "America/New_York",
      status: "ENABLED",
    },
    {
      id: "2345678901",
      name: "Bath Center",
      customerId: "348-193-55684",
      currency: "USD",
      timeZone: "America/Los_Angeles",
      status: "ENABLED",
    },
  ];
};

export function GoogleAdsAccountPicker({
  open,
  onOpenChange,
  onAccountSelect,
  onAdGroupsSelect,
  pickerType = "advertisement", // Default to advertisement for backward compatibility
}: GoogleAdsAccountPickerProps) {
  const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCampaignPicker, setShowCampaignPicker] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<GoogleAdsAccount | null>(null);

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedAccounts = await fetchGoogleAdsAccounts();
      setAccounts(fetchedAccounts);
    } catch (_err) {
      setError("Failed to load Google Ads accounts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadAccounts();
    }
  }, [open, loadAccounts]);

  const handleAccountSelect = () => {
    const selectedAccount = accounts.find(
      (account) => account.id === selectedAccountId
    );
    if (selectedAccount) {
      setSelectedAccount(selectedAccount);
      setShowCampaignPicker(true);
    }
  };

  const handleAdGroupsSelect = (adGroups: AdGroup[]) => {
    if (onAdGroupsSelect) {
      onAdGroupsSelect(adGroups);
    }
    // Also call the original account select callback
    if (selectedAccount) {
      onAccountSelect(selectedAccount);
    }
    setShowCampaignPicker(false);
    onOpenChange(false);
    setSelectedAccountId("");
    setSelectedAccount(null);
  };

  const getStatusBadgeVariant = (status: GoogleAdsAccount["status"]) => {
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

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Google Ads Account</DialogTitle>
          <DialogDescription>
            Choose a Google Ads account to import audiences from. You can select
            one account at a time.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <span className="text-muted-foreground">
                Loading Google Ads accounts...
              </span>
            </div>
          )}

          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="mb-4 text-destructive">{error}</p>
              <Button onClick={loadAccounts} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {!(isLoading || error) && (
            <RadioGroup
              className="space-y-4"
              onValueChange={setSelectedAccountId}
              value={selectedAccountId}
            >
              {accounts.map((account) => (
                <div
                  className={cn(
                    "flex items-start space-x-3 rounded-lg border p-4 transition-colors",
                    selectedAccountId === account.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                  key={account.id}
                  onClick={() => setSelectedAccountId(account.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedAccountId(account.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <RadioGroupItem
                    className="mt-1"
                    id={account.id}
                    value={account.id}
                  />
                  <div className="flex-1 space-y-2">
                    <Label
                      className="cursor-pointer font-medium text-base"
                      htmlFor={account.id}
                    >
                      {account.name}
                    </Label>
                    <div className="space-y-1 text-muted-foreground text-sm">
                      <p>Customer ID: {account.customerId}</p>
                      <p>Currency: {account.currency}</p>
                      <p>Time Zone: {account.timeZone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-1 font-medium text-xs",
                          getStatusBadgeVariant(account.status)
                        )}
                      >
                        {account.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button
            disabled={!selectedAccountId || isLoading}
            onClick={handleAccountSelect}
          >
            Select Account
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Campaign and Ad Group Picker Modal */}
      {selectedAccount && (
        <>
          {pickerType === "audience" ? (
            <AudienceCampaignAdGroupPicker
              open={showCampaignPicker}
              onOpenChange={setShowCampaignPicker}
              onAdGroupsSelect={handleAdGroupsSelect}
              accountId={selectedAccount.id}
            />
          ) : (
            <CampaignAdGroupPicker
              open={showCampaignPicker}
              onOpenChange={setShowCampaignPicker}
              onAdGroupsSelect={handleAdGroupsSelect}
              accountId={selectedAccount.id}
            />
          )}
        </>
      )}
    </Dialog>
  );
}
