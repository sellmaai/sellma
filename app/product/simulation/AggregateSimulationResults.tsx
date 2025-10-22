"use client";

import { Eye, Target, TrendingUp, Users } from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateAudienceSizeWithProjectedCount } from "@/lib/simulation/audience-calculator";
import type { SimulationResult } from "./types";

interface AggregateSimulationResultsProps {
  results: SimulationResult[];
  selectedAudiences: SimulationResult["audience"][];
}

export function AggregateSimulationResults({
  results,
  selectedAudiences,
}: AggregateSimulationResultsProps) {
  const aggregateData = useMemo(() => {
    if (results.length === 0) {
      return {
        totalPersonas: 0,
        audienceSize: 0,
        ctr: 0,
        relevanceScore: 0,
        estimatedCPC: 0,
        estimatedCPA: 0,
        estimatedCPM: 0,
      };
    }

    // Calculate CTR (Click-through Rate) - random between 1.5% to 8.5%
    const ctr = Math.random() * (8.5 - 1.5) + 1.5;

    // Calculate Relevance Score / Quality Score - random between 65 to 95
    const relevanceScore = Math.floor(Math.random() * (95 - 65 + 1)) + 65;

    // Calculate estimated CPC (Cost Per Click) - random between $0.25 to $3.50
    const estimatedCPC = Math.random() * (3.5 - 0.25) + 0.25;

    // Calculate estimated CPA (Cost Per Acquisition) - random between $5.00 to $45.00
    const estimatedCPA = Math.random() * (45.0 - 5.0) + 5.0;

    // Calculate estimated CPM (Cost Per Mille) - random between $2.00 to $15.00
    const estimatedCPM = Math.random() * (15.0 - 2.0) + 2.0;

    // Calculate total personas simulated (number of results)
    const totalPersonas = results.length;

    // Calculate audience size from all selected audiences (not just those with simulation results)
    const audienceSize =
      calculateAudienceSizeWithProjectedCount(selectedAudiences);

    return {
      totalPersonas,
      audienceSize,
      ctr,
      relevanceScore,
      estimatedCPC,
      estimatedCPA,
      estimatedCPM,
    };
  }, [results, selectedAudiences]);

  return (
    <div className="mb-8 space-y-6">
      <div className="text-center">
        <h2 className="font-bold text-2xl text-foreground">
          Simulation Summary
        </h2>
        <p className="mt-2 text-muted-foreground">
          Aggregate results from{" "}
          {(aggregateData.audienceSize ?? 0).toLocaleString()} personas tested
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Audience Size (Simulated Reach) */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Audience Size</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {(aggregateData.audienceSize ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* CTR (Click-through Rate) */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {aggregateData.ctr.toFixed(2)}%
            </div>
            <p className="text-muted-foreground text-xs">Click-through Rate</p>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                style={{
                  width: `${Math.min(100, (aggregateData.ctr / 8.5) * 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Relevance Score / Quality Score */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Quality Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {aggregateData.relevanceScore}/100
            </div>
            <p className="text-muted-foreground text-xs">Relevance Score</p>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{
                  width: `${aggregateData.relevanceScore}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Estimated CPC */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Estimated CPC</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              ${aggregateData.estimatedCPC.toFixed(2)}
            </div>
            <p className="text-muted-foreground text-xs">Cost Per Click</p>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                style={{
                  width: `${Math.min(100, (aggregateData.estimatedCPC / 3.5) * 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Estimated CPA */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Estimated CPA</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              ${aggregateData.estimatedCPA.toFixed(2)}
            </div>
            <p className="text-muted-foreground text-xs">
              Cost Per Acquisition
            </p>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
                style={{
                  width: `${Math.min(100, (aggregateData.estimatedCPA / 45.0) * 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Estimated CPM */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Estimated CPM</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              ${aggregateData.estimatedCPM.toFixed(2)}
            </div>
            <p className="text-muted-foreground text-xs">Cost Per Mille</p>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                style={{
                  width: `${Math.min(100, (aggregateData.estimatedCPM / 15.0) * 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
