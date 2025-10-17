'use client'

import { api } from '@/convex/_generated/api';
import { useAction } from 'convex/react';
import { useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Mic,Search, Send, Sparkles, Waves } from 'lucide-react';
import { AnimatedTooltip } from '@/components/ui/shadcn-io/animated-tooltip';
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from '@/components/ai-elements/chain-of-thought';

export default function AudienceGenerationPage() {
  const suggest = useAction((api as any).audienceGroups.suggest);
  const generate = useAction((api as any).personas.generate);
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [groups, setGroups] = useState<Array<{ id: string; label: string; color: string; description: string }>>([]);
  const [people, setPeople] = useState<Array<{ id: number; name: string; designation: string; image: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [groupSuggestStatus, setGroupSuggestStatus] = useState<'pending' | 'active' | 'complete'>('pending');
  const [perGroupStatus, setPerGroupStatus] = useState<Record<string, 'pending' | 'active' | 'complete'>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setError(null);
    setIsThinking(true);
    setGroupSuggestStatus('active');
    setPerGroupStatus({});
    setGroups([]);
    setPeople([]);
    startTransition(async () => {
      // Suggest including a location in the prompt; default to a broad region if missing
      const location = extractLocationHint(message) ?? 'United States';
      try {
        const res = (await suggest({ text: message, location, count: 6 })) as any[];
        setGroups(res as any);
        setGroupSuggestStatus('complete');
        setPerGroupStatus(Object.fromEntries((res as any[]).map((g: any) => [g.id, 'pending'])));

        // Kick off persona generation per group with progressive updates
        (res as any[]).forEach((g: any, idx: number) => {
          setPerGroupStatus((prev) => ({ ...prev, [g.id]: 'active' }));
          generate({ group: g.id, count: 1, context: { location } })
            .then((arr: any[]) => {
              const p = arr?.[0];
              if (p) {
                setPeople((prev) => [
                  ...prev,
                  {
                    id: prev.length + 1,
                    name: `${p?.profile?.firstName ?? 'Persona'} ${p?.profile?.lastName ?? ''}`.trim(),
                    designation: `${p?.profile?.occupation ?? ''} · ${p?.profile?.location?.city ?? ''}${p?.profile?.location?.state ? ', ' + p.profile.location.state : ''}`.trim(),
                    image:
                      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=3387&q=80',
                  },
                ]);
              }
            })
            .catch(() => {
              // noop: keep UX flowing; we could surface per-group errors later if desired
            })
            .finally(() => {
              setPerGroupStatus((prev) => ({ ...prev, [g.id]: 'complete' }));
            });
        });
        setMessage('');
        setIsExpanded(false);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
      } catch (err: any) {
        setError(err?.message ?? 'Failed to suggest groups');
        setGroupSuggestStatus('complete');
      }
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    setIsExpanded(e.target.value.length > 100 || e.target.value.includes('\n'));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  function extractLocationHint(text: string): string | null {
    // Very lightweight heuristic; users are encouraged (placeholder) to include a location
    // Look for patterns like "in City, ST" or trailing "- City, ST"
    const match = text.match(/\bin\s+([A-Z][A-Za-z\s]+,\s*[A-Z]{2})\b/) || text.match(/-\s*([A-Z][A-Za-z\s]+,\s*[A-Z]{2})$/);
    return match ? match[1].trim() : null;
  }

  return (
    <div className="w-full p-6">
      <h1 className="mb-7 mx-auto max-w-2xl text-center text-2xl font-semibold leading-9 text-foreground px-1 text-pretty whitespace-pre-wrap">
        Describe Your Target Audience
      </h1>

      <form onSubmit={handleSubmit} className="group/composer w-full">
        <input ref={fileInputRef} type="file" multiple className="sr-only" onChange={() => {}} />

        <div
          className={cn(
            'w-full max-w-2xl mx-auto bg-transparent dark:bg-muted/50 cursor-text overflow-clip bg-clip-padding p-2.5 shadow-lg border border-border transition-all duration-200',
            {
              'rounded-3xl grid grid-cols-1 grid-rows-[auto_1fr_auto]': isExpanded,
              'rounded-[28px] grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto]': !isExpanded,
            }
          )}
          style={{
            gridTemplateAreas: isExpanded
              ? "'header' 'primary' 'footer'"
              : "'header header header' 'leading primary trailing' '. footer .'",
          }}
        >
          <div
            className={cn('flex min-h-14 items-center overflow-x-hidden px-1.5', {
              'px-2 py-1 mb-0': isExpanded,
              '-my-2.5': !isExpanded,
            })}
            style={{ gridArea: 'primary' }}
          >
            <div className="flex-1 overflow-auto max-h-52">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Describe your audience (add a location, e.g., Austin, TX)"
                className="min-h-0 resize-none rounded-none border-0 p-0 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 scrollbar-thin dark:bg-transparent"
                rows={1}
              />
            </div>
          </div>
          <div className="flex items-center gap-2" style={{ gridArea: isExpanded ? 'footer' : 'trailing' }}>
            <div className="ms-auto flex items-center gap-1.5">
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-accent">
                <Mic className="size-5 text-muted-foreground" />
              </Button>

              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-accent relative">
                <Waves className="size-5 text-muted-foreground" />
              </Button>

              {message.trim() && (
                <Button type="submit" disabled={isPending} size="icon" className="h-9 w-9 rounded-full">
                  <Send className="size-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {groups.length > 0 && (
        <section className="mt-8 space-y-6">
          {people.length > 0 && (
            <div className="flex flex-row items-center justify-center w-full">
              <AnimatedTooltip items={people} />
            </div>
          )}
        </section>
      )}
    </div>
  );
}


