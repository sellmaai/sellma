"use client";

import { useAction, useMutation } from "convex/react";
import { CornerDownLeft, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { PersonaBrowser } from "@/components/personas/PersonaBrowser";
import { Button } from "@/components/ui/button";
import { SaveAudienceDialog } from "@/components/ui/save-audience-dialog";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Persona } from "@/lib/personas/types";
import { cn } from "@/lib/utils";
import GenerationChainOfThought from "./AudienceGenerationChainOfThought";

// Regex patterns for location extraction
const LOCATION_IN_PATTERN = /\bin\s+([A-Z][A-Za-z\s]+,\s*[A-Z]{2})\b/;
const LOCATION_TRAILING_PATTERN = /-\s*([A-Z][A-Za-z\s]+,\s*[A-Z]{2})$/;

export default function AudienceGenerationPage() {
  const generateAudienceSegments = useAction(api.audienceGroups.suggestBundle);
  const generatePreview = useAction(api.personas.generatePreview);
  const savePersonas = useMutation(api.personas.saveMany);
  const saveAudience = useMutation(api.userAudiences.save);
  const [message, setMessage] = useState("");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
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
  const [saveError, setSaveError] = useState<string | null>(null);
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
  const [decision, setDecision] = useState<"pending" | "saved" | "rejected">(
    "pending"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [audienceNotice, setAudienceNotice] = useState<
    null | "saved" | "rejected"
  >(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [projectedPersonasCount, setProjectedPersonasCount] = useState<
    number | null
  >(null);

  const resetBuilderState = () => {
    setSaveError(null);
    setError(null);
    setPersonasById({});
    setGroups([]);
    setPerGroupStatus({});
    setGroupSuggestStatus("pending");
    setIsThinking(false);
    setAudienceDescription(null);
    setIsExpanded(false);
    setMessage("");
    setOriginalPrompt("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setPeople([]);
    prevPersonaCountRef.current = 0;
    currentAudienceIdRef.current = null;
    setDecision("pending");
    setAudienceNotice(null);
    setIsSaving(false);
    setProjectedPersonasCount(null);
  };

  const isComposerLocked = decision === "saved";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isComposerLocked) {
      return;
    }
    // Store the original prompt before starting generation
    setOriginalPrompt(message);
    setError(null);
    setIsThinking(true);
    setGroupSuggestStatus("active");
    setPerGroupStatus({});
    setGroups([]);
    setPeople([]);
    setPersonasById({});
    setAudienceDescription(null);
    setDecision("pending");
    setSaveError(null);
    setAudienceNotice(null);
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

        // Generate random projected personas count between 1500 and 4000
        const randomCount =
          Math.floor(Math.random() * (4000 - 1500 + 1)) + 1500;
        setProjectedPersonasCount(randomCount);

        // Kick off persona generation per group with progressive updates
        for (const g of res) {
          // Only mark as active for the latest audience generation
          if (currentAudienceIdRef.current === newAudienceId) {
            setPerGroupStatus((prev) => ({ ...prev, [g.id]: "active" }));
          }
          // Feed the selected dynamic group as the segment to the personas generator
          generatePreview({
            group: g.id,
            count: 2,
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
              // Handle multiple personas per group
              if (arr && arr.length > 0) {
                for (const p of arr) {
                  // Only apply results if they belong to the most recent audience session
                  if (p && p.audienceId === currentAudienceIdRef.current) {
                    setPersonasById((prev) => ({ ...prev, [p.personaId]: p }));
                  }
                }
              }
            })
            .catch((_error) => {
              // noop: keep UX flowing; we could surface per-group errors later if desired
            })
            .finally(() => {
              // Only update status for the latest audience generation
              if (currentAudienceIdRef.current === newAudienceId) {
                setPerGroupStatus((prev) => ({ ...prev, [g.id]: "complete" }));
              }
            });
        }
        // Don't clear the message here - let it persist after generation
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

  const personaValues = useMemo(
    () => Object.values(personasById),
    [personasById]
  );
  const allGroupsComplete =
    groups.length > 0 &&
    groups.every((group) => perGroupStatus[group.id] === "complete");
  const canDecide = allGroupsComplete && personaValues.length > 0;

  const handleSaveAudience = () => {
    if (!canDecide || decision !== "pending") {
      return;
    }
    setShowSaveDialog(true);
  };

  const handleSaveWithMetadata = async (name: string, description: string) => {
    if (!canDecide || decision !== "pending") {
      return;
    }

    setSaveError(null);
    setIsSaving(true);
    try {
      // First save the audience metadata
      await saveAudience({
        name,
        description,
        audienceId: currentAudienceIdRef.current || "",
        projectedPersonasCount: projectedPersonasCount ?? undefined,
      });

      // Then save the personas
      const payload = personaValues.map((persona) => {
        const { _id: previewId, ...rest } = persona;
        if (previewId !== undefined) {
          // Preview IDs are only used client-side and should not be persisted.
          return rest;
        }
        return rest;
      });
      const saved = await savePersonas({ personas: payload });
      const mapped = Object.fromEntries(
        saved.map((persona) => [persona.personaId, persona as Persona])
      );
      setPersonasById(mapped);
      setDecision("saved");
      setAudienceNotice("saved");
      currentAudienceIdRef.current = null;
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Failed to save the generated audience"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRejectAudience = () => {
    if (!canDecide || decision !== "pending") {
      return;
    }

    setAudienceNotice("rejected");
    setDecision("rejected");
    resetBuilderState();
  };

  const handleStartNewAudience = () => {
    resetBuilderState();
    setDecision("pending");
    setAudienceNotice(null);
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
    const count = personaValues.length;
    const prev = prevPersonaCountRef.current;
    if (prev === 0 && count > 0 && personaSectionRef.current) {
      personaSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    prevPersonaCountRef.current = count;
  }, [personaValues]);

  return (
    <div className="w-full overflow-x-hidden p-6 pb-24">
      <h1 className="mx-auto mb-7 max-w-4xl whitespace-pre-wrap text-pretty px-4 text-center font-semibold text-2xl text-foreground leading-9">
        Describe Your Target Audience
      </h1>

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
            "mx-auto w-full max-w-6xl cursor-text overflow-clip border border-border bg-transparent bg-clip-padding p-4 shadow-lg transition-all duration-200 dark:bg-muted/50",
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
            className={cn("flex min-h-14 items-center overflow-x-hidden px-3", {
              "mb-0 px-4 py-2": isExpanded,
              "-my-4": !isExpanded,
            })}
            style={{ gridArea: "primary" }}
          >
            <div className="max-h-52 flex-1 overflow-auto">
              <Textarea
                className="scrollbar-thin min-h-0 resize-none rounded-none border-0 p-0 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent"
                disabled={isComposerLocked}
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
                disabled={isPending || isComposerLocked}
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
      {error ? <p className="mt-4 text-red-600 text-sm">{error}</p> : null}
      {audienceNotice === "saved" ? (
        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <p className="text-emerald-600">Audience saved successfully.</p>
          <Button
            onClick={handleStartNewAudience}
            size="sm"
            type="button"
            variant="ghost"
          >
            Create another audience
          </Button>
        </div>
      ) : null}
      {audienceNotice === "rejected" ? (
        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground">Audience discarded.</p>
          <Button
            onClick={handleStartNewAudience}
            size="sm"
            type="button"
            variant="ghost"
          >
            Start over
          </Button>
        </div>
      ) : null}

      {originalPrompt && groups.length > 0 && (
        <div className="mx-auto mb-6 w-full max-w-2xl">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="mb-2 font-medium text-muted-foreground text-sm">
              Original Prompt:
            </h3>
            <p className="text-foreground text-sm">{originalPrompt}</p>
          </div>
        </div>
      )}

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
          <PersonaBrowser
            personas={Object.values(personasById)}
            projectedPersonasCount={projectedPersonasCount}
          />
        )}
      </div>

      {canDecide ? (
        <div className="mx-auto mt-6 w-full max-w-2xl">
          {decision === "pending" ? (
            <div className="flex items-center justify-end gap-3">
              <Button
                onClick={handleRejectAudience}
                type="button"
                variant="ghost"
              >
                Reject audience
              </Button>
              <Button
                className="min-w-32"
                disabled={isSaving}
                onClick={handleSaveAudience}
                type="button"
              >
                {isSaving ? "Saving..." : "Save audience"}
              </Button>
            </div>
          ) : null}
          {saveError ? (
            <p className="mt-2 text-right text-red-600 text-sm">{saveError}</p>
          ) : null}
        </div>
      ) : null}

      <SaveAudienceDialog
        isSaving={isSaving}
        onOpenChange={setShowSaveDialog}
        onSave={handleSaveWithMetadata}
        open={showSaveDialog}
      />
    </div>
  );
}
