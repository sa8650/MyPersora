"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity, Users, CreditCard, Link, Banknote, Tag, ShoppingCart, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Stat {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: "default" | "primary" | "destructive";
}

const STATS: Stat[] = [
  { label: "Active Habits", value: "--", icon: Activity, color: "primary" },
  { label: "Contacts", value: "--", icon: Users, color: "default" },
  { label: "Wallet Cards", value: "--", icon: CreditCard, color: "default" },
  { label: "Subscriptions", value: "--", icon: Tag, color: "default" },
];

export default function OverviewPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [habits, contacts, cards, subs] = await Promise.allSettled([
          fetch("/api/habits?active=1").then((r) => r.json() as any),
          fetch("/api/contacts").then((r) => r.json() as any),
          fetch("/api/wallet-cards").then((r) => r.json() as any),
          fetch("/api/subscriptions?status=active").then((r) => r.json() as any),
        ]);
        if (cancelled) return;
        const count = (res: PromiseSettledResult<any>) =>
          res.status === "fulfilled" && Array.isArray(res.value?.habits ?? res.value?.contacts ?? res.value?.cards ?? res.value?.subscriptions)
            ? (res.value.habits ?? res.value.contacts ?? res.value.cards ?? res.value.subscriptions).length
            : 0;
        setStats({
          habits: count(habits),
          contacts: count(contacts),
          cards: count(cards),
          subs: count(subs),
        });
      } catch {
        toast({ title: "Unable to load dashboard", description: "Check your connection and try again." });
      } finally {
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [toast]);

  const statFor = (key: string) => {
    const map: Record<string, string | number> = {
      "Active Habits": stats.habits ?? "--",
      Contacts: stats.contacts ?? "--",
      "Wallet Cards": stats.cards ?? "--",
      Subscriptions: stats.subs ?? "--",
    };
    return map[key] ?? "--";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-4-bold text-foreground">Overview</h1>
        <p className="text-body-medium text-muted-foreground">
          Your personal management workspace. Pick a module from the sidebar to begin.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <Card key={stat.label} className={cn("reui-card", stat.color === "primary" ? "border-primary/30" : "")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-body-2-medium">{stat.label}</CardTitle>
              <Badge variant={stat.color === "destructive" ? "destructive" : "outline"}>
                {statFor(stat.label)}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{statFor(stat.label)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: "Habit Tracker", href: "/dashboard/habit-tracker", icon: Activity, desc: "Build and track daily routines." },
          { label: "Contacts Manager", href: "/dashboard/contacts", icon: Users, desc: "Google Contacts-style address book." },
          { label: "Wallet Cards", href: "/dashboard/wallet", icon: CreditCard, desc: "Securely saved payment cards." },
          { label: "URL Manager", href: "/dashboard/urls", icon: Link, desc: "Organize your bookmarks." },
          { label: "Account Manager", href: "/dashboard/accounts", icon: Banknote, desc: "Internet and bank records." },
          { label: "Subscriptions", href: "/dashboard/subscriptions", icon: Tag, desc: "Recurring billing overview." },
          { label: "Purchases & Warranty", href: "/dashboard/purchases", icon: ShoppingCart, desc: "Track purchases and warranties." },
        ].map((module) => (
          <Card key={module.label} className="reui-card hover:shadow-md transition-shadow cursor-pointer" onClick={() => { window.location.href = module.href; }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") window.location.href = module.href; }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-title-3-semibold">{module.label}</CardTitle>
              <CardDescription>{module.desc}</CardDescription>
            </CardHeader>
            <CardFooter>
              <module.icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </CardFooter>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <span className="sr-only">Loading</span>
          <div className="reui-skeleton w-24 h-8" />
        </div>
      )}
    </div>
  );
}
