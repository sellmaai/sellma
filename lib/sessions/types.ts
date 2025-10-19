import { Id } from "@/convex/_generated/dataModel";

export interface Session {
  _id: Id<"sessions">;
  userId: Id<"users">;
  title: string;
  description?: string;
  audienceId?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CreateSessionInput {
  title: string;
  description?: string;
  audienceId?: string;
}

export interface UpdateSessionInput {
  title?: string;
  description?: string;
  audienceId?: string;
  isActive?: boolean;
}
