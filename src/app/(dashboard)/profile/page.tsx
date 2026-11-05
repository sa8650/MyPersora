"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { User, Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export default function ProfilePage() {
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string; email: string; name: string | null; role: string } | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json() as any;
          setUser(data.user);
          setName(data.user.name ?? "");
        }
      } catch {
        toast({ title: "Failed to load profile" });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  async function saveName() {
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || null }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast({ title: "Profile updated" });
      if (user) setUser({ ...user, name: name.trim() || null });
    } catch {
      toast({ title: "Could not update name" });
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="reui-skeleton w-24 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-4-bold text-foreground">Profile & Settings</h1>
        <p className="text-body-medium text-muted-foreground">
          Manage your personal account details and preferences.
        </p>
      </div>

      <Card className="reui-card max-w-md">
        <CardHeader>
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage src={user?.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name ?? user.email)}&background=random` : undefined} />
            <AvatarFallback>{(user?.name ?? user?.email ?? "U").charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-title-1-semibold">{user?.name ?? "Unknown user"}</CardTitle>
          <p className="text-caption-1-medium text-muted-foreground">{user?.email}</p>
          <span className="text-caption-2-medium text-muted-foreground">Role: {user?.role}</span>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-name">Display name</Label>
            <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <Button onClick={saveName} disabled={!user || loading} className="w-auto">
            Save changes
          </Button>
        </CardContent>
      </Card>

      <Card className="reui-card max-w-md">
        <CardHeader>
          <CardTitle className="text-title-2-semibold">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-body-medium text-foreground">Dark mode</span>
              <p className="text-caption-2-medium text-muted-foreground">Switch between light and dark themes.</p>
            </div>
            <Switch checked defaultChecked aria-label="Dark mode" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-body-medium text-foreground">Email notifications</span>
              <p className="text-caption-2-medium text-muted-foreground">Receive updates about your habits and subscriptions.</p>
            </div>
            <Switch checked defaultChecked aria-label="Email notifications" />
          </div>
        </CardContent>
      </Card>

      <Card className="reui-card max-w-md">
        <CardHeader>
          <CardTitle className="text-title-2-semibold">Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div className="flex flex-col">
              <span className="text-body-medium text-foreground">Change password</span>
              <p className="text-caption-2-medium text-muted-foreground">Update your account password.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-auto">
            Change password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
