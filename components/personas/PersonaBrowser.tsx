"use client";

import { User } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { PersonaForm } from "@/components/personas/PersonaForm";
import { Card, CardContent } from "@/components/ui/card";
import type { Persona } from "@/lib/personas/types";

interface PersonaBrowserProps {
  personas: Persona[];
}

export const PersonaBrowser: React.FC<PersonaBrowserProps> = ({ personas }) => {
  const [search, setSearch] = useState("");
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(
    null
  );

  // Default-select the first persona when list is populated or changes
  useEffect(() => {
    if (personas.length === 0) {
      setSelectedPersonaId(null);
      return;
    }
    if (
      !(
        selectedPersonaId &&
        personas.some((p) => p.personaId === selectedPersonaId)
      )
    ) {
      setSelectedPersonaId(personas[0].personaId);
    }
  }, [personas, selectedPersonaId]);

  const listItems = useMemo(
    () =>
      personas.map((p) => {
        const first = p.profileFirstName ?? "Persona";
        const last = p.profileLastName ?? "";
        const displayName = `${first} ${last}`.trim();
        const designation =
          `${p.profileOccupation ?? ""} · ${p.profileLocationCity ?? ""}${p.profileLocationState ? `, ${p.profileLocationState}` : ""}`.trim();
        return {
          personaId: p.personaId,
          name: displayName,
          designation,
          image:
            "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=3387&q=80",
        };
      }),
    [personas]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return listItems;
    }
    return listItems.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.designation.toLowerCase().includes(q)
    );
  }, [listItems, search]);

  const selectedPersona = useMemo(
    () => personas.find((p) => p.personaId === selectedPersonaId) ?? null,
    [personas, selectedPersonaId]
  );

  if (personas.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <div className="mx-auto w-full max-w-2xl">
        <h2 className="font-medium text-lg">Your Simulated Audience</h2>

        {/* Search + List (fixed height) */}
        <div className="mt-4">
          <div className="flex items-center">
            <input
              className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people by name, role, or city..."
              value={search}
            />
          </div>

          <div
            className="mt-4 space-y-3 overflow-auto pr-1"
            style={{ maxHeight: "320px" }}
          >
            {filtered.map((p) => (
              <Card
                className={
                  "relative cursor-pointer border transition-all duration-100 hover:shadow-sm" +
                  (selectedPersonaId === p.personaId
                    ? "border-primary"
                    : "hover:border-muted-foreground")
                }
                key={p.personaId}
                onClick={() => setSelectedPersonaId(p.personaId)}
              >
                <CardContent className="flex items-center space-x-4 p-4">
                  <User className="h-8 w-8" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground text-sm">
                      {p.name}
                    </div>
                    <div className="truncate text-muted-foreground text-sm">
                      {p.designation}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Persona details below */}
        <div className="mt-8">
          {selectedPersona ? <PersonaForm persona={selectedPersona} /> : null}
        </div>
      </div>
    </section>
  );
};

export default PersonaBrowser;
