"use client";

import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { SessionProvider } from "@/contexts/session-context";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function ProductLayout({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <SessionProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </SessionProvider>
    </ConvexClientProvider>
  );
}
