"use client";

import * as React from "react";
import NextLink from "next/link";
import { cn } from "@/lib/utils";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

export function Link({ className, href, children, ...props }: LinkProps) {
  return (
    <NextLink
      href={href}
      className={cn(
        "text-primary underline-offset-4 hover:underline transition-colors",
        className,
      )}
      {...props}
    >
      {children}
    </NextLink>
  );
}
