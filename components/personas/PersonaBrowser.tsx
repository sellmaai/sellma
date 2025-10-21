"use client";

import type { FC } from "react";
import { useMemo, useState } from "react";
import type { Persona } from "@/lib/personas/types";
import { PersonaDisplay } from "../ui/persona-display";

interface PersonaBrowserProps {
  personas: Persona[];
}

const buildSearchString = (persona: Persona): string => {
  const name =
    `${persona.profileFirstName ?? ""} ${persona.profileLastName ?? ""}`.trim();
  const occupation = persona.profileOccupation ?? "";
  const city = persona.profileLocationCity ?? "";
  const state = persona.profileLocationState ?? "";
  return `${name} ${occupation} ${city} ${state}`.toLowerCase();
};

export const PersonaBrowser: FC<PersonaBrowserProps> = ({ personas }) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return personas;
    }
    return personas.filter((persona) =>
      buildSearchString(persona).includes(query)
    );
  }, [personas, search]);

  if (personas.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div>
          <h2 className="font-medium text-lg">Your Simulated Audience</h2>
          <p className="text-muted-foreground text-sm">
            Click a persona tile to explore the detailed profile dialogue.
          </p>
        </div>

        <div className="flex items-center">
          <input
            className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search personas by name, occupation, or location..."
            value={search}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-1">
          {filtered.map((persona) => (
            <PersonaDisplay key={persona.personaId} persona={persona} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonaBrowser;
