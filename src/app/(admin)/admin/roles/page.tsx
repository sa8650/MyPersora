"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Lock } from "lucide-react";

export default function AdminRolesPage() {
  const roles = [
    { name: "Administrator", key: "admin", desc: "Full platform access: users, features, storage, content, settings.", icon: <Shield className="h-5 w-5" aria-hidden="true" /> },
    { name: "User", key: "user", desc: "Access to the personal workspace and all user modules.", icon: <Users className="h-5 w-5" aria-hidden="true" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-4-bold text-foreground">Roles & Access Control</h1>
        <p className="text-body-medium text-muted-foreground">
          Role-based access control (RBAC) defines what each user can do in Persora.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {roles.map((r) => (
          <Card key={r.key} className="reui-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  {r.icon}
                </div>
                <div>
                  <CardTitle className="text-title-2-semibold">{r.name}</CardTitle>
                  <span className="text-caption-2-medium text-muted-foreground">Role: {r.key}</span>
                </div>
              </div>
              <Badge variant={r.key === "admin" ? "destructive" : "secondary"}>{r.key === "admin" ? "Full access" : "Standard access"}</Badge>
            </div>
            <CardContent className="pt-4">
              <p className="text-body-medium text-muted-foreground">{r.desc}</p>
            </CardContent>
            <CardFooter className="pt-4 border-t">
              <p className="text-caption-1-medium text-muted-foreground">
                Roles are enforced on every server request against Cloudflare D1.
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="reui-card">
        <CardHeader>
          <CardTitle className="text-title-2-semibold">How RBAC works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Lock className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
            <p className="text-body-medium text-muted-foreground">
              Every protected route validates the session against D1 and checks the
              user's role before returning data. Admin routes require the
              <span className="font-medium">admin</span> role; user routes require
              a valid authenticated session.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
