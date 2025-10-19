import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const save = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    audienceId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if name is unique for this user
    const existing = await ctx.db
      .query("user_audiences")
      .withIndex("by_user_and_name", (q) => q.eq("userId", userId).eq("name", args.name))
      .first();

    if (existing) {
      throw new Error("An audience with this name already exists");
    }

    const now = new Date().toISOString();
    const audienceMetadataId = await ctx.db.insert("user_audiences", {
      name: args.name,
      description: args.description,
      userId,
      createdAt: now,
      updatedAt: now,
    });

    return audienceMetadataId;
  },
});

export const checkNameUniqueness = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("user_audiences")
      .withIndex("by_user_and_name", (q) => q.eq("userId", userId).eq("name", args.name))
      .first();

    return !existing; // true if name is unique
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("user_audiences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getByName = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("user_audiences")
      .withIndex("by_user_and_name", (q) => q.eq("userId", userId).eq("name", args.name))
      .first();
  },
});

export const listByUserPaginated = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const limit = args.limit ?? 5;
    const audiences = await ctx.db
      .query("user_audiences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit + 1); // Take one extra to check if there are more

    const hasMore = audiences.length > limit;
    const data = hasMore ? audiences.slice(0, limit) : audiences;
    
    return {
      data,
      hasMore,
      nextCursor: hasMore ? data[data.length - 1]?._id : null,
    };
  },
});
