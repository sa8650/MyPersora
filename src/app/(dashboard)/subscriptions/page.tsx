"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tag as TagIcon, Plus, Trash2, RefreshCcw, AlertCircle, DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Subscription {
  id: string;
  name: string;
  provider: string;
  category: string | null;
  amount: number;
  currency: string;
  interval: string;
  status: string;
  renewal_date: string | null;
}

function statusColor(status: string) {
  switch (status) {
    case "active": return "secondary";
    case "cancelled": return "outline";
    case "paused": return "outline";
    case "past_due": return "destructive";
    default: return "outline";
  }
}

export default function SubscriptionsPage() {
  const { toast } = useToast();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSubs = useCallback(async () => {
    try {
      const u = new URL("/api/subscriptions", window.location.origin);
      if (statusFilter) u.searchParams.set("status", statusFilter);
      const res = await fetch(u.toString()).then((r) => r.json() as any);
      setSubs(Array.isArray(res?.subscriptions) ? res.subscriptions : []);
    } catch {
      toast({ title: "Failed to load subscriptions" });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  async function deleteSub(id: string) {
    if (!window.confirm("Cancel this subscription?")) return;
    try {
      await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
      fetchSubs();
      toast({ title: "Subscription removed" });
    } catch {
      toast({ title: "Could not remove subscription" });
    }
  }

  const total = subs.filter((s) => s.status === "active").reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-display-4-bold text-foreground">Subscription Manager</h1>
          <p className="text-body-medium text-muted-foreground">
            Track recurring billing and upcoming renewals.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">{total.toFixed(2)}</div>
          <div className="text-caption-1-medium text-muted-foreground">/mo (active)</div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {["", "active", "cancelled", "paused", "past_due"].map((s) => (
          <Button key={s} variant={statusFilter === s ? "secondary" : "outline"} size="sm" onClick={() => setStatusFilter(s)}>
            {s || "All"}
          </Button>
        ))}
      </div>

      <Card className="reui-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-caption-1-medium text-muted-foreground">
                  <th className="p-4 font-medium">Subscription</th>
                  <th className="p-4 font-medium text-center hidden md:table-cell">Provider</th>
                  <th className="p-4 font-medium text-center hidden lg:table-cell">Amount</th>
                  <th className="p-4 font-medium text-center hidden lg:table-cell">Interval</th>
                  <th className="p-4 font-medium text-center">Renewal</th>
                  <th className="p-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center"><div className="reui-skeleton w-48 h-10 mx-auto" /></td></tr>
                ) : subs.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-body-medium text-muted-foreground">No subscriptions found.</td></tr>
                ) : (
                  subs.map((s) => (
                    <tr key={s.id} className="border-b border-border/50 group hover:bg-accent/50 transition-colors">
                      <td className="p-4 text-body-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <TagIcon className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-body-semibold">{s.name}</span>
                            <span className="text-caption-2-medium text-muted-foreground">{s.provider}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-body-2-medium text-center hidden md:table-cell">{s.category ?? "—"}</td>
                      <td className="p-4 text-body-2-medium text-center hidden lg:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                          <span>{s.amount.toFixed(2)} {s.currency}</span>
                        </div>
                      </td>
                      <td className="p-4 text-body-2-medium text-center hidden lg:table-cell">{s.interval}</td>
                      <td className="p-4 text-body-2-medium text-center">{s.renewal_date ?? "—"}</td>
                      <td className="p-4 text-right">
                        <Badge variant={statusColor(s.status)}>{s.status.replace("_", " ")}</Badge>
                        <div className="mt-2 flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => deleteSub(s.id)}>
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
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
