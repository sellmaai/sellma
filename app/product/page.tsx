import { Chat } from "@/app/product/Chat/Chat";
import { ChatIntro } from "@/app/product/Chat/ChatIntro";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";

export default async function ProductPage() {
  const viewer = await fetchQuery(
    api.users.viewer,
    {},
    { token: await convexAuthNextjsToken() },
  );
  return (
    <main className="flex max-h-screen grow flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <ChatIntro />
        </div>
      </div>
      <Chat viewer={viewer._id} />
    </main>
  );
}
