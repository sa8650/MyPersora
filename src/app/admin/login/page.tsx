/**
 * Persora — Administrator sign-in (/admin/login).
 *
 * Same custom session model as /login, but the account must carry the
 * `admin` role. The role is verified against D1 (via /api/auth/me) before
 * navigating, and again server-side by the Admin Console layout.
 */

"use client";

import * as React from "react";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

function safeCallback(raw: string | null): string {
  if (!raw) return "/admin";
  if (!raw.startsWith("/admin") || raw.startsWith("//")) return "/admin";
  if (raw === "/admin/login") return "/admin";
  return raw;
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallback(searchParams.get("callbackUrl"));
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast({
          title: "Admin sign-in failed",
          description: json.error || "Invalid email or password.",
        });
        return;
      }

      // Verify the role of the account that just authenticated.
      const me = await fetch("/api/auth/me", { cache: "no-store" });
      const meJson = (await me.json().catch(() => ({}))) as {
        user?: { role?: string };
      };
      if (!me.ok || meJson.user?.role !== "admin") {
        toast({
          title: "Not an administrator",
          description:
            "This account does not have administrator access. Signing you into the user workspace instead.",
        });
        router.replace("/overview");
        router.refresh();
        return;
      }

      toast({ title: "Administrator signed in", description: "Welcome to the Admin Console." });
      router.replace(callbackUrl);
      router.refresh();
    } catch {
      toast({ title: "Admin sign-in failed", description: "Could not reach the server." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-10">
      <Link href="/" className="mb-6 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <span className="text-headline-bold">P</span>
        </span>
        <span className="text-title-2-semibold tracking-tight text-foreground">Persora</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <CardTitle className="text-title-2-semibold">Administrator sign-in</CardTitle>
          <CardDescription>Restricted access to the Persora Admin Console.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                  className={cn("pl-10", errors.email ? "border-destructive" : "")}
                />
              </div>
              {errors.email && (
                <p className="text-caption-2-medium text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                  className={cn("pl-10 pr-10", errors.password ? "border-destructive" : "")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-caption-2-medium text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in…" : "Sign in as administrator"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-border pt-4">
          <p className="text-center text-body-medium text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:underline">
              User sign-in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
