"use client";

import { useAction } from "convex/react";
import { Send, CornerDownLeft } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { PersonaBrowser } from "@/components/personas/PersonaBrowser";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { api } from "@/convex/_generated/api";
import type { Persona } from "@/lib/personas/types";
import { cn } from "@/lib/utils";
import GenerationChainOfThought from "./AudienceGenerationChainOfThought";

// Regex patterns for location extraction
const LOCATION_IN_PATTERN = /\bin\s+([A-Z][A-Za-z\s]+,\s*[A-Z]{2})\b/;
const LOCATION_TRAILING_PATTERN = /-\s*([A-Z][A-Za-z\s]+,\s*[A-Z]{2})$/;

export default function AudienceGenerationPage() {
  const generateAudienceSegments = useAction(api.audienceGroups.suggestBundle);
  const generate = useAction(api.personas.generate);
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<"build" | "simulate">("build");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [groups, setGroups] = useState<
    Array<{ id: string; label: string; color: string; description: string }>
  >([]);
  const [, setPeople] = useState<
    Array<{ id: number; name: string; designation: string; image: string }>
  >([]);
  const [personasById, setPersonasById] = useState<Record<string, Persona>>({});
  const [error, setError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [groupSuggestStatus, setGroupSuggestStatus] = useState<
    "pending" | "active" | "complete"
  >("pending");
  const [perGroupStatus, setPerGroupStatus] = useState<
    Record<string, "pending" | "active" | "complete">
  >({});
  const currentAudienceIdRef = useRef<string | null>(null);
  const [, setAudienceDescription] = useState<string | null>(null);
  const personaSectionRef = useRef<HTMLDivElement | null>(null);
  const prevPersonaCountRef = useRef<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      return;
    }
    setError(null);
    setIsThinking(true);
    setGroupSuggestStatus("active");
    setPerGroupStatus({});
    setGroups([]);
    setPeople([]);
    setAudienceDescription(null);
    const newAudienceId = Math.random().toString(36).slice(2);
    currentAudienceIdRef.current = newAudienceId;
    startTransition(async () => {
      // Suggest including a location in the prompt; default to a broad region if missing
      const location = extractLocationHint(message) ?? "United States";
      try {
        const bundle = await generateAudienceSegments({
          text: message,
          location,
          count: 6,
        });
        setAudienceDescription(bundle?.description ?? null);
        const res: Array<{
          id: string;
          label: string;
          color: string;
          description: string;
        }> = bundle?.groups ?? [];
        setGroups(res);
        setGroupSuggestStatus("complete");
        setPerGroupStatus(
          Object.fromEntries(res.map((g) => [g.id, "pending"]))
        );

        // Kick off persona generation per group with progressive updates
        for (const g of res) {
          // Only mark as active for the latest audience generation
          if (currentAudienceIdRef.current === newAudienceId) {
            setPerGroupStatus((prev) => ({ ...prev, [g.id]: "active" }));
          }
          // Feed the selected dynamic group as the segment to the personas generator
          generate({
            group: g.id,
            count: 1,
            audienceId: newAudienceId,
            context: {
              location,
              audienceDescription: bundle?.description,
              segment: {
                id: g.id,
                label: g.label,
                description: g.description,
                color: g.color,
              },
            },
          })
            .then((arr) => {
              const p = arr?.[0];
              // Only apply results if they belong to the most recent audience session
              if (p && p.audienceId === currentAudienceIdRef.current) {
                setPersonasById((prev) => ({ ...prev, [p.personaId]: p }));
                // No separate people list; we render directly from personas
              }
            })
            .catch(() => {
              // noop: keep UX flowing; we could surface per-group errors later if desired
            })
            .finally(() => {
              // Only update status for the latest audience generation
              if (currentAudienceIdRef.current === newAudienceId) {
                setPerGroupStatus((prev) => ({ ...prev, [g.id]: "complete" }));
              }
            });
        }
        setMessage("");
        setIsExpanded(false);
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to suggest groups"
        );
        setGroupSuggestStatus("complete");
      }
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    setIsExpanded(e.target.value.length > 100 || e.target.value.includes("\n"));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  function extractLocationHint(text: string): string | null {
    // Very lightweight heuristic; users are encouraged (placeholder) to include a location
    // Look for patterns like "in City, ST" or trailing "- City, ST"
    const match =
      text.match(LOCATION_IN_PATTERN) || text.match(LOCATION_TRAILING_PATTERN);
    return match ? match[1].trim() : null;
  }

  // Smoothly scroll to personas once the first persona is available
  useEffect(() => {
    const count = Object.values(personasById).length;
    const prev = prevPersonaCountRef.current;
    if (prev === 0 && count > 0 && personaSectionRef.current) {
      personaSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    prevPersonaCountRef.current = count;
  }, [personasById]);

  return (
    <div className="w-full overflow-x-hidden p-6 pb-24">
      {/* Mode Toggle Switch */}
      <div className="mx-auto mb-8 flex justify-center">
        <ToggleGroup 
          type="single" 
          value={mode} 
          onValueChange={(value) => value && setMode(value as "build" | "simulate")}
          className="bg-muted rounded-lg p-1 shadow-sm"
        >
          <ToggleGroupItem 
            value="build" 
            className={cn(
              "px-6 py-2 text-sm font-medium transition-all duration-200",
              "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
              "data-[state=off]:text-muted-foreground hover:text-foreground"
            )}
          >
            Build Audience
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="simulate" 
            className={cn(
              "px-6 py-2 text-sm font-medium transition-all duration-200",
              "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
              "data-[state=off]:text-muted-foreground hover:text-foreground"
            )}
          >
            Run Simulations
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <h1 className="mx-auto mb-7 max-w-2xl whitespace-pre-wrap text-pretty px-1 text-center font-semibold text-2xl text-foreground leading-9">
        {mode === "build" ? "Describe Your Target Audience" : "Ask Your Chosen Audience, Anything!"}
      </h1>

      {mode === "build" ? (
        <form className="group/composer w-full" onSubmit={handleSubmit}>
          <input
            className="sr-only"
            multiple
            onChange={() => {
              // Hidden file input - onChange handled elsewhere
            }}
            ref={fileInputRef}
            type="file"
          />

          <div
            className={cn(
              "mx-auto w-full max-w-2xl cursor-text overflow-clip border border-border bg-transparent bg-clip-padding p-2.5 shadow-lg transition-all duration-200 dark:bg-muted/50",
              {
                "grid grid-cols-1 grid-rows-[auto_1fr_auto] rounded-3xl":
                  isExpanded,
                "grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] rounded-[28px]":
                  !isExpanded,
              }
            )}
            style={{
              gridTemplateAreas: isExpanded
                ? "'header' 'primary' 'footer'"
                : "'header header header' 'leading primary trailing' '. footer .'",
            }}
          >
            <div
              className={cn(
                "flex min-h-14 items-center overflow-x-hidden px-1.5",
                {
                  "mb-0 px-2 py-1": isExpanded,
                  "-my-2.5": !isExpanded,
                }
              )}
              style={{ gridArea: "primary" }}
            >
              <div className="max-h-52 flex-1 overflow-auto">
                <Textarea
                  className="scrollbar-thin min-h-0 resize-none rounded-none border-0 p-0 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent"
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your audience (add a location, e.g., Austin, TX)"
                  ref={textareaRef}
                  rows={1}
                  value={message}
                />
              </div>
            </div>
            <div
              className="flex items-center gap-2"
              style={{ gridArea: isExpanded ? "footer" : "trailing" }}
            >
              <div className="ms-auto flex items-center gap-1.5">
                <Button
                  className="h-9 w-9 rounded-full"
                  disabled={isPending || !message.trim()}
                  size="icon"
                  type="submit"
                >
                  {message.trim() ? (
                    <Send className="size-5" />
                  ) : (
                    <CornerDownLeft className="size-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <form className="group/composer w-full" onSubmit={handleSubmit}>
          <input
            className="sr-only"
            multiple
            onChange={() => {
              // Hidden file input - onChange handled elsewhere
            }}
            ref={fileInputRef}
            type="file"
          />

          <div
            className={cn(
              "mx-auto w-full max-w-2xl cursor-text overflow-clip border border-border bg-transparent bg-clip-padding p-2.5 shadow-lg transition-all duration-200 dark:bg-muted/50",
              {
                "grid grid-cols-1 grid-rows-[auto_1fr_auto] rounded-3xl":
                  isExpanded,
                "grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] rounded-[28px]":
                  !isExpanded,
              }
            )}
            style={{
              gridTemplateAreas: isExpanded
                ? "'header' 'primary' 'footer'"
                : "'header header header' 'leading primary trailing' '. footer .'",
            }}
          >
            <div
              className={cn(
                "flex min-h-14 items-center overflow-x-hidden px-1.5",
                {
                  "mb-0 px-2 py-1": isExpanded,
                  "-my-2.5": !isExpanded,
                }
              )}
              style={{ gridArea: "primary" }}
            >
              <div className="max-h-52 flex-1 overflow-auto">
                <Textarea
                  className="scrollbar-thin min-h-0 resize-none rounded-none border-0 p-0 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent"
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Add at least 1 audience, and type in what you want to ask"
                  ref={textareaRef}
                  rows={1}
                  value={message}
                />
              </div>
            </div>
            <div
              className="flex items-center gap-2"
              style={{ gridArea: isExpanded ? "footer" : "trailing" }}
            >
              <div className="ms-auto flex items-center gap-1.5">
                <Button
                  className="h-9 w-9 rounded-full"
                  disabled={isPending || !message.trim()}
                  size="icon"
                  type="submit"
                >
                  {message.trim() ? (
                    <Send className="size-5" />
                  ) : (
                    <CornerDownLeft className="size-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}

      {error ? <p className="mt-4 text-red-600 text-sm">{error}</p> : null}

      {mode === "build" && (
        <>
          <div className="w-full">
            <div className="mx-auto w-full max-w-2xl">
              <GenerationChainOfThought
                groupSuggestStatus={groupSuggestStatus}
                groups={groups}
                isThinking={isThinking}
                perGroupStatus={perGroupStatus}
              />
            </div>
          </div>

          <div
            className="mx-auto w-full max-w-2xl scroll-mt-24"
            ref={personaSectionRef}
          >
            {groups.length > 0 && Object.values(personasById).length > 0 && (
              <PersonaBrowser personas={Object.values(personasById)} />
            )}
          </div>
        </>
      )}

    </div>
  );
}
