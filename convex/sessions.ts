import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

// Schema for title generation
const TitleGenerationSchema = z.object({
  title: z.string().describe("A concise, descriptive title for the session (max 50 characters)"),
  description: z.string().optional().describe("A brief description of what this session is about (max 100 characters)")
});

// Query to get the last 10 sessions for a user
export const list = query({
  args: {},
  handler: async (ctx) => {
    try {
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        console.log("No user ID found");
        return [];
      }

      console.log("Fetching sessions for user:", userId);
      const sessions = await ctx.db
        .query("sessions")
        .withIndex("by_user_and_created", (q) => q.eq("userId", userId))
        .order("desc")
        .take(10);

      console.log("Found sessions:", sessions.length);
      return sessions;
    } catch (error) {
      console.error("Error in sessions.list:", error);
      return [];
    }
  },
});

// Query to get the active session for a user
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    try {
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        console.log("No user ID found for getActive");
        return null;
      }

      console.log("Fetching active session for user:", userId);
      const activeSession = await ctx.db
        .query("sessions")
        .withIndex("by_user_and_active", (q) => 
          q.eq("userId", userId).eq("isActive", true)
        )
        .first();

      console.log("Found active session:", activeSession);
      return activeSession;
    } catch (error) {
      console.error("Error in sessions.getActive:", error);
      return null;
    }
  },
});

// Query to get a specific session by ID
export const get = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== userId) {
      return null;
    }

    return session;
  },
});

// Action to generate session title based on context
export const generateTitle = action({
  args: {
    context: v.optional(v.string()),
  },
  handler: async (ctx, { context }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const prompt = context 
      ? `Based on this context: "${context}", generate a concise session title and description for a marketing simulation session.`
      : "Generate a concise session title and description for a new marketing simulation session.";

    const result = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: TitleGenerationSchema,
      prompt,
    });

    return {
      title: result.object.title,
      description: result.object.description,
    };
  },
});

// Mutation to create a new session with auto-generated title
export const create = mutation({
  args: {
    audienceId: v.optional(v.string()),
  },
  handler: async (ctx, { audienceId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Deactivate all existing sessions for this user
    const existingSessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_and_active", (q) => 
        q.eq("userId", userId).eq("isActive", true)
      )
      .collect();

    for (const session of existingSessions) {
      await ctx.db.patch(session._id, {
        isActive: false,
        updatedAt: new Date().toISOString(),
      });
    }

    // Generate a default title for new session
    const now = new Date().toISOString();
    const sessionId = await ctx.db.insert("sessions", {
      userId,
      title: `Session ${new Date().toLocaleDateString()}`,
      description: "New marketing simulation session",
      audienceId,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    });

    return sessionId;
  },
});

// Mutation to create a new session with custom title (for backward compatibility)
export const createWithTitle = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    audienceId: v.optional(v.string()),
  },
  handler: async (ctx, { title, description, audienceId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Deactivate all existing sessions for this user
    const existingSessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_and_active", (q) => 
        q.eq("userId", userId).eq("isActive", true)
      )
      .collect();

    for (const session of existingSessions) {
      await ctx.db.patch(session._id, {
        isActive: false,
        updatedAt: new Date().toISOString(),
      });
    }

    // Create new session
    const now = new Date().toISOString();
    const sessionId = await ctx.db.insert("sessions", {
      userId,
      title,
      description,
      audienceId,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    });

    return sessionId;
  },
});

// Mutation to update a session
export const update = mutation({
  args: {
    sessionId: v.id("sessions"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    audienceId: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { sessionId, ...updates }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found or not authorized");
    }

    // If activating this session, deactivate all others
    if (updates.isActive === true) {
      const existingSessions = await ctx.db
        .query("sessions")
        .withIndex("by_user_and_active", (q) => 
          q.eq("userId", userId).eq("isActive", true)
        )
        .collect();

      for (const existingSession of existingSessions) {
        if (existingSession._id !== sessionId) {
          await ctx.db.patch(existingSession._id, {
            isActive: false,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    await ctx.db.patch(sessionId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return sessionId;
  },
});

// Mutation to delete a session
export const remove = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found or not authorized");
    }

    await ctx.db.delete(sessionId);
    return sessionId;
  },
});

// Mutation to activate a session (deactivates all others)
export const activate = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found or not authorized");
    }

    // Deactivate all existing sessions for this user
    const existingSessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_and_active", (q) => 
        q.eq("userId", userId).eq("isActive", true)
      )
      .collect();

    for (const existingSession of existingSessions) {
      await ctx.db.patch(existingSession._id, {
        isActive: false,
        updatedAt: new Date().toISOString(),
      });
    }

    // Activate the selected session
    await ctx.db.patch(sessionId, {
      isActive: true,
      updatedAt: new Date().toISOString(),
    });

    return sessionId;
  },
});
