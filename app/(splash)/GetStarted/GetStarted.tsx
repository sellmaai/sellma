import { Button } from "@/components/ui/button";
import Link from "next/link";

export const GetStarted = () => {
  return (
    <div className="flex grow flex-col">
      <div className="container mb-20 flex grow flex-col justify-center">
        <h1 className="mb-8 mt-16 flex flex-col items-center gap-8 text-center text-6xl font-extrabold leading-none tracking-tight">
          sellma.ai
        </h1>
        <div className="mb-8 text-center text-lg text-muted-foreground">
          Stop guessing. start converting.
        </div>
        <div className="mb-16 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/product">Get Started</Link>
          </Button>
        </div>
        {/* Removed template next steps/resources for sellma.ai splash */}
      </div>
    </div>
  );
};

// Removed Resource component and external helpful resources section for sellma.ai
