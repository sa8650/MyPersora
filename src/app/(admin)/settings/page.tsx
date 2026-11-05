"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Settings, Globe, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Setting {
  key: string;
  value: string;
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/settings").then((r) => r.json() as any);
        setSettings(Array.isArray(res?.settings) ? res.settings : []);
      } catch {
        toast({ title: "Failed to load settings" });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  async function update(key: string, value: string) {
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      toast({ title: "Setting saved" });
    } catch {
      toast({ title: "Could not save setting" });
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-display-4-bold text-foreground">Platform Settings</h1>
        <div className="flex items-center justify-center py-10"><div className="reui-skeleton w-24 h-8" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-4-bold text-foreground">Platform Settings</h1>
        <p className="text-body-medium text-muted-foreground">
          Configure site metadata and platform behavior.
        </p>
      </div>

      <Card className="reui-card overflow-hidden">
        <CardHeader>
          <CardTitle className="text-title-2-semibold">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(settings.find((s) => s.key === "site_name") || { key: "site_name", value: "Persora" }) && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="site-name">Site name</Label>
              <Input id="site-name" defaultValue={settings.find((s) => s.key === "site_name")?.value ?? "Persora"} onBlur={(e) => update("site_name", e.target.value)} />
            </div>
          )}
          {(settings.find((s) => s.key === "site_tagline") || { key: "site_tagline", value: "" }) && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="site-tagline">Site tagline</Label>
              <Input id="site-tagline" defaultValue={settings.find((s) => s.key === "site_tagline")?.value ?? ""} onBlur={(e) => update("site_tagline", e.target.value)} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="reui-card">
        <CardHeader>
          <CardTitle className="text-title-2-semibold">Platform behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-body-medium text-foreground">Registration enabled</span>
              <p className="text-caption-2-medium text-muted-foreground">Allow new users to create accounts.</p>
            </div>
            <Switch checked defaultChecked aria-label="Registration enabled" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-body-medium text-foreground">Maintenance mode</span>
              <p className="text-caption-2-medium text-muted-foreground">Temporarily take the platform offline.</p>
            </div>
            <Switch aria-label="Maintenance mode" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
