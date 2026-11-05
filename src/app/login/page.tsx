/**
 * Persora — User sign-in page (/login).
 *
 * Custom application-managed authentication (bcrypt + D1 sessions).
 * No third-party auth providers.
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
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

/** Only allow same-origin, absolute-path redirects. */
function safeCallback(raw: string | null): string {
  if (!raw) return "/overview";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/overview";
  if (raw.startsWith("/login") || raw.startsWith("/register")) return "/overview";
  return raw;
}

/**
 * LoginForm reads search params via useSearchParams(), which requires a
 * Suspense boundary during static prerendering (Next.js 15 App Router).
 */
function LoginForm() {
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
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        user?: { role?: string };
      };
      if (!res.ok) {
        toast({
          title: "Sign-in failed",
          description: json.error || "Invalid email or password.",
        });
        return;
      }
      toast({ title: "Signed in", description: "Welcome back to Persora." });
      router.replace(callbackUrl);
      router.refresh();
    } catch {
      toast({
        title: "Sign-in failed",
        description: "Could not reach the server. Try again later.",
      });
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
          <CardTitle className="text-title-2-semibold">Welcome back</CardTitle>
          <CardDescription>Sign in to your Persora workspace.</CardDescription>
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
                  placeholder="you@example.com"
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-caption-2-medium font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
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
              {isLoading ? "Signing in…" : "Sign in"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t border-border pt-4">
          <p className="text-center text-body-medium text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
          <p className="flex items-center justify-center gap-1.5 text-center text-caption-2-medium text-muted-foreground">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
            <Link href="/admin/login" className="font-medium text-primary hover:underline">
              Administrator sign-in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
