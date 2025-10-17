'use client'

import { type Persona } from '@/lib/personas/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export function PersonaForm({ persona }: { persona: Persona }) {
  const initials = `${persona.profile.firstName?.[0] ?? ''}${persona.profile.lastName?.[0] ?? ''}`
  const location = [persona.profile.location.city, persona.profile.location.state, persona.profile.location.country]
    .filter(Boolean)
    .join(', ')

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <CardTitle>
            {persona.profile.firstName} {persona.profile.lastName} · {persona.profile.age}
          </CardTitle>
          <CardDescription>
            {persona.profile.occupation} · {location}
          </CardDescription>
        </div>
        <div className="ml-auto">
          <Badge variant="secondary">{persona.audienceGroup}</Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 md:grid-cols-2">
        <section className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Education</Label>
              <div className="text-sm text-muted-foreground">
                {persona.profile.education.level} · {persona.profile.education.field}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Income</Label>
              <div className="text-sm text-muted-foreground">
                ${'{'}persona.profile.income.annual_usd.toLocaleString(){'}'} ({persona.profile.income.type})
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Living Situation</Label>
              <div className="text-sm text-muted-foreground">
                {persona.profile.living_situation.homeownership} · {persona.profile.living_situation.household}
              </div>
            </div>
            {persona.profile.relationship_status && (
              <div className="space-y-1">
                <Label>Relationship</Label>
                <div className="text-sm text-muted-foreground">{persona.profile.relationship_status}</div>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <div className="space-y-1">
            <Label>OCEAN Summary</Label>
            <div className="text-sm">{persona.personality.ocean_summary}</div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="font-medium">Openness</span>: {persona.personality.ocean_scores.openness.toFixed(2)}</div>
            <div><span className="font-medium">Conscientiousness</span>: {persona.personality.ocean_scores.conscientiousness.toFixed(2)}</div>
            <div><span className="font-medium">Extraversion</span>: {persona.personality.ocean_scores.extraversion.toFixed(2)}</div>
            <div><span className="font-medium">Agreeableness</span>: {persona.personality.ocean_scores.agreeableness.toFixed(2)}</div>
            <div><span className="font-medium">Neuroticism</span>: {persona.personality.ocean_scores.neuroticism.toFixed(2)}</div>
          </div>
        </section>

        <section className="space-y-3 md:col-span-2">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Goals & Motivations</Label>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {persona.goals_and_motivations.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <Label>Pain Points</Label>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {persona.pain_points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-3 md:col-span-2">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <Label>Scenario</Label>
              <div className="text-sm text-muted-foreground">{persona.pre_ad_context.scenario}</div>
            </div>
            <div className="space-y-1">
              <Label>Current Activity</Label>
              <div className="text-sm text-muted-foreground">{persona.pre_ad_context.current_activity}</div>
            </div>
            <div className="space-y-1">
              <Label>Emotional State</Label>
              <div className="flex flex-wrap gap-1">
                {persona.pre_ad_context.emotional_state.map((e, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{e}</Badge>
                ))}
              </div>
            </div>
          </div>
          {persona.pre_ad_context.chain_of_thought && (
            <div className="space-y-1">
              <Label>Chain of Thought</Label>
              <div className="text-sm">{persona.pre_ad_context.chain_of_thought}</div>
            </div>
          )}
        </section>
      </CardContent>

      <CardFooter className="justify-between text-xs text-muted-foreground">
        <div>Persona ID: {persona.persona_id}</div>
        <div>Last updated: {new Date(persona.last_updated).toLocaleString()}</div>
      </CardFooter>
    </Card>
  )
}

export default PersonaForm


