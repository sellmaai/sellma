import React from 'react';
import { Persona } from '@/lib/personas/types';
import { User, MapPin, GraduationCap, Briefcase, DollarSign, Home, AlertTriangle } from 'lucide-react';

interface PersonaCharacteristicsProps {
  persona: Persona;
}

export const PersonaForm: React.FC<PersonaCharacteristicsProps> = ({ persona }) => {

  const formatIncome = (income: number) => {
    if (income >= 1000000) {
      return `$${(income / 1000000).toFixed(1)}M`;
    } else if (income >= 1000) {
      return `$${(income / 1000).toFixed(0)}K`;
    }
    return `$${income}`;
  };

  const getOceanColor = (score: number) => {
    if (score >= 8) return '#34C759';
    if (score >= 6) return '#FF9500';
    if (score >= 4) return '#FFCC00';
    return '#FF3B30';
  };

  return (
    <div className="border-t border-gray-200/50 pt-6">
        <div className="flex items-center space-x-2">
          <User size={16}/>
          <h4 className="text-center text-foreground text-pretty whitespace-pre-wrap font-medium tracking-wide">Persona Characteristics</h4>
        </div>
      {(
        <div className="mt-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h5 className="text-foreground font-medium tracking-wide mb-3 text-sm">Profile</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin size={12} className="text-foreground" />
                    <span className="text-foreground text-sm">
                      {persona.profile.location.city}, {persona.profile.location.state}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <GraduationCap size={12} className="text-foreground" />
                    <span className="text-foreground text-sm">
                      {persona.profile.education.level} in {persona.profile.education.field}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Briefcase size={12} className="text-foreground" />
                    <span className="text-foreground text-sm">
                      {persona.profile.occupation}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign size={12} className="text-foreground" />
                    <span className="text-foreground text-sm">
                      {formatIncome(persona.profile.income.annual_usd)} annually
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Home size={12} className="text-foreground" />
                    <span className="text-foreground text-sm">
                      {persona.profile.living_situation.homeownership}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-foreground font-medium tracking-wide mb-3 text-sm">Goals</h5>
                <div className="space-y-1">
                  {persona.goals_and_motivations.slice(0, 3).map((goal, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      <span className="text-foreground text-sm leading-relaxed">
                        {goal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-foreground font-medium tracking-wide mb-3 text-sm">Pain Points</h5>
                <div className="space-y-1">
                  {persona.pain_points.slice(0, 3).map((pain, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <AlertTriangle size={12} className="text-orange-500 mt-1 flex-shrink-0" />
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
                <h5 className="text-foreground font-medium tracking-wide mb-3 text-sm">Personality (OCEAN)</h5>
                <div className="space-y-2">
                  {Object.entries(persona.personality.ocean_scores).map(([trait, score]) => (
                    <div key={trait}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-foreground text-xs capitalize tracking-wide">
                          {trait}
                        </span>
                        <span className="text-foreground text-xs font-mono tabular-nums">
                          {score}/10
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200/50 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${(score / 10) * 100}%`,
                            backgroundColor: getOceanColor(score),
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-foreground font-medium tracking-wide mb-3 text-sm">Current Context</h5>
                <div className="space-y-3">
                  <div>
                    <span className="text-foreground text-xs font-medium tracking-wide uppercase">Activity</span>
                    <p className="text-foreground text-sm mt-1">
                      {persona.pre_ad_context.current_activity}
                    </p>
                  </div>
                  <div>
                    <span className="text-foreground text-xs font-medium tracking-wide uppercase">Emotional State</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {persona.pre_ad_context.emotional_state.map((emotion, index) => (
                        <span
                          key={index}
                          className="px-2 py-1  text-foreground rounded-lg text-xs font-medium border border-indigo-200"
                        >
                          {emotion}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


