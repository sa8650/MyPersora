"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface IconTileProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: number;
}

function IconTile({
  className,
  size = 36,
  children,
  ...props
}: IconTileProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border border-input bg-background transition-colors hover:bg-accent",
        className,
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      {children}
    </div>
  );
}

export { IconTile };
export type { IconTileProps };
