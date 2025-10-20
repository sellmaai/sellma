"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { Check, Mail, User } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Integration icons - using simple text representations for Google and Meta
const GoogleIcon = () => (
  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
    G
  </div>
);

const MetaIcon = () => (
  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
    M
  </div>
);

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

function IntegrationCard({ name, description, icon, isConnected, onConnect, onDisconnect }: IntegrationCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {icon}
          <div className="flex-1">
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {isConnected ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              <Check className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline">Not Connected</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isConnected ? (
          <Button variant="outline" onClick={onDisconnect} className="w-full">
            Disconnect
          </Button>
        ) : (
          <Button onClick={onConnect} className="w-full">
            Connect
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function UserSettings() {
  const viewer = useQuery(api.users.viewer, {});
  
  // Mock state for integrations - in a real app, this would come from your backend
  const [integrations, setIntegrations] = useState({
    googleAds: false,
    metaAds: false,
  });

  const handleGoogleAdsConnect = () => {
    setIntegrations(prev => ({ ...prev, googleAds: true }));
    // Here you would implement the actual OAuth flow
    console.log("Connecting to Google Ads...");
  };

  const handleGoogleAdsDisconnect = () => {
    setIntegrations(prev => ({ ...prev, googleAds: false }));
    console.log("Disconnecting from Google Ads...");
  };

  const handleMetaAdsConnect = () => {
    setIntegrations(prev => ({ ...prev, metaAds: true }));
    // Here you would implement the actual OAuth flow
    console.log("Connecting to Meta Ads...");
  };

  const handleMetaAdsDisconnect = () => {
    setIntegrations(prev => ({ ...prev, metaAds: false }));
    console.log("Disconnecting from Meta Ads...");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and integrations.
        </p>
      </div>

      {/* User Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Information
          </CardTitle>
          <CardDescription>
            Update your personal information and contact details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Enter your name"
                  defaultValue={viewer?.name || ""}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  defaultValue={viewer?.email || ""}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <Button className="w-full md:w-auto">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Integrations Section */}
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Connect your advertising accounts to streamline your campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IntegrationCard
              name="Google Ads"
              description="Connect your Google Ads account to manage campaigns and track performance."
              icon={<GoogleIcon />}
              isConnected={integrations.googleAds}
              onConnect={handleGoogleAdsConnect}
              onDisconnect={handleGoogleAdsDisconnect}
            />
            <IntegrationCard
              name="Meta Ads"
              description="Connect your Meta Ads account to manage Facebook and Instagram campaigns."
              icon={<MetaIcon />}
              isConnected={integrations.metaAds}
              onConnect={handleMetaAdsConnect}
              onDisconnect={handleMetaAdsDisconnect}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
