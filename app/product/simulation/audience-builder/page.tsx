'use client'

import { api } from '@/convex/_generated/api';
import { useAction } from 'convex/react';
import { useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Mic, Paperclip, Plus, Search, Send, Sparkles, Waves } from 'lucide-react';

export default function PersonaGenerationPage() {
  const suggest = useAction((api as any).audienceGroups.suggest);
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [groups, setGroups] = useState<Array<{ id: string; label: string; color: string; description: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setError(null);
    startTransition(async () => {
      // Suggest including a location in the prompt; default to a broad region if missing
      const location = extractLocationHint(message) ?? 'United States';
      try {
        const res = await suggest({ text: message, location, count: 6 });
        setGroups(res as any);
        setMessage('');
        setIsExpanded(false);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
      } catch (err: any) {
        setError(err?.message ?? 'Failed to suggest groups');
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


