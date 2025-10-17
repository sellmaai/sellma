import { api } from '@/convex/_generated/api';
import { fetchAction } from 'convex/nextjs';
import { useState, useTransition } from 'react';

export default function PersonaGenerationPage() {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isPending, startTransition] = useTransition();
  const [groups, setGroups] = useState<Array<{ id: string; label: string; color: string; description: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetchAction((api as any).personaGroups.suggest, {
          text: description,
          location,
          count: 6,
        });
        setGroups(res);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to suggest groups');
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Describe your audience</h1>
        <p className="text-muted-foreground">Well suggest 4	6 subsegments and generate personas.</p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Audience description</label>
          <textarea
            className="w-full rounded border p-2"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Young professionals seeking eco-friendly commuting options"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            className="w-full rounded border p-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Austin, TX"
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {isPending ? 'Thinking…' : 'Suggest Groups'}
          </button>
        </div>
      </form>

      {error ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : null}

      {groups.length > 0 && (
        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-medium">Suggested groups</h2>
          <div className="flex flex-wrap gap-3">
            {groups.map((g) => (
              <span
                key={g.id}
                style={{ backgroundColor: g.color }}
                className="inline-flex items-center gap-2 rounded px-3 py-1 text-white"
                title={g.description}
              >
                <span className="font-medium">{g.label}</span>
                <span className="opacity-80 text-xs">{g.id}</span>
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


