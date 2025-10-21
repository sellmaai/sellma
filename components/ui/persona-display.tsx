"use client";

import { type ReactNode, useState } from "react";
import type { Persona } from "@/lib/personas/types";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Progress } from "./progress";

type PersonaDisplayProps = {
  persona: Persona;
  defaultOpen?: boolean;
  trigger?: ReactNode;
  contentClassName?: string;
};

const PersonaDetails = ({ persona }: { persona: Persona }) => (
  <div className="space-y-4">
    <Card className="border-muted">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Demographic and personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium text-muted-foreground text-sm">Name</p>
            <p className="text-base">
              {persona.profileFirstName} {persona.profileLastName}
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground text-sm">Age</p>
            <p className="text-base">{persona.profileAge} years</p>
          </div>
          {persona.profileGender ? (
            <div>
              <p className="font-medium text-muted-foreground text-sm">
                Gender
              </p>
              <p className="text-base">{persona.profileGender}</p>
            </div>
          ) : null}
          {persona.profileEthnicity ? (
            <div>
              <p className="font-medium text-muted-foreground text-sm">
                Ethnicity
              </p>
              <p className="text-base">{persona.profileEthnicity}</p>
            </div>
          ) : null}
        </div>

        <div className="border-t pt-4">
          <p className="font-medium text-muted-foreground text-sm">Location</p>
          <p className="text-base">
            {persona.profileLocationCity}, {persona.profileLocationState}
            {persona.profileLocationCountry
              ? `, ${persona.profileLocationCountry}`
              : ""}
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
          persona.profileIncomeType ? (
            <div>
              <p className="font-medium text-muted-foreground text-sm">
                Income
              </p>
              <p className="text-base">
                ${persona.profileIncomeAnnualUsd.toLocaleString()} (
                {persona.profileIncomeType})
              </p>
            </div>
          ) : null}
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

        {persona.profileRelationshipStatus ? (
          <div className="border-t pt-4">
            <p className="font-medium text-muted-foreground text-sm">
              Relationship
            </p>
            <p className="text-base">{persona.profileRelationshipStatus}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>

    {persona.personalityOceanSummary &&
    persona.personalityOceanScoresOpenness !== undefined &&
    persona.personalityOceanScoresConscientiousness !== undefined &&
    persona.personalityOceanScoresExtraversion !== undefined &&
    persona.personalityOceanScoresAgreeableness !== undefined &&
    persona.personalityOceanScoresNeuroticism !== undefined ? (
      <Card>
        <CardHeader>
          <CardTitle>Personality</CardTitle>
          <CardDescription>OCEAN model personality traits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">{persona.personalityOceanSummary}</p>
          <div className="space-y-3 border-t pt-4">
            {[
              {
                label: "Openness",
                value: persona.personalityOceanScoresOpenness,
              },
              {
                label: "Conscientiousness",
                value: persona.personalityOceanScoresConscientiousness,
              },
              {
                label: "Extraversion",
                value: persona.personalityOceanScoresExtraversion,
              },
              {
                label: "Agreeableness",
                value: persona.personalityOceanScoresAgreeableness,
              },
              {
                label: "Neuroticism",
                value: persona.personalityOceanScoresNeuroticism,
              },
            ].map(({ label, value }) => (
              <div className="space-y-1" key={label}>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-muted-foreground text-sm">
                    {Math.round(value * 100)}%
                  </p>
                </div>
                <Progress value={value * 100} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ) : null}

    {persona.goalsAndMotivations?.length ? (
      <Card>
        <CardHeader>
          <CardTitle>Goals &amp; Motivations</CardTitle>
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
    ) : null}

    {persona.painPoints?.length ? (
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
    ) : null}

    {persona.preAdContextScenario ||
    persona.preAdContextCurrentActivity ||
    (persona.preAdContextEmotionalState &&
      persona.preAdContextEmotionalState.length > 0) ||
    persona.preAdContextChainOfThought ? (
      <Card>
        <CardHeader>
          <CardTitle>Contextual State</CardTitle>
          <CardDescription>Typical mindset and emotional state</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {persona.preAdContextScenario ? (
            <div>
              <p className="font-medium text-muted-foreground text-sm">
                Scenario
              </p>
              <p className="text-sm">{persona.preAdContextScenario}</p>
            </div>
          ) : null}

          {persona.preAdContextCurrentActivity ? (
            <div>
              <p className="font-medium text-muted-foreground text-sm">
                Current Activity
              </p>
              <p className="text-sm">{persona.preAdContextCurrentActivity}</p>
            </div>
          ) : null}

          {persona.preAdContextEmotionalState &&
          persona.preAdContextEmotionalState.length > 0 ? (
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
          ) : null}

          {persona.preAdContextChainOfThought ? (
            <div>
              <p className="font-medium text-muted-foreground text-sm">
                Chain of Thought
              </p>
              <p className="text-sm">{persona.preAdContextChainOfThought}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    ) : null}
  </div>
);

export const PersonaDisplay = ({
  persona,
  defaultOpen = false,
  trigger,
  contentClassName,
}: PersonaDisplayProps) => {
  const [open, setOpen] = useState(defaultOpen);

  const triggerNode = trigger ?? (
    <Card className="cursor-pointer transition-colors hover:bg-muted/50">
      <CardHeader className="flex justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg">
            {persona.profileFirstName} {persona.profileLastName}
          </CardTitle>
          <CardDescription>
            {persona.profileOccupation} • {persona.profileLocationCity},{" "}
            {persona.profileLocationState}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{triggerNode}</DialogTrigger>
      <DialogContent
        className={cn(
          "max-h-[75vh] w-[min(90vw,800px)] overflow-y-auto p-0",
          contentClassName
        )}
      >
        <DialogHeader className="sticky top-0 z-10 border-b bg-background px-6 py-4">
          <DialogTitle className="text-xl">
            {persona.profileFirstName} {persona.profileLastName}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {persona.profileOccupation}
            {" • "}
            {persona.profileLocationCity}, {persona.profileLocationState}
            {persona.profileLocationCountry
              ? `, ${persona.profileLocationCountry}`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 px-6 pt-4 pb-6">
          <PersonaDetails persona={persona} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
