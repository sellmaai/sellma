"use client";

import { Plus, MessageSquare, MoreHorizontal, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSession } from "@/contexts/session-context";
import { Id } from "@/convex/_generated/dataModel";

export function NavSessions() {
  const { isMobile } = useSidebar();
  const { sessions, activeSession, createSession, activateSession, deleteSession } = useSession();
  const router = useRouter();

  // Debug logging
  console.log("NavSessions - sessions:", sessions);
  console.log("NavSessions - activeSession:", activeSession);

  const handleCreateSession = () => {
    console.log("Start New Session clicked");
    // Always allow navigation - no need to disable button
    router.push("/product/simulation/audience-builder");
  };

  const handleActivateSession = async (sessionId: Id<"sessions">) => {
    try {
      await activateSession(sessionId);
    } catch (error) {
      console.error("Failed to activate session:", error);
    }
  };

  const handleDeleteSession = async (sessionId: Id<"sessions">) => {
    try {
      await deleteSession(sessionId);
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Sessions</SidebarGroupLabel>
      <SidebarMenu>
        {/* Start New Session Button */}
        <SidebarMenuItem>
          <SidebarMenuButton onClick={handleCreateSession} className="hover:bg-sidebar-accent">
            <Plus />
            <span>Start New Session</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Past Sessions */}
        {sessions?.map((session) => (
          <SidebarMenuItem key={session._id}>
            <SidebarMenuButton
              asChild
              isActive={activeSession?._id === session._id}
              onClick={() => handleActivateSession(session._id)}
            >
              <button className="w-full">
                <MessageSquare />
                <span className="truncate">{session.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                </span>
              </button>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem
                  onClick={() => handleActivateSession(session._id)}
                  disabled={activeSession?._id === session._id}
                >
                  <MessageSquare />
                  {activeSession?._id === session._id ? "Active" : "Activate"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteSession(session._id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}

        {/* Empty State */}
        {sessions && sessions.length === 0 && (
          <SidebarMenuItem>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No sessions yet
              </p>
              <p className="text-xs text-muted-foreground">
                Start a new session to begin
              </p>
            </div>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
