"use client";

import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </ConvexClientProvider>
  );
}
