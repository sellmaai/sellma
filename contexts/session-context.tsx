"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Session, CreateSessionInput } from "@/lib/sessions/types";

interface SessionContextType {
  sessions: Session[] | undefined;
  activeSession: Session | undefined;
  isLoading: boolean;
  createSession: (input?: CreateSessionInput) => Promise<Id<"sessions">>;
  createSessionWithContext: (context?: string) => Promise<Id<"sessions">>;
  generateTitle: (context?: string) => Promise<{ title: string; description?: string }>;
  activateSession: (sessionId: Id<"sessions">) => Promise<void>;
  updateSession: (sessionId: Id<"sessions">, updates: Partial<Session>) => Promise<void>;
  deleteSession: (sessionId: Id<"sessions">) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const sessions = useQuery(api.sessions.list);
  const activeSession = useQuery(api.sessions.getActive);
  const createSessionMutation = useMutation(api.sessions.create);
  const createSessionWithTitleMutation = useMutation(api.sessions.createWithTitle);
  const generateTitleAction = useAction(api.sessions.generateTitle);
  const activateSessionMutation = useMutation(api.sessions.activate);
  const updateSessionMutation = useMutation(api.sessions.update);
  const deleteSessionMutation = useMutation(api.sessions.remove);

  // Error handling
  if (sessions === "error") {
    console.error("Failed to load sessions:", sessions);
  }
  if (activeSession === "error") {
    console.error("Failed to load active session:", activeSession);
  }

  // Debug logging
  console.log("SessionProvider - sessions:", sessions);
  console.log("SessionProvider - activeSession:", activeSession);
  console.log("SessionProvider - isLoading:", sessions === undefined || activeSession === undefined);

  const createSession = useCallback(
    async (input?: CreateSessionInput) => {
      if (input) {
        return await createSessionWithTitleMutation(input);
      }
      return await createSessionMutation({});
    },
    [createSessionMutation, createSessionWithTitleMutation]
  );

  const createSessionWithContext = useCallback(
    async (context?: string) => {
      // Generate title based on context
      const titleData = await generateTitleAction({ context });
      
      // Create session with generated title
      return await createSessionWithTitleMutation({
        title: titleData.title,
        description: titleData.description,
      });
    },
    [generateTitleAction, createSessionWithTitleMutation]
  );

  const generateTitle = useCallback(
    async (context?: string) => {
      return await generateTitleAction({ context });
    },
    [generateTitleAction]
  );

  const activateSession = useCallback(
    async (sessionId: Id<"sessions">) => {
      await activateSessionMutation({ sessionId });
    },
    [activateSessionMutation]
  );

  const updateSession = useCallback(
    async (sessionId: Id<"sessions">, updates: Partial<Session>) => {
      await updateSessionMutation({
        sessionId,
        ...updates,
      });
    },
    [updateSessionMutation]
  );

  const deleteSession = useCallback(
    async (sessionId: Id<"sessions">) => {
      await deleteSessionMutation({ sessionId });
    },
    [deleteSessionMutation]
  );

  const value: SessionContextType = {
    sessions,
    activeSession,
    isLoading: sessions === undefined || activeSession === undefined,
    createSession,
    createSessionWithContext,
    generateTitle,
    activateSession,
    updateSession,
    deleteSession,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
