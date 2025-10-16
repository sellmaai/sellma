"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function SimulationConfigurationPage() {
  return (
    <div className="flex grow flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Configuration</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button>Open grid</Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>Choose items</SheetTitle>
              <SheetDescription>
                Select from the grid below to configure your simulation.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <button
                  key={i}
                  className="aspect-square rounded-lg border bg-muted/30 transition hover:bg-muted"
                />
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <p className="text-sm text-muted-foreground">
        Define parameters for your simulation. Use the grid to select presets.
      </p>
    </div>
  );
}


