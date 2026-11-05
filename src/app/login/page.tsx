/**
 * Persora — User login page (/login).
 * Custom application-managed authentication (no third-party auth).
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
import { Lock, Mail, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

/**
 * LoginForm reads search params via useSearchParams(), which requires a
 * Suspense boundary during static prerendering (Next.js 15 App Router).
 */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
      const json = await res.json() as any;
      if (!res.ok) {
        toast({
          title: "Login failed",
          description: json.error || "Invalid email or password",
        });
        return;
      }
      router.replace(callbackUrl);
    } catch {
      toast({
        title: "Login failed",
        description: "Could not reach the server. Try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="reui-card w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-title-2-semibold">Welcome back</CardTitle>
          <CardDescription>Sign in to your Persora workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className={cn(
                    "pl-10",
                    errors.email ? "border-destructive" : ""
                  )}
                />
                {errors.email && (
                  <p className="text-caption-2 text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className={cn(
                    "pl-10",
                    errors.password ? "border-destructive" : ""
                  )}
                />
                {errors.password && (
                  <p className="text-caption-2 text-destructive mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in…" : "Sign in"}
              <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-center text-body-medium text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              Create an account
            </Link>
          </p>
          <p className="text-center text-body-medium text-muted-foreground">
            <Link
              href="/admin/login"
              className="text-primary hover:underline font-medium"
            >
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
