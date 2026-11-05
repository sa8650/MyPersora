"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

function Icon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}

export { Icon };
export type { IconProps };
