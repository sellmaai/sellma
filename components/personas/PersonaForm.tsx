import {
  AlertTriangle,
  Briefcase,
  DollarSign,
  GraduationCap,
  Home,
  MapPin,
  User,
} from "lucide-react";
import type React from "react";
import type { Persona } from "@/lib/personas/types";

interface PersonaCharacteristicsProps {
  persona: Persona;
}

export const PersonaForm: React.FC<PersonaCharacteristicsProps> = ({
  persona,
}) => {
  const formatIncome = (income: number) => {
    if (income >= 1_000_000) {
      return `$${(income / 1_000_000).toFixed(1)}M`;
    }
    if (income >= 1000) {
      return `$${(income / 1000).toFixed(0)}K`;
    }
    return `$${income}`;
  };

  const getOceanColor = (score: number) => {
    if (score >= 8) {
      return "#34C759";
    }
    if (score >= 6) {
      return "#FF9500";
    }
    if (score >= 4) {
      return "#FFCC00";
    }
    return "#FF3B30";
  };

  return (
    <div className="border-gray-200/50 border-t pt-6">
      <div className="flex items-center space-x-2">
        <User size={16} />
        <h4 className="whitespace-pre-wrap text-pretty text-center font-medium text-foreground tracking-wide">
          Persona Characteristics
        </h4>
      </div>
      {
        <div className="slide-in-from-top-2 mt-6 animate-in space-y-6 duration-300">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h5 className="mb-3 font-medium text-foreground text-sm tracking-wide">
                  Profile
                </h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="text-foreground" size={12} />
                    <span className="text-foreground text-sm">
                      {persona.profileLocationCity},{" "}
                      {persona.profileLocationState}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="text-foreground" size={12} />
                    <span className="text-foreground text-sm">
                      {persona.profileEducationLevel} in{" "}
                      {persona.profileEducationField}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="text-foreground" size={12} />
                    <span className="text-foreground text-sm">
                      {persona.profileOccupation}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="text-foreground" size={12} />
                    <span className="text-foreground text-sm">
                      {formatIncome(persona.profileIncomeAnnualUsd)} annually
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Home className="text-foreground" size={12} />
                    <span className="text-foreground text-sm">
                      {persona.profileLivingSituationHomeownership}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="mb-3 font-medium text-foreground text-sm tracking-wide">
                  Goals
                </h5>
                <div className="space-y-1">
                  {persona.goalsAndMotivations
                    .slice(0, 3)
                    .map((goal, index) => (
                      <div className="flex items-start space-x-2" key={index}>
                        <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
                        <span className="text-foreground text-sm leading-relaxed">
                          {goal}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h5 className="mb-3 font-medium text-foreground text-sm tracking-wide">
                  Pain Points
                </h5>
                <div className="space-y-1">
                  {persona.painPoints.slice(0, 3).map((pain, index) => (
                    <div className="flex items-start space-x-2" key={index}>
                      <AlertTriangle
                        className="mt-1 flex-shrink-0 text-orange-500"
                        size={12}
                      />
                      <span className="text-foreground text-sm leading-relaxed">
                        {pain}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="mb-3 font-medium text-foreground text-sm tracking-wide">
                  Personality (OCEAN)
                </h5>
                <div className="space-y-2">
                  {[
                    {
                      trait: "openness",
                      score: persona.personalityOceanScoresOpenness,
                    },
                    {
                      trait: "conscientiousness",
                      score: persona.personalityOceanScoresConscientiousness,
                    },
                    {
                      trait: "extraversion",
                      score: persona.personalityOceanScoresExtraversion,
                    },
                    {
                      trait: "agreeableness",
                      score: persona.personalityOceanScoresAgreeableness,
                    },
                    {
                      trait: "neuroticism",
                      score: persona.personalityOceanScoresNeuroticism,
                    },
                  ].map(({ trait, score }) => (
                    <div key={trait}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-foreground text-xs capitalize tracking-wide">
                          {trait}
                        </span>
                        <span className="font-mono text-foreground text-xs tabular-nums">
                          {(score * 10).toFixed(1)}/10
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-gray-200/50">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${score * 100}%`,
                            backgroundColor: getOceanColor(score * 10),
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="mb-3 font-medium text-foreground text-sm tracking-wide">
                  Current Context
                </h5>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-foreground text-xs uppercase tracking-wide">
                      Activity
                    </span>
                    <p className="mt-1 text-foreground text-sm">
                      {persona.preAdContextCurrentActivity}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground text-xs uppercase tracking-wide">
                      Emotional State
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {persona.preAdContextEmotionalState.map(
                        (emotion, index) => (
                          <span
                            className="rounded-lg border border-indigo-200 px-2 py-1 font-medium text-foreground text-xs"
                            key={index}
                          >
                            {emotion}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
};
