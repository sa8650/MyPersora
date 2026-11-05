"use client";

import { ToastProvider } from "@/components/ui/use-toast";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <ToastProvider>{children}</ToastProvider>
    </NextThemesProvider>
  );
}
