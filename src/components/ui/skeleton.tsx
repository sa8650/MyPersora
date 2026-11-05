"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "text";
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const base = "animate-skeleton-pulse rounded-md bg-muted";
    const variants = {
      default: "h-4 w-full",
      circular: "h-10 w-10 rounded-full",
      text: "h-3 w-full",
    };
    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading content"
        className={cn(base, variants[variant], className)}
        {...props}
      />
    );
  },
);
Skeleton.displayName = "Skeleton";

export { Skeleton };
