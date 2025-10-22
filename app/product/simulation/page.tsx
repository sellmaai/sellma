"use client";

import { useAction, useConvex } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import type { Persona } from "@/lib/personas/types";
import { AdSimulationResults } from "./AdSimulationResults";
import { KeywordSimulationResults } from "./KeywordSimulationResults";
import { SimulationForm } from "./SimulationForm";
import type {
  AdSimulationResult,
  KeywordSimulationResult,
  SimulationKind,
  SimulationSubmission,
} from "./types";

type PersonaLike = Persona | Doc<"personas">;

const isDocPersona = (persona: PersonaLike): persona is Doc<"personas"> =>
  "_creationTime" in persona;

const normalizePersona = (persona: PersonaLike): Persona => {
  if (isDocPersona(persona)) {
    const { _creationTime: _discard, ...rest } = persona;
    return rest as Persona;
  }
  return persona;
};

const isFulfilled = <T,>(
  result: PromiseSettledResult<T>
): result is PromiseFulfilledResult<T> => result.status === "fulfilled";

const isRejected = <T,>(
  result: PromiseSettledResult<T>
): result is PromiseRejectedResult => result.status === "rejected";

export default function SimulationPage() {
  const convex = useConvex();
  const runAdSimulation = useAction(api.simulation.simulate);
  const runKeywordSimulation = useAction(api.keywords.simulate);
  const [activeSimulationKind, setActiveSimulationKind] =
    useState<SimulationKind>("ads");
  const [adSimulationResults, setAdSimulationResults] = useState<
    AdSimulationResult[]
  >([]);
  const [keywordSimulationResults, setKeywordSimulationResults] = useState<
    KeywordSimulationResult[]
  >([]);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedAudiences, setSelectedAudiences] = useState<
    AdSimulationResult["audience"][]
  >([]);

  const handleSimulationSubmit = async (payload: SimulationSubmission) => {
    setActiveSimulationKind(payload.mode);
    setSimulationError(null);
    setIsSimulating(true);
    setSelectedAudiences([]);
    if (payload.mode === "ads") {
      setAdSimulationResults([]);
    } else {
      setKeywordSimulationResults([]);
    }

    try {
      if (payload.audiences.length === 0) {
        setSimulationError("Select at least one audience to run simulations.");
        return;
      }

      if (payload.mode === "ads" && payload.ads.length === 0) {
        setSimulationError("Add at least one ad copy to simulate.");
        return;
      }

      const savedAudiencesMissingIds = payload.audiences.filter(
        (audience) => audience.source === "saved" && !audience.audienceId
      );
      if (savedAudiencesMissingIds.length > 0) {
        const audienceNames = savedAudiencesMissingIds
          .map((audience) => `"${audience.name}"`)
          .join(", ");
        setSimulationError(
          `Saved audience ${audienceNames} is missing persona history. Regenerate and save personas for it before running simulations.`
        );
        return;
      }

      const audiencePersonaPairs = await Promise.all(
        payload.audiences.map(async (audience) => {
          const personaAudienceId = audience.audienceId ?? audience.id;
          try {
            const personas =
              (await convex.query(api.personas.listByAudienceId, {
                audienceId: personaAudienceId,
              })) ?? [];

            // For saved audiences, get the projectedPersonasCount
            let projectedPersonasCount: number | undefined;
            if (audience.source === "saved") {
              const savedAudience = await convex.query(
                api.userAudiences.getByName,
                {
                  name: audience.name,
                }
              );
              projectedPersonasCount = savedAudience?.projectedPersonasCount;
            }

            return {
              audience: {
                ...audience,
                projectedPersonasCount,
              },
              personas: personas.map((persona) => normalizePersona(persona)),
            };
          } catch (err) {
            throw new Error(
              err instanceof Error
                ? err.message
                : "Failed to load personas for the selected audiences."
            );
          }
        })
      );

      const audiencesWithoutPersonas = audiencePersonaPairs
        .filter(
          ({ personas, audience }) =>
            personas.length === 0 && audience.source === "saved"
        )
        .map(({ audience }) => audience.name);
      const pairsWithPersonas = audiencePersonaPairs.filter(
        ({ personas }) => personas.length > 0
      );

      if (payload.mode === "ads") {
        const adsForSimulation = payload.ads.map((ad) => ({ ...ad }));
        const simulationPromises: Promise<AdSimulationResult>[] =
          pairsWithPersonas.flatMap(({ audience, personas }) =>
            personas.map((persona) =>
              runAdSimulation({
                persona,
                ads: adsForSimulation,
              }).then(
                (reactions): AdSimulationResult => ({
                  mode: "ads",
                  audience,
                  persona,
                  reactions,
                  ads: adsForSimulation,
                  notes: payload.notes,
                })
              )
            )
          );

        if (simulationPromises.length === 0) {
          setSimulationError(
            audiencesWithoutPersonas.length > 0
              ? `No personas available for ${audiencesWithoutPersonas
                  .map((name) => `"${name}"`)
                  .join(", ")}. Generate or save personas first.`
              : "No personas available for the selected audiences. Generate or save personas first."
          );
          return;
        }

        const settledResults = await Promise.allSettled(simulationPromises);
        const successful = settledResults.filter(isFulfilled);
        const failed = settledResults.filter(isRejected);

        const collected = successful.map((item) => item.value);
        setAdSimulationResults(collected);
        setSelectedAudiences(
          audiencePersonaPairs.map(({ audience }) => audience)
        );

        if (failed.length > 0) {
          const firstError = failed.at(0)?.reason;
          setSimulationError(
            firstError instanceof Error
              ? firstError.message
              : "Some simulations failed. Please try again."
          );
        } else if (collected.length === 0) {
          setSimulationError(
            "Simulations completed but no reactions were returned. Please try again."
          );
        } else if (audiencesWithoutPersonas.length > 0) {
          setSimulationError(
            `Skipped audiences without saved personas: ${audiencesWithoutPersonas
              .map((name) => `"${name}"`)
              .join(", ")}.`
          );
        }
        return;
      }

      const preparedSeedKeywords = payload.seedKeywords
        .map((keyword) => keyword.trim())
        .filter((keyword) => keyword.length > 0);

      const simulationPromises: Promise<KeywordSimulationResult>[] =
        pairsWithPersonas.flatMap(({ audience, personas }) =>
          personas.map((persona) =>
            runKeywordSimulation({
              persona,
              advertisingGoal: payload.advertisingGoal,
              seedKeywords: preparedSeedKeywords,
              audienceSummary: payload.notes ?? audience.name,
              adGroups: payload.adGroups,
            }).then(
              (keywords): KeywordSimulationResult => ({
                mode: "keywords",
                audience,
                persona,
                keywords,
                advertisingGoal: payload.advertisingGoal,
                seedKeywords: preparedSeedKeywords,
                adGroups: payload.adGroups,
                notes: payload.notes,
              })
            )
          )
        );

      // if (simulationPromises.length === 0) {
      //   setSimulationError(
      //     audiencesWithoutPersonas.length > 0
      //       ? `No personas available for ${audiencesWithoutPersonas
      //           .map((name) => `"${name}"`)
      //           .join(", ")}. Generate or save personas first.`
      //       : "No personas available for the selected audiences. Generate or save personas first."
      //   );
      //   return;
      // }

      const settledResults = await Promise.allSettled(simulationPromises);
      const successful = settledResults.filter(isFulfilled);
      const failed = settledResults.filter(isRejected);

      const collected = successful.map((item) => item.value);
      setKeywordSimulationResults(collected);
      setSelectedAudiences(
        audiencePersonaPairs.map(({ audience }) => audience)
      );

      if (failed.length > 0) {
        const firstError = failed.at(0)?.reason;
        setSimulationError(
          firstError instanceof Error
            ? firstError.message
            : "Some simulations failed. Please try again."
        );
      } else if (collected.length === 0) {
        setSimulationError(
          "Simulations completed but no keyword recommendations were returned. Please try again."
        );
      } else if (audiencesWithoutPersonas.length > 0) {
        setSimulationError(
          `Skipped audiences without saved personas: ${audiencesWithoutPersonas
            .map((name) => `"${name}"`)
            .join(", ")}.`
        );
      }
    } catch (err) {
      setSimulationError(
        err instanceof Error ? err.message : "Failed to run simulations."
      );
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="w-full overflow-x-hidden p-6 pb-24">
      <h1 className="mx-auto mb-7 max-w-4xl whitespace-pre-wrap text-pretty px-4 text-center font-semibold text-2xl text-foreground leading-9">
        Run Persona Simulations
      </h1>

      <SimulationForm
        error={simulationError}
        isPending={isSimulating}
        onSubmit={handleSimulationSubmit}
      />

      <div className="mx-auto mt-6 w-full max-w-6xl px-4">
        {activeSimulationKind === "ads" ? (
          <AdSimulationResults
            error={simulationError}
            isLoading={isSimulating}
            results={adSimulationResults}
            selectedAudiences={selectedAudiences}
          />
        ) : (
          <KeywordSimulationResults
            error={simulationError}
            isLoading={isSimulating}
            results={keywordSimulationResults}
            selectedAudiences={selectedAudiences}
          />
        )}
      </div>
    </div>
  );
}
