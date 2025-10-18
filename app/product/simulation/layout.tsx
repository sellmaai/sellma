import { api } from "@/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
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
      {children}
    </main>
  );
}


