"use client";

import { useQuery } from "convex/react";
import { Check, Mail, User } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";

// Integration icons - using simple text representations for Google and Meta
const GoogleIcon = () => (
  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-red-500 font-bold text-sm text-white">
    G
  </div>
);

const _MetaIcon = () => (
  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 font-bold text-sm text-white">
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

function IntegrationCard({
  name,
  description,
  icon,
  isConnected,
  onConnect,
  onDisconnect,
}: IntegrationCardProps) {
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
            <Badge
              className="border-green-200 bg-green-100 text-green-800"
              variant="secondary"
            >
              <Check className="mr-1 h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline">Not Connected</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isConnected ? (
          <Button className="w-full" onClick={onDisconnect} variant="outline">
            Disconnect
          </Button>
        ) : (
          <Button className="w-full" onClick={onConnect}>
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
    setIntegrations((prev) => ({ ...prev, googleAds: true }));
  };

  const handleGoogleAdsDisconnect = () => {
    setIntegrations((prev) => ({ ...prev, googleAds: false }));
  };

  const _handleMetaAdsConnect = () => {
    setIntegrations((prev) => ({ ...prev, metaAds: true }));
  };

  const _handleMetaAdsDisconnect = () => {
    setIntegrations((prev) => ({ ...prev, metaAds: false }));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and integrations.
        </p>
      </div>

      {/* User Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Information
          </CardTitle>
          <CardDescription>
            Update your personal information and contact details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <User className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  defaultValue={viewer?.name || ""}
                  id="name"
                  placeholder="Enter your name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  defaultValue={viewer?.email || ""}
                  id="email"
                  placeholder="Enter your email"
                  type="email"
                />
              </div>
            </div>
          </div>
          <Button className="w-full md:w-auto">Save Changes</Button>
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <IntegrationCard
              description="Connect your Google Ads account to manage campaigns and track performance."
              icon={<GoogleIcon />}
              isConnected={integrations.googleAds}
              name="Google Ads"
              onConnect={handleGoogleAdsConnect}
              onDisconnect={handleGoogleAdsDisconnect}
            />
            {/* <IntegrationCard
              description="Connect your Meta Ads account to manage Facebook and Instagram campaigns."
              icon={<MetaIcon />}
              isConnected={integrations.metaAds}
              name="Meta Ads"
              onConnect={handleMetaAdsConnect}
              onDisconnect={handleMetaAdsDisconnect}
            /> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
