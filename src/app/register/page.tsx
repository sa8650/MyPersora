/**
 * Persora — Registration page (/register).
 *
 * Custom application-managed registration: bcrypt password hashing, user
 * record in D1, and an immediate session cookie. `/signup` redirects here.
 */

"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
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
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const schema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const password = watch("password") ?? "";
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Contains a number", ok: /\d/.test(password) },
    { label: "Contains a letter", ok: /[a-zA-Z]/.test(password) },
  ];

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast({
          title: "Registration failed",
          description: json.error || "Could not create your account.",
        });
        return;
      }
      toast({ title: "Account created", description: "You are now signed in." });
      router.replace("/overview");
      router.refresh();
    } catch {
      toast({ title: "Registration failed", description: "Could not reach the server." });
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
          <CardTitle className="text-title-2-semibold">Create your account</CardTitle>
          <CardDescription>Start managing your personal data in one private workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="Your name"
                  {...register("name")}
                  aria-invalid={!!errors.name}
                  className={cn("pl-10", errors.name ? "border-destructive" : "")}
                />
              </div>
              {errors.name && (
                <p className="text-caption-2-medium text-destructive">{errors.name.message}</p>
              )}
            </div>

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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
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
              {password.length > 0 && (
                <ul className="space-y-1 pt-1">
                  {checks.map((c) => (
                    <li
                      key={c.label}
                      className={cn(
                        "flex items-center gap-1.5 text-caption-2-medium",
                        c.ok ? "text-emerald-600" : "text-muted-foreground",
                      )}
                    >
                      <Check className="h-3 w-3" aria-hidden="true" />
                      {c.label}
                    </li>
                  ))}
                </ul>
              )}
              {errors.password && (
                <p className="text-caption-2-medium text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  aria-invalid={!!errors.confirmPassword}
                  className={cn("pl-10", errors.confirmPassword ? "border-destructive" : "")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-caption-2-medium text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account…" : "Create account"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-border pt-4">
          <p className="text-center text-body-medium text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
