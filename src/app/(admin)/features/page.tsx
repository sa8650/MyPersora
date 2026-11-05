"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Activity, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Feature {
  id: string;
  name: string;
  description: string | null;
  enabled: number;
}

export default function AdminFeaturesPage() {
  const { toast } = useToast();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const fetchFeatures = async () => {
    try {
      const res = await fetch("/api/admin/features").then((r) => r.json() as any);
      setFeatures(Array.isArray(res?.features) ? res.features : []);
    } catch {
      toast({ title: "Failed to load features" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeatures(); }, [toast]);

  async function createFeature() {
    if (!name.trim()) return;
    try {
      const res = await fetch("/api/admin/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: desc.trim() || undefined, enabled: true }),
      });
      if (!res.ok) throw new Error("Create failed");
      setName("");
      setDesc("");
      fetchFeatures();
      toast({ title: "Feature added" });
    } catch {
      toast({ title: "Could not add feature" });
    }
  }

  async function toggle(id: string, enabled: number) {
    try {
      await fetch("/api/admin/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "", enabled: enabled === 1 ? 0 : 1 }),
      });
      // Re-fetch reflects the current DB state.
      fetchFeatures();
    } catch {
      toast({ title: "Could not toggle feature" });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-4-bold text-foreground">Features & Modules</h1>
        <p className="text-body-medium text-muted-foreground">
          Activate or deactivate platform features and modules.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); createFeature(); }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <label className="text-body-medium font-medium">Feature name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Habit Tracker" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-body-medium font-medium">Description</label>
          <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Optional description" />
        </div>
        <Button type="submit" disabled={loading}>
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Add
        </Button>
      </form>

      <Card className="reui-card overflow-hidden">
        <CardHeader>
          <CardTitle className="text-title-2-semibold">Active features</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-caption-1-medium text-muted-foreground">
                  <th className="p-4 font-medium">Feature</th>
                  <th className="p-4 font-medium text-center hidden md:table-cell">Description</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center"><div className="reui-skeleton w-48 h-10 mx-auto" /></td></tr>
                ) : features.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-body-medium text-muted-foreground">No features configured.</td></tr>
                ) : (
                  features.map((f) => (
                    <tr key={f.id} className="border-b border-border/50 group hover:bg-accent/50 transition-colors">
                      <td className="p-4 text-body-medium">{f.name}</td>
                      <td className="p-4 text-body-2-medium text-center hidden md:table-cell">{f.description ?? "—"}</td>
                      <td className="p-4 text-center">
                        <Switch checked={f.enabled === 1} onCheckedChange={() => toggle(f.id, f.enabled)} />
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => toggle(f.id, f.enabled)}>
                          {f.enabled === 1 ? "Disable" : "Enable"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { /* delete */ }}>
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
