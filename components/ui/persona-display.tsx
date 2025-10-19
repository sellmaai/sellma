"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Persona } from "@/lib/personas/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
import { Progress } from "./progress";

type PersonaDisplayProps = {
  persona: Persona;
  defaultOpen?: boolean;
};

export const PersonaDisplay = ({
  persona,
  defaultOpen = false,
}: PersonaDisplayProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible onOpenChange={setIsOpen} open={isOpen}>
      <Card>
        <CollapsibleTrigger asChild type="button">
          <CardHeader className="cursor-pointer transition-colors hover:bg-muted/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 text-left">
                <CardTitle className="text-lg">
                  {persona.profileFirstName} {persona.profileLastName}
                </CardTitle>
                <CardDescription className="mt-1">
                  {persona.profileOccupation}
                  {" • "}
                  {persona.profileLocationCity}, {persona.profileLocationState}
                </CardDescription>
              </div>
              <ChevronDown
                className={`size-5 shrink-0 text-muted-foreground transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Profile Information */}
            <Card className="border-muted">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Demographic and personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-muted-foreground text-sm">
                      Name
                    </p>
                    <p className="text-base">
                      {persona.profileFirstName} {persona.profileLastName}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground text-sm">
                      Age
                    </p>
                    <p className="text-base">{persona.profileAge} years</p>
                  </div>
                  {persona.profileGender && (
                    <div>
                      <p className="font-medium text-muted-foreground text-sm">
                        Gender
                      </p>
                      <p className="text-base">{persona.profileGender}</p>
                    </div>
                  )}
                  {persona.profileEthnicity && (
                    <div>
                      <p className="font-medium text-muted-foreground text-sm">
                        Ethnicity
                      </p>
                      <p className="text-base">{persona.profileEthnicity}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <p className="font-medium text-muted-foreground text-sm">
                    Location
                  </p>
                  <p className="text-base">
                    {persona.profileLocationCity},{" "}
                    {persona.profileLocationState}
                    {persona.profileLocationCountry &&
                      `, ${persona.profileLocationCountry}`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="font-medium text-muted-foreground text-sm">
                      Occupation
                    </p>
                    <p className="text-base">{persona.profileOccupation}</p>
                  </div>
                  {persona.profileIncomeAnnualUsd !== undefined &&
                    persona.profileIncomeType && (
                      <div>
                        <p className="font-medium text-muted-foreground text-sm">
                          Income
                        </p>
                        <p className="text-base">
                          ${persona.profileIncomeAnnualUsd.toLocaleString()} (
                          {persona.profileIncomeType})
                        </p>
                      </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="font-medium text-muted-foreground text-sm">
                      Education
                    </p>
                    <p className="text-base">{persona.profileEducationLevel}</p>
                    <p className="text-muted-foreground text-sm">
                      {persona.profileEducationField}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground text-sm">
                      Living Situation
                    </p>
                    <p className="text-base">
                      {persona.profileLivingSituationHomeownership}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {persona.profileLivingSituationHousehold}
                    </p>
                  </div>
                </div>

                {persona.profileRelationshipStatus && (
                  <div className="border-t pt-4">
                    <p className="font-medium text-muted-foreground text-sm">
                      Relationship
                    </p>
                    <p className="text-base">
                      {persona.profileRelationshipStatus}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Personality */}
            {persona.personalityOceanSummary &&
              persona.personalityOceanScoresOpenness !== undefined &&
              persona.personalityOceanScoresConscientiousness !== undefined &&
              persona.personalityOceanScoresExtraversion !== undefined &&
              persona.personalityOceanScoresAgreeableness !== undefined &&
              persona.personalityOceanScoresNeuroticism !== undefined && (
                <Card>
                  <CardHeader>
                    <CardTitle>Personality</CardTitle>
                    <CardDescription>
                      OCEAN model personality traits
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{persona.personalityOceanSummary}</p>

                    <div className="space-y-3 border-t pt-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">Openness</p>
                          <p className="text-muted-foreground text-sm">
                            {Math.round(
                              persona.personalityOceanScoresOpenness * 100
                            )}
                            %
                          </p>
                        </div>
                        <Progress
                          value={persona.personalityOceanScoresOpenness * 100}
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">
                            Conscientiousness
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {Math.round(
                              persona.personalityOceanScoresConscientiousness *
                                100
                            )}
                            %
                          </p>
                        </div>
                        <Progress
                          value={
                            persona.personalityOceanScoresConscientiousness *
                            100
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">Extraversion</p>
                          <p className="text-muted-foreground text-sm">
                            {Math.round(
                              persona.personalityOceanScoresExtraversion * 100
                            )}
                            %
                          </p>
                        </div>
                        <Progress
                          value={
                            persona.personalityOceanScoresExtraversion * 100
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">Agreeableness</p>
                          <p className="text-muted-foreground text-sm">
                            {Math.round(
                              persona.personalityOceanScoresAgreeableness * 100
                            )}
                            %
                          </p>
                        </div>
                        <Progress
                          value={
                            persona.personalityOceanScoresAgreeableness * 100
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">Neuroticism</p>
                          <p className="text-muted-foreground text-sm">
                            {Math.round(
                              persona.personalityOceanScoresNeuroticism * 100
                            )}
                            %
                          </p>
                        </div>
                        <Progress
                          value={
                            persona.personalityOceanScoresNeuroticism * 100
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Goals and Motivations */}
            {persona.goalsAndMotivations?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Goals & Motivations</CardTitle>
                  <CardDescription>What drives this person</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-inside list-disc space-y-2 text-sm">
                    {persona.goalsAndMotivations.map((goal) => (
                      <li key={goal}>{goal}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Pain Points */}
            {persona.painPoints?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pain Points</CardTitle>
                  <CardDescription>Challenges and concerns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-inside list-disc space-y-2 text-sm">
                    {persona.painPoints.map((pain) => (
                      <li key={pain}>{pain}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Pre-Ad Context */}
            {(persona.preAdContextScenario ||
              persona.preAdContextCurrentActivity ||
              persona.preAdContextEmotionalState?.length > 0 ||
              persona.preAdContextChainOfThought) && (
              <Card>
                <CardHeader>
                  <CardTitle>Contextual State</CardTitle>
                  <CardDescription>
                    Typical mindset and emotional state
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {persona.preAdContextScenario && (
                    <div>
                      <p className="font-medium text-muted-foreground text-sm">
                        Scenario
                      </p>
                      <p className="text-sm">{persona.preAdContextScenario}</p>
                    </div>
                  )}

                  {persona.preAdContextCurrentActivity && (
                    <div>
                      <p className="font-medium text-muted-foreground text-sm">
                        Current Activity
                      </p>
                      <p className="text-sm">
                        {persona.preAdContextCurrentActivity}
                      </p>
                    </div>
                  )}

                  {persona.preAdContextEmotionalState?.length > 0 && (
                    <div>
                      <p className="font-medium text-muted-foreground text-sm">
                        Emotional State
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {persona.preAdContextEmotionalState.map((emotion) => (
                          <span
                            className="rounded-full bg-secondary px-3 py-1 text-xs"
                            key={emotion}
                          >
                            {emotion}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {persona.preAdContextChainOfThought && (
                    <div>
                      <p className="font-medium text-muted-foreground text-sm">
                        Chain of Thought
                      </p>
                      <p className="text-sm">
                        {persona.preAdContextChainOfThought}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
