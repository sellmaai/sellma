"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Persona } from "@/lib/personas/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { useDataStream } from "./data-stream-provider";
import { Input } from "./input";
import { PersonaDisplay } from "./persona-display";
import { Skeleton } from "./skeleton";

type AudienceDisplayProps = {
  data: {
    audienceId: string;
    audienceDescription: string;
    audienceName?: string;
    personas: Persona[];
  };
};

export const AudienceDisplay = ({ data }: AudienceDisplayProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [streamedPersonas, setStreamedPersonas] = useState<Persona[]>(
    data.personas || []
  );
  const [generatingCount, setGeneratingCount] = useState(0);
  const [totalPersonas, setTotalPersonas] = useState(
    data.personas?.length || 5
  );
  const [isComplete, setIsComplete] = useState(data.personas?.length > 0);

  const { dataStream } = useDataStream();
  const processedPersonaIds = useRef(new Set<string>());
  const hasInitialized = useRef(false);

  // Initialize processed IDs from existing personas to prevent duplicates
  useEffect(() => {
    if (data.personas?.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      for (const persona of data.personas) {
        processedPersonaIds.current.add(persona._id);
      }
    }
  }, [data.personas]);

  // Handle progressive persona updates from data stream
  useEffect(() => {
    if (!(dataStream?.length && data.audienceId)) {
      return;
    }

    for (const delta of dataStream) {
      switch (delta.type) {
        case "data-audience-start": {
          if (delta.data.audienceId === data.audienceId) {
            setTotalPersonas(delta.data.totalPersonas);
            setIsComplete(false);
          }
          break;
        }
        case "data-persona-generating": {
          if (delta.data.audienceId === data.audienceId) {
            setGeneratingCount(delta.data.personaNumber);
          }
          break;
        }
        case "data-persona-generated": {
          if (
            delta.data.audienceId === data.audienceId &&
            !processedPersonaIds.current.has(delta.data.persona._id)
          ) {
            processedPersonaIds.current.add(delta.data.persona._id);
            setStreamedPersonas((prev) => [...prev, delta.data.persona]);
            setGeneratingCount(0);
          }
          break;
        }
        case "data-audience-complete": {
          if (delta.data.audienceId === data.audienceId) {
            setIsComplete(true);
            setGeneratingCount(0);
          }
          break;
        }
        default:
          break;
      }
    }
  }, [dataStream, data.audienceId]);

  // Filter personas based on search query
  const filteredPersonas = useMemo(() => {
    if (!searchQuery.trim()) {
      return streamedPersonas;
    }

    const query = searchQuery.toLowerCase();
    return streamedPersonas.filter((persona) => {
      const fullName =
        `${persona.profileFirstName} ${persona.profileLastName}`.toLowerCase();
      const occupation = persona.profileOccupation.toLowerCase();
      const location =
        `${persona.profileLocationCity} ${persona.profileLocationState}`.toLowerCase();

      return (
        fullName.includes(query) ||
        occupation.includes(query) ||
        location.includes(query)
      );
    });
  }, [streamedPersonas, searchQuery]);

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{data.audienceName ?? "Audience Personas"}</CardTitle>
          <CardDescription>{data.audienceDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {streamedPersonas.length} of {totalPersonas} personas{" "}
              {isComplete ? "generated" : "generating..."}
            </span>
            {generatingCount > 0 && (
              <span className="text-muted-foreground">
                Generating persona {generatingCount}...
              </span>
            )}
          </div>

          {streamedPersonas.length > 0 && (
            <Input
              className="w-full"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search personas by name, occupation, or location..."
              type="text"
              value={searchQuery}
            />
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredPersonas.map((persona, index) => (
          <div className="space-y-2" key={persona._id}>
            <div className="text-muted-foreground text-xs">
              Persona {index + 1}
            </div>
            <PersonaDisplay defaultOpen={false} persona={persona} />
          </div>
        ))}

        {/* Loading skeleton for generating personas */}
        {generatingCount > 0 && (
          <div className="space-y-2">
            <div className="text-muted-foreground text-xs">
              Persona {generatingCount}
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Show message if search returns no results */}
        {searchQuery.trim() && filteredPersonas.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No personas match your search query.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
