"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard, Plus, Trash2, RefreshCcw, DollarSign, CreditCard as CardIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface WalletCard {
  id: string;
  cardholder_name: string | null;
  card_number_last4: string | null;
  brand: string | null;
  expiry_month: number | null;
  expiry_year: number | null;
  currency: string;
  type: string;
  balance: number;
  is_active: number;
}

export default function WalletPage() {
  const { toast } = useToast();
  const [cards, setCards] = useState<WalletCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch("/api/wallet-cards").then((r) => r.json() as any);
      setCards(Array.isArray(res?.cards) ? res.cards : []);
    } catch {
      toast({ title: "Failed to load wallet cards" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  async function deleteCard(id: string) {
    if (!window.confirm("Remove this card?")) return;
    try {
      await fetch(`/api/wallet-cards/${id}`, { method: "DELETE" });
      fetchCards();
      toast({ title: "Card removed" });
    } catch {
      toast({ title: "Could not remove card" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-display-4-bold text-foreground">Wallet Cards</h1>
          <p className="text-body-medium text-muted-foreground">
            Securely manage your saved payment and currency cards. Card numbers are encrypted at rest.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center py-10">
            <div className="reui-skeleton w-24 h-8" />
          </div>
        ) : cards.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-12 text-center rounded-xl border-2 border-dashed border-border bg-muted/50">
            <CreditCard className="h-10 w-10 text-muted-foreground mb-3" aria-hidden="true" />
            <h3 className="text-title-3-semibold text-foreground">No cards saved</h3>
            <p className="text-body-medium text-muted-foreground">Add your first payment or currency card.</p>
          </div>
        ) : (
          cards.map((card) => (
            <Card key={card.id} className="reui-card p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <CardIcon className="h-12 w-12" aria-hidden="true" />
              </div>
              <CardHeader className="pb-2 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-title-3-semibold text-foreground">{card.cardholder_name ?? "Personal Card"}</CardTitle>
                  <Badge variant={card.is_active ? "secondary" : "outline"} className="ml-2">{card.type}</Badge>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-title-1-bold text-foreground">{card.card_number_last4 ? `•••• •••• •••• ${card.card_number_last4}` : "•••• •••• •••• ••••"}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-2 relative z-10">
                <div className="grid grid-cols-2 gap-2 text-body-2-medium text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" aria-hidden="true" />
                    <span>{card.currency}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-caption-1-medium">Expires</span>
                    <span>{card.expiry_month && card.expiry_year ? `${String(card.expiry_month).padStart(2, "0")}/${card.expiry_year}` : "—"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-caption-1-medium">Brand</span>
                    <span>{card.brand ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-caption-1-medium">Balance</span>
                    <span>{card.balance !== undefined ? card.balance.toFixed(2) : "—"} {card.currency}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="relative z-10 pt-3">
                <Button variant="outline" size="sm" onClick={() => deleteCard(card.id)}>
                  <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                  Remove
                </Button>
              </CardFooter>
            </Card>
          )
        ))}
      </div>
    </div>
  );
}
