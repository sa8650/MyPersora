/**
 * Persora — Administrator login page (/admin/login).
 * Custom application-managed authentication (no third-party auth).
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
import { Lock, Mail, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json() as any;
      if (!res.ok) {
        toast({ title: "Admin login failed", description: json.error || "Invalid email or password" });
        return;
      }
      // Role is enforced by the Admin Console layout; send admins to the dashboard.
      router.replace("/admin/dashboard");
    } catch {
      toast({ title: "Admin login failed", description: "Could not reach the server." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="reui-card w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-title-2-semibold">Administrator sign-in</CardTitle>
          <CardDescription>Sign in to the Persora Admin Console.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input id="email" type="email" placeholder="admin@example.com" {...register("email")} className={cn("pl-10", errors.email ? "border-destructive" : "")} />
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
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in…" : "Sign in as administrator"}
              <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-center text-body-medium text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline font-medium">User sign-in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
