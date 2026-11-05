"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart, Plus, Trash2, RefreshCcw, AlertCircle, DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Purchase {
  id: string;
  title: string;
  description: string | null;
  brand: string | null;
  model: string | null;
  category: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  currency: string;
  warranty_months: number | null;
  warranty_expires: string | null;
}

function warrantyStatus(expires: string | null, months: number | null, purchased: string | null) {
  if (!expires) return { label: "No warranty", color: "outline" as const };
  const exp = new Date(expires);
  const now = new Date();
  const days = Math.round((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Expired", color: "destructive" as const };
  if (days <= 30) return { label: "Expiring soon", color: "outline" as const };
  return { label: "Active", color: "secondary" as const };
}

export default function PurchasesPage() {
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = useCallback(async () => {
    try {
      const res = await fetch("/api/purchases").then((r) => r.json() as any);
      setPurchases(Array.isArray(res?.purchases) ? res.purchases : []);
    } catch {
      toast({ title: "Failed to load purchases" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchPurchases(); }, [fetchPurchases]);

  async function deletePurchase(id: string) {
    if (!window.confirm("Delete this purchase record?")) return;
    try {
      await fetch(`/api/purchases/${id}`, { method: "DELETE" });
      fetchPurchases();
      toast({ title: "Purchase removed" });
    } catch {
      toast({ title: "Could not remove purchase" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-display-4-bold text-foreground">Purchases & Warranty</h1>
          <p className="text-body-medium text-muted-foreground">
            Track your purchases, receipts and warranty coverage.
          </p>
        </div>
      </div>

      <Card className="reui-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-caption-1-medium text-muted-foreground">
                  <th className="p-4 font-medium">Item</th>
                  <th className="p-4 font-medium text-center hidden md:table-cell">Brand / Model</th>
                  <th className="p-4 font-medium text-center hidden lg:table-cell">Category</th>
                  <th className="p-4 font-medium text-center">Price</th>
                  <th className="p-4 font-medium text-center">Purchased</th>
                  <th className="p-4 font-medium text-right">Warranty</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center"><div className="reui-skeleton w-48 h-10 mx-auto" /></td></tr>
                ) : purchases.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-body-medium text-muted-foreground">No purchases recorded.</td></tr>
                ) : (
                  purchases.map((p) => {
                    const { label: warrantyLabel, color } = warrantyStatus(p.warranty_expires, p.warranty_months, p.purchase_date);
                    return (
                      <tr key={p.id} className="border-b border-border/50 group hover:bg-accent/50 transition-colors">
                        <td className="p-4 text-body-medium">
                          <div className="flex flex-col">
                            <span className="text-body-semibold">{p.title}</span>
                            {p.description && <p className="text-caption-2-medium text-muted-foreground">{p.description}</p>}
                          </div>
                        </td>
                        <td className="p-4 text-body-2-medium text-center hidden md:table-cell">
                          {p.brand ?? "—"}{p.model ? ` / ${p.model}` : ""}
                        </td>
                        <td className="p-4 text-body-2-medium text-center hidden lg:table-cell">{p.category ?? "—"}</td>
                        <td className="p-4 text-body-2-medium text-center">
                          {p.purchase_price !== null ? <div className="flex items-center gap-1"><DollarSign className="h-3 w-3 text-muted-foreground" aria-hidden="true" /><span>{p.purchase_price.toFixed(2)} {p.currency}</span></div> : "—"}
                        </td>
                        <td className="p-4 text-body-2-medium text-center">{p.purchase_date ?? "—"}</td>
                        <td className="p-4 text-right">
                          <Badge variant={color}>{warrantyLabel}</Badge>
                          <div className="mt-2 flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => deletePurchase(p.id)}>
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
