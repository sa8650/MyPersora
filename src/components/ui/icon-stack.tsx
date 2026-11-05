"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

interface IconStackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: number | string;
}

function IconStack({
  className,
  size = 24,
  children,
  ...props
}: IconStackProps) {
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: typeof size === "number" ? `${size}px` : size, height: typeof size === "number" ? `${size}px` : size }}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return null;
        const offset = index * 2; // slight offset per stacked layer
        const element = child as React.ReactElement<{ className?: string }>;
        const existingClass = element.props.className ?? "";
        return React.cloneElement(element, {
          className: cn(
            "absolute inset-0",
            existingClass,
            offset > 0 ? `translate-x-[${offset}px] translate-y-[${offset}px]` : "",
          ),
        });
      })}
    </div>
  );
}

export { IconStack };
export type { IconStackProps };
