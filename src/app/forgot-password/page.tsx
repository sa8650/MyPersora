/**
 * Persora — /forgot-password
 *
 * Requests a single-use password reset link. Delivery requires the e-mail
 * provider to be configured on the Worker (see src/lib/email.ts); when it is
 * not, the API returns a clearly labelled 503 and this page says so instead of
 * showing a fake success message.
 */

"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { Mail, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({ email: z.string().email("Enter a valid email address") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setServerError(null);
    setBlocked(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
      if (res.status === 503) {
        setBlocked(json.error ?? "Password recovery is not configured on this deployment.");
        return;
      }
      if (!res.ok) {
        setServerError(json.error ?? "Could not send the reset link.");
        return;
      }
      setSent(true);
    } catch {
      setServerError("Could not reach the server. Try again later.");
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
        <CardHeader>
          <CardTitle className="text-title-2-semibold">Reset your password</CardTitle>
          <CardDescription>
            Enter the e-mail address for your account and we&apos;ll send a single-use reset link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent && (
            <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/40 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <p className="text-body-2-medium text-foreground">
                If an account exists for that address, a reset link has been sent. The link
                expires in 30 minutes.
              </p>
            </div>
          )}

          {blocked && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-body-2-medium font-medium text-amber-900">{blocked}</p>
                <p className="text-caption-2-medium text-amber-800">
                  An administrator must set the RESEND_API_KEY and EMAIL_FROM secrets before
                  recovery links can be delivered.
                </p>
              </div>
            </div>
          )}

          {serverError && <p className="text-body-2-medium text-destructive">{serverError}</p>}

          {!sent && (
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending…" : "Send reset link"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />}
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
    </div>
  );
}
