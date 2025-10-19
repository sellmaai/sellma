import { randomUUID } from "node:crypto";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import {
  buildBatchPersonaPrompt,
  buildPersonaPrompt,
} from "../lib/personas/prompt";
import {
  type PersonaAIOutput,
  PersistedPersona,
  TrustedPersonaSchema,
} from "../lib/personas/schemas";
import { generatePersonasFromPrompt } from "../lib/personas/aiClient";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

const PERSONA_ID_PATTERN = /^[a-z0-9_-]{3,64}$/i;

type ActionContext = Parameters<typeof getAuthUserId>[0];

const requireUserId = async (ctx: ActionContext) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Must be signed in to generate personas");
  }
  return userId;
};

const normalizeGroupId = (raw: string): string => {
  const trimmed = raw.trim();
  if (trimmed.length > 0) {
    return trimmed;
  }
  return `group-${randomUUID()}`;
};

const normalizeAudienceId = (audienceId?: string | null): string => {
  const trimmed = audienceId?.trim();
  if (trimmed && trimmed.length > 0) {
    return trimmed;
  }
  return "default";
};

const coercePersonaId = (candidate: string): string => {
  const trimmed = candidate.trim();
  if (PERSONA_ID_PATTERN.test(trimmed)) {
    return trimmed;
  }
  return `pers_${randomUUID()}`;
};

const applyTrustedMetadata = (
  persona: PersonaAIOutput,
  metadata: {
    audienceGroup: string;
    audienceId: string;
    userId: string;
  }
): PersistedPersona => {
  return TrustedPersonaSchema.parse({
    ...persona,
    personaId: coercePersonaId(persona.personaId),
    audienceGroup: metadata.audienceGroup,
    lastUpdated: new Date().toISOString(),
    audienceId: metadata.audienceId,
    userId: metadata.userId,
  });
};

export const generate = action({
  args: {
    group: v.string(),
    count: v.number(),
    audienceId: v.optional(v.string()),
    context: v.optional(
      v.object({
        location: v.optional(v.string()),
        audienceDescription: v.optional(v.string()),
        segment: v.optional(
          v.object({
            id: v.string(),
            label: v.string(),
            description: v.string(),
            color: v.optional(v.string()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const group = normalizeGroupId(args.group);
    const prompt = buildPersonaPrompt({
      group,
      count: Math.min(Math.max(args.count, 1), 10),
      context: args.context
        ? {
            location: args.context.location ?? undefined,
            audienceDescription: args.context.audienceDescription ?? undefined,
            segment: args.context.segment ?? undefined,
          }
        : undefined,
    });

    const personas = await generatePersonasFromPrompt({ prompt });

    const userId = await requireUserId(ctx);
    const audienceId = normalizeAudienceId(args.audienceId);

    const personasWithMetadata = personas.map((persona) =>
      applyTrustedMetadata(persona, {
        audienceGroup: group,
        audienceId,
        userId,
      })
    );

    return await ctx.runMutation(api.personas.saveMany, {
      personas: personasWithMetadata,
    });
  },
});

export const saveMany = mutation({
  args: {
    personas: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const table = ctx.db;
    const trustedPersonas = args.personas.map((persona) =>
      TrustedPersonaSchema.parse(persona)
    );

    const insertedIds: any[] = [];
    for (const persona of trustedPersonas) {
      const id = await table.insert("personas", persona);
      insertedIds.push(id);
    }

    const savedPersonas = await Promise.all(
      insertedIds.map((id) => table.get(id))
    );
    return savedPersonas.filter((p) => p !== null);
  },
});

export const listByGroup = query({
  args: { group: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("personas")
      .withIndex("by_group", (q) => q.eq("audienceGroup", args.group))
      .order("desc")
      .take(limit);
  },
});

export const getByPersonaId = query({
  args: { personaId: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("personas")
      .withIndex("by_persona_id", (q) => q.eq("personaId", args.personaId))
      .collect();
    return results[0] ?? null;
  },
});

export const listByAudienceId = query({
  args: { audienceId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("personas")
      .withIndex("by_audience", (q) => q.eq("audienceId", args.audienceId))
      .order("desc")
      .take(limit);
  },
});

export const generateForGroups = action({
  args: {
    groups: v.array(
      v.object({
        id: v.string(),
        label: v.string(),
        color: v.string(),
        description: v.string(),
        percent: v.optional(v.number()),
      })
    ),
    total: v.optional(v.number()),
    audienceId: v.optional(v.string()),
    context: v.optional(
      v.object({
        location: v.optional(v.string()),
        audienceDescription: v.optional(v.string()),
        segment: v.optional(
          v.object({
            id: v.string(),
            label: v.string(),
            description: v.string(),
            color: v.optional(v.string()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    if (args.groups.length === 0) {
      return [];
    }

    const userId = await requireUserId(ctx);
    const audienceId = normalizeAudienceId(args.audienceId);

    const total = Math.max(1, Math.min(args.total ?? 16, 32));

    const normalizedGroups = args.groups.map((group) => ({
      ...group,
      id: normalizeGroupId(group.id),
    }));

    const perGroupBase = Math.floor(total / normalizedGroups.length);
    const remainder = total % normalizedGroups.length;
    const distribution = normalizedGroups.map((group, index) => ({
      id: group.id,
      count: perGroupBase + (index < remainder ? 1 : 0),
    }));

    const positiveDistribution = distribution.filter((entry) => entry.count > 0);
    if (positiveDistribution.length === 0) {
      return [];
    }

    const effectiveTotal = positiveDistribution.reduce(
      (sum, entry) => sum + entry.count,
      0
    );

    const prompt = buildBatchPersonaPrompt({
      groups: positiveDistribution,
      total: effectiveTotal,
      context: args.context ?? undefined,
    });

    const personas = await generatePersonasFromPrompt({ prompt });

    const remainingByGroup = new Map(
      positiveDistribution.map((entry) => [entry.id, entry.count])
    );

    const assignGroup = (candidate: string): string => {
      const normalized = normalizeGroupId(candidate);
      const remaining = remainingByGroup.get(normalized);
      if (remaining && remaining > 0) {
        remainingByGroup.set(normalized, remaining - 1);
        return normalized;
      }
      for (const [groupId, count] of remainingByGroup.entries()) {
        if (count > 0) {
          remainingByGroup.set(groupId, count - 1);
          return groupId;
        }
      }
      return positiveDistribution[0]?.id ?? normalizeGroupId(candidate);
    };

    const personasWithMetadata = personas.map((persona) =>
      applyTrustedMetadata(persona, {
        audienceGroup: assignGroup(persona.audienceGroup),
        audienceId,
        userId,
      })
    );

    return await ctx.runMutation(api.personas.saveMany, {
      personas: personasWithMetadata,
    });
  },
});
