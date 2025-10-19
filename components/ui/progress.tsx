"use client";

import { Progress as ProgressPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

const Progress = ({
  className,
  value,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
  ref?: React.RefObject<React.ElementRef<typeof ProgressPrimitive.Root> | null>;
}) => (
  <ProgressPrimitive.Root
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    ref={ref}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
