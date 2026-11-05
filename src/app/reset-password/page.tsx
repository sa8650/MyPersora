/**
 * Persora — /reset-password?token=…
 *
 * Completes password recovery. The token is single-use, hashed at rest and
 * expires after 30 minutes; a successful reset revokes all existing sessions.
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
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormData = z.infer<typeof schema>;

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Could not reset the password.");
        return;
      }
      setDone(true);
      setTimeout(() => router.replace("/login"), 2500);
    } catch {
      setError("Could not reach the server. Try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-title-2-semibold">Reset link required</CardTitle>
          <CardDescription>
            Open the reset link from your e-mail, or request a new one.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/forgot-password">Request a new link</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-title-2-semibold">Choose a new password</CardTitle>
        <CardDescription>
          After saving, all existing sessions are signed out and you can sign in with the new
          password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {done ? (
          <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/40 p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <p className="text-body-2-medium text-foreground">
              Password updated. Redirecting you to sign in…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("password")}
                  className={cn("pl-10 pr-10", errors.password ? "border-destructive" : "")}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-caption-2-medium text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type={show ? "text" : "password"}
                autoComplete="new-password"
                {...register("confirmPassword")}
                className={cn(errors.confirmPassword ? "border-destructive" : "")}
              />
              {errors.confirmPassword && (
                <p className="text-caption-2-medium text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            {error && <p className="text-body-2-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving…" : "Save new password"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="justify-center border-t border-border pt-4">
        <p className="text-body-medium text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-10">
      <Link href="/" className="mb-6 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <span className="text-headline-bold">P</span>
        </span>
        <span className="text-title-2-semibold tracking-tight text-foreground">Persora</span>
      </Link>
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
