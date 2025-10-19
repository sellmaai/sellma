"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/kibo-ui/combobox";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

export type AudienceRecord = {
  audienceId: string;
  personaCount: number;
  lastUpdated: string;
  groups: string[];
};

export type AudiencePickerProps = {
  value?: string | null;
  onChange?: (value: string | null) => void;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  allowClear?: boolean;
  onSelectAudience?: (audience: AudienceRecord | null) => void;
};

const formatTimestamp = (dateFormatter: Intl.DateTimeFormat, iso: string) => {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }
  return dateFormatter.format(parsed);
};

const formatAudienceId = (audienceId: string) => {
  if (audienceId.length <= 12) {
    return audienceId;
  }
  return `${audienceId.slice(0, 6)}...${audienceId.slice(-4)}`;
};

export function AudiencePicker({
  value,
  onChange,
  label = "Audience Session",
  description = "Choose a recent audience generation session (audienceId) to simulate against.",
  className,
  disabled,
  allowClear = false,
  onSelectAudience,
}: AudiencePickerProps) {
  const [internalValue, setInternalValue] = useState("");
  const selectedValue = value ?? internalValue;
  const audiences = useQuery(api.personas.listAudiencesForUser);
  const isLoading = audiences === undefined;
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    []
  );

  const normalizedAudiences: AudienceRecord[] = useMemo(() => {
    if (!audiences) {
      return [];
    }
    return audiences.map((audience) => ({
      audienceId: audience.audienceId,
      personaCount: audience.personaCount,
      lastUpdated: audience.lastUpdated,
      groups: audience.groups,
    }));
  }, [audiences]);

  const selectedAudience = normalizedAudiences.find(
    (audience) => audience.audienceId === selectedValue
  );

  const handleValueChange = (nextValue: string) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue || null);
    const audienceMeta = normalizedAudiences.find(
      (audience) => audience.audienceId === nextValue
    );
    onSelectAudience?.(audienceMeta ?? null);
  };

  const handleClear = () => {
    if (value === undefined) {
      setInternalValue("");
    }
    onChange?.(null);
    onSelectAudience?.(null);
  };

  useEffect(() => {
    if (selectedValue) {
      const meta = normalizedAudiences.find(
        (audience) => audience.audienceId === selectedValue
      );
      onSelectAudience?.(meta ?? null);
    } else {
      onSelectAudience?.(null);
    }
  }, [normalizedAudiences, onSelectAudience, selectedValue]);

  return (
    <Field className={cn("gap-2", className)}>
      <FieldLabel>{label}</FieldLabel>
      <FieldContent className="gap-2 text-sm text-muted-foreground">
        {description}
      </FieldContent>
      <div className="flex items-center gap-2">
        <Combobox
          data={normalizedAudiences.map((audience) => ({
            label: formatAudienceId(audience.audienceId),
            value: audience.audienceId,
          }))}
          onValueChange={handleValueChange}
          type="audience session"
          value={selectedValue}
        >
          <ComboboxTrigger
            disabled={
              disabled || isLoading || normalizedAudiences.length === 0
            }
            variant="outline"
            className="min-w-[220px] justify-between"
          >
            {isLoading ? (
              <div className="flex w-full items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
            ) : selectedAudience ? (
              <div className="flex w-full flex-col items-start gap-0.5 text-left">
                <span className="font-medium leading-snug">
                  Audience {formatAudienceId(selectedAudience.audienceId)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedAudience.personaCount} persona
                  {selectedAudience.personaCount === 1 ? "" : "s"} across{" "}
                  {selectedAudience.groups.length} segment
                  {selectedAudience.groups.length === 1 ? "" : "s"} · Updated{" "}
                  {formatTimestamp(dateFormatter, selectedAudience.lastUpdated)}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">
                Select an audience session...
              </span>
            )}
          </ComboboxTrigger>
          <ComboboxContent>
            <ComboboxInput />
            <ComboboxList>
              <ComboboxEmpty>
                {isLoading
                  ? "Loading audience sessions..."
                  : "No audience sessions found."}
              </ComboboxEmpty>
              <ComboboxGroup>
                {normalizedAudiences.map((audience) => (
                  <ComboboxItem
                    key={audience.audienceId}
                    value={audience.audienceId}
                  >
                    <div className="flex w-full flex-col gap-1 text-left">
                      <span className="font-medium leading-snug">
                        Audience {formatAudienceId(audience.audienceId)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {audience.personaCount} persona
                        {audience.personaCount === 1 ? "" : "s"} across{" "}
                        {audience.groups.length} segment
                        {audience.groups.length === 1 ? "" : "s"}
                      </span>
                      {audience.groups.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Segments: {audience.groups.join(", ")}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Updated {formatTimestamp(dateFormatter, audience.lastUpdated)}
                      </span>
                    </div>
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {allowClear && (selectedValue || "").length > 0 && (
          <Button
            onClick={handleClear}
            type="button"
            variant="ghost"
            size="sm"
          >
            Clear
          </Button>
        )}
      </div>
      {!isLoading && normalizedAudiences.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Generate personas with the audience builder to unlock simulations.
        </p>
      )}
    </Field>
  );
}
