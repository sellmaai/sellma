"use client";

import { useState } from "react";
import { AudiencePicker, type Audience } from "@/components/ui/audience-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AudiencePickerDemo() {
  const [selectedAudiences, setSelectedAudiences] = useState<Audience[]>([]);

  const handleGoogleAdsClick = () => {
    // TODO: Implement Google Ads integration
    console.log("Google Ads clicked - would open Google Ads integration");
    alert("Google Ads integration would open here");
  };

  const handleMetaAdsClick = () => {
    // TODO: Implement Meta Ads integration
    console.log("Meta Ads clicked - would open Meta Ads integration");
    alert("Meta Ads integration would open here");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Audience Picker Demo</CardTitle>
          <CardDescription>
            This demonstrates the audience picker component positioned at the bottom left of a larger text area:
            - Increased text area height for better typing experience
            - Audience picker positioned at bottom left corner
            - Click to open search functionality with external source buttons (Google Ads & Meta Ads)
            - Multi-select with pills for saved audiences only
            - Search only appears when the dropdown is opened
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border border-border rounded-lg p-4 bg-muted/20 relative min-h-24">
            <textarea
              className="w-full resize-none border-0 bg-transparent pt-3 px-0 pb-12 text-base placeholder:text-muted-foreground focus:outline-none"
              placeholder="Type in what you want to ask your selected audiences..."
              rows={3}
            />
            
            {/* Audience Picker - positioned at bottom left */}
            <div className="absolute bottom-2 left-2 right-2">
              <AudiencePicker
                selectedAudiences={selectedAudiences}
                onAudiencesChange={setSelectedAudiences}
                onGoogleAdsClick={handleGoogleAdsClick}
                onMetaAdsClick={handleMetaAdsClick}
                placeholder="Audience"
              />
            </div>
          </div>
          
          {selectedAudiences.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Selected Audiences:</h4>
              <div className="space-y-2">
                {selectedAudiences.map((audience) => (
                  <div key={audience.id} className="text-sm">
                    <strong>{audience.name}</strong> 
                    {audience.count && ` (${audience.count.toLocaleString()} people)`}
                    <span className="ml-2 text-muted-foreground">
                      - {audience.source.replace('-', ' ').toUpperCase()}
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
