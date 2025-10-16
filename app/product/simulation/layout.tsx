import { UserMenu } from "@/components/UserMenu";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import Link from "next/link";
import type { ReactNode } from "react";

export default async function SimulationLayout({
  children,
}: {
  children: ReactNode;
}) {
  const viewer = await fetchQuery(
    api.users.viewer,
    {},
    { token: await convexAuthNextjsToken() },
  );
  return (
    <main className="flex max-h-screen grow flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-4 text-sm">
          <Link className="underline-offset-4 hover:underline" href="/product/simulation">Overview</Link>
          <Link className="underline-offset-4 hover:underline" href="/product/simulation/workflow">Workflow</Link>
        </div>
        <UserMenu>{viewer.name}</UserMenu>
      </div>
      {children}
    </main>
  );
}


