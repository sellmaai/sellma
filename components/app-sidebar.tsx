"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Rocket } from "lucide-react"
import { useQuery } from "convex/react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { api } from "@/convex/_generated/api"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const viewer = useQuery(api.users.viewer, {})

  const user = React.useMemo(
    () => ({
      name: viewer?.name ?? "",
      email: viewer?.email ?? "",
      avatar: "/avatars/shadcn.jpg",
    }),
    [viewer]
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname?.startsWith("/product/simulation")}>
                <Link href="/product/simulation">
                  <Rocket />
                  <span>Simulation</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild isActive={pathname?.startsWith("/product/simulation/audience-builder")}>
                    <Link href="/product/simulation/audience-builder">
                      <span>Audience Builder</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
