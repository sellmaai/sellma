"use client";

import { useState } from "react";
import { type Audience, AudiencePicker } from "@/components/ui/audience-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AudiencePickerDemo() {
  const [selectedAudiences, setSelectedAudiences] = useState<Audience[]>([]);
  const [integrationNotice, setIntegrationNotice] = useState<string | null>(
    null
  );

  const handleGoogleAdsClick = () => {
    setIntegrationNotice("Google Ads integration would open here.");
  };

  const handleMetaAdsClick = () => {
    setIntegrationNotice("Meta Ads integration would open here.");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Audience Picker Demo</CardTitle>
          <CardDescription>
            This demonstrates the audience picker component positioned at the
            bottom left of a larger text area: - Increased text area height for
            better typing experience - Audience picker positioned at bottom left
            corner - Click to open search functionality with external source
            buttons (Google Ads & Meta Ads) - Multi-select with pills for saved
            audiences only - Search only appears when the dropdown is opened
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative min-h-24 rounded-lg border border-border bg-muted/20 p-4">
            <textarea
              className="w-full resize-none border-0 bg-transparent px-0 pt-3 pb-12 text-base placeholder:text-muted-foreground focus:outline-none"
              placeholder="Type in what you want to ask your selected audiences..."
              rows={3}
            />

            {/* Audience Picker - positioned at bottom left */}
            <div className="absolute right-2 bottom-2 left-2">
              <AudiencePicker
                onAudiencesChange={setSelectedAudiences}
                onGoogleAdsClick={handleGoogleAdsClick}
                onMetaAdsClick={handleMetaAdsClick}
                placeholder="Audience"
                selectedAudiences={selectedAudiences}
              />
            </div>
          </div>

          {integrationNotice && (
            <div className="rounded-lg border border-muted-foreground/40 border-dashed bg-muted/40 p-3 text-muted-foreground text-sm">
              {integrationNotice}
            </div>
          )}

          {selectedAudiences.length > 0 && (
            <div className="mt-4 rounded-lg bg-muted p-4">
              <h4 className="mb-2 font-medium">Selected Audiences:</h4>
              <div className="space-y-2">
                {selectedAudiences.map((audience) => (
                  <div className="text-sm" key={audience.id}>
                    <strong>{audience.name}</strong>
                    {audience.count &&
                      ` (${audience.count.toLocaleString()} people)`}
                    <span className="ml-2 text-muted-foreground">
                      - {audience.source.replace("-", " ").toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
