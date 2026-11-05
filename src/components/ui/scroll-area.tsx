"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("rounded-md border border-border", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Scrollbar className="h-full w-2" />
    {children}
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = ScrollAreaPrimitive.Scrollbar;
const ScrollbarThumb = ScrollAreaPrimitive.Thumb;

export { ScrollArea, ScrollBar, ScrollbarThumb };
