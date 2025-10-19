import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function ProductPage() {
  await fetchQuery(
    api.users.viewer,
    {},
    { token: await convexAuthNextjsToken() }
  );
  return <main className="flex max-h-screen grow flex-col overflow-hidden" />;
}
