"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database, Save, Layers, HardDrive, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export default function AdminStoragePage() {
  const { toast } = useToast();
  const [db, setDb] = useState<Record<string, number>>({});
  const [r2, setR2] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/storage").then((r) => r.json() as any);
        setDb(res?.database ?? {});
        setR2(res?.r2 ?? {});
      } catch {
        toast({ title: "Failed to load storage overview" });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const rows = [
    { label: "Users", key: "users", icon: <Activity className="h-4 w-4" aria-hidden="true" /> },
    { label: "Sessions", key: "sessions", icon: <Save className="h-4 w-4" aria-hidden="true" /> },
    { label: "Habits", key: "habits", icon: <Activity className="h-4 w-4" aria-hidden="true" /> },
    { label: "Contacts", key: "contacts", icon: <Layers className="h-4 w-4" aria-hidden="true" /> },
    { label: "Wallet Cards", key: "wallet_cards", icon: <HardDrive className="h-4 w-4" aria-hidden="true" /> },
    { label: "URLs", key: "urls", icon: <Activity className="h-4 w-4" aria-hidden="true" /> },
    { label: "Accounts", key: "accounts", icon: <HardDrive className="h-4 w-4" aria-hidden="true" /> },
    { label: "Subscriptions", key: "subscriptions", icon: <Activity className="h-4 w-4" aria-hidden="true" /> },
    { label: "Purchases", key: "purchases", icon: <HardDrive className="h-4 w-4" aria-hidden="true" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-4-bold text-foreground">Database & R2 Storage</h1>
        <p className="text-body-medium text-muted-foreground">
          Overview of D1 database tables and R2 object storage usage.
        </p>
      </div>

      <Card className="reui-card overflow-hidden">
        <CardHeader>
          <CardTitle className="text-title-2-semibold">D1 Database tables</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-caption-1-medium text-muted-foreground">
                  <th className="p-4 font-medium">Table</th>
                  <th className="p-4 font-medium text-right">Rows</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={2} className="p-8 text-center"><div className="reui-skeleton w-48 h-10 mx-auto" /></td></tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.label} className="border-b border-border/50">
                      <td className="p-4 text-body-medium">
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">{r.icon}</span>
                          {r.label}
                        </div>
                      </td>
                      <td className="p-4 text-body-2-medium text-right">{db[r.key] ?? "—"}</td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="reui-card">
        <CardHeader>
          <CardTitle className="text-title-2-semibold">R2 Object Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Save className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-body-semibold text-foreground">Sample objects</span>
              <p className="text-caption-2-medium text-muted-foreground">First 5 objects in the configured R2 bucket.</p>
            </div>
          </div>
          {loading ? (
            <div className="mt-4 flex items-center justify-center py-4"><div className="reui-skeleton w-24 h-8" /></div>
          ) : r2.error ? (
            <p className="mt-4 text-body-medium text-muted-foreground">{r2.error}</p>
          ) : (
            <div className="mt-4 space-y-2">
              {(r2.sampleObjects ?? []).map((o: any) => (
                <div key={o.key} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50">
                  <span className="text-body-medium text-foreground truncate">{o.key}</span>
                  <span className="text-caption-2-medium text-muted-foreground">{o.size} bytes</span>
                </div>
              ))}
              {(r2.sampleObjects ?? []).length === 0 && <p className="text-body-medium text-muted-foreground">No objects in bucket.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
