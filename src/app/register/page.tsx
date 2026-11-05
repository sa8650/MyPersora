/**
 * Persora — User registration page (/register).
 * Custom application-managed registration (no third-party auth).
 */

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json() as any;
      if (!res.ok) {
        toast({ title: "Registration failed", description: json.error || "Could not create account" });
        return;
      }
      toast({ title: "Account created", description: "You are now signed in." });
      router.replace("/dashboard");
    } catch {
      toast({ title: "Registration failed", description: "Could not reach the server." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="reui-card w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-title-2-semibold">Create an account</CardTitle>
          <CardDescription>Join Persora and start managing your personal data.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input id="name" placeholder="Your name" {...register("name")} className={cn("pl-10", errors.name ? "border-destructive" : "")} />
                {errors.name && <p className="text-caption-2 text-destructive mt-1">{errors.name.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input id="email" type="email" placeholder="you@example.com" {...register("email")} className={cn("pl-10", errors.email ? "border-destructive" : "")} />
                {errors.email && <p className="text-caption-2 text-destructive mt-1">{errors.email.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input id="password" type="password" {...register("password")} className={cn("pl-10", errors.password ? "border-destructive" : "")} />
                {errors.password && <p className="text-caption-2 text-destructive mt-1">{errors.password.message}</p>}
              </div>
              <p className="text-caption-2 text-muted-foreground">At least 8 characters.</p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account…" : "Create account"}
              <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-center text-body-medium text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
