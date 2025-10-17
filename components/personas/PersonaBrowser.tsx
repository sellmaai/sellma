"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Persona } from '@/lib/personas/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PersonaForm } from '@/components/personas/PersonaForm';

interface PersonaBrowserProps {
  personas: Persona[];
}

export const PersonaBrowser: React.FC<PersonaBrowserProps> = ({ personas }) => {
  const [search, setSearch] = useState('');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);

  // Default-select the first persona when list is populated or changes
  useEffect(() => {
    if (personas.length === 0) {
      setSelectedPersonaId(null);
      return;
    }
    if (!selectedPersonaId || !personas.some(p => p.persona_id === selectedPersonaId)) {
      setSelectedPersonaId(personas[0].persona_id);
    }
  }, [personas, selectedPersonaId]);

  const listItems = useMemo(() => {
    return personas.map((p) => {
      const first = p.profile.firstName ?? 'Persona';
      const last = p.profile.lastName ?? '';
      const displayName = `${first} ${last}`.trim();
      const designation = `${p.profile.occupation ?? ''} · ${p.profile.location?.city ?? ''}${p.profile.location?.state ? ', ' + p.profile.location.state : ''}`.trim();
      return {
        personaId: p.persona_id,
        name: displayName,
        designation,
        image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=3387&q=80',
      };
    });
  }, [personas]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return listItems;
    return listItems.filter((i) =>
      i.name.toLowerCase().includes(q) || i.designation.toLowerCase().includes(q)
    );
  }, [listItems, search]);

  const selectedPersona = useMemo(() => {
    return personas.find((p) => p.persona_id === selectedPersonaId) ?? null;
  }, [personas, selectedPersonaId]);

  if (personas.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="mx-auto w-full max-w-2xl">
        <h2 className="text-lg font-medium">Your Simulated Audience</h2>

        {/* Search + List (fixed height) */}
        <div className="mt-4">
          <div className="flex items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people by name, role, or city..."
              className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="mt-4 space-y-3 overflow-auto pr-1" style={{ maxHeight: '320px' }}>
            {filtered.map((p) => (
              <Card
                key={p.personaId}
                onClick={() => setSelectedPersonaId(p.personaId)}
                className={
                  "relative border transition-all duration-100 hover:shadow-sm cursor-pointer " +
                  (selectedPersonaId === p.personaId ? 'border-primary' : 'hover:border-muted-foreground')
                }
              >
                <CardContent className="flex items-center space-x-4 p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={p.image} alt={p.name} />
                    <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground">{p.name}</div>
                    <div className="truncate text-sm text-muted-foreground">{p.designation}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Persona details below */}
        <div className="mt-8">
          {selectedPersona ? (
            <PersonaForm persona={selectedPersona} />
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default PersonaBrowser;


