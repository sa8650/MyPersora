"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, Activity, CreditCard, Tag, ShoppingCart, Link, Banknote
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Stat {
  label: string;
  value: string | number;
  icon: React.ElementType;
}

const STATS: Stat[] = [
  { label: "Total Users", value: "--", icon: Users },
  { label: "Active Habits", value: "--", icon: Activity },
  { label: "Contacts", value: "--", icon: Users },
  { label: "Wallet Cards", value: "--", icon: CreditCard },
  { label: "Subscriptions", value: "--", icon: Tag },
  { label: "Purchases", value: "--", icon: ShoppingCart },
];

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const counts: Record<string, number> = {};
        await Promise.all(STATS.map(async (s) => {
          let res;
          switch (s.label) {
            case "Total Users": res = await fetch("/api/admin/users").then((r) => r.json() as any); break;
            case "Active Habits": res = await fetch("/api/habits?active=1").then((r) => r.json() as any); break;
            case "Contacts": res = await fetch("/api/contacts").then((r) => r.json() as any); break;
            case "Wallet Cards": res = await fetch("/api/wallet-cards").then((r) => r.json() as any); break;
            case "Subscriptions": res = await fetch("/api/subscriptions").then((r) => r.json() as any); break;
            case "Purchases": res = await fetch("/api/purchases").then((r) => r.json() as any); break;
          }
          const key = s.label === "Total Users" ? "users" : s.label === "Active Habits" ? "habits" : s.label === "Contacts" ? "contacts" : s.label === "Wallet Cards" ? "cards" : s.label === "Subscriptions" ? "subscriptions" : "purchases";
          counts[key] = Array.isArray(res?.[key]) ? res[key].length : 0;
        }));
        setStats(counts);
      } catch {
        toast({ title: "Failed to load admin dashboard" });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-display-4-bold text-foreground">Admin Dashboard</h1>
        <div className="flex items-center justify-center py-10"><div className="reui-skeleton w-24 h-8" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-4-bold text-foreground">Admin Dashboard</h1>
        <p className="text-body-medium text-muted-foreground">
          Platform administration overview. Manage users, features, storage and settings from the sidebar.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {STATS.map((stat) => {
          const map: Record<string, number> = {
            "Total Users": stats.users ?? 0,
            "Active Habits": stats.habits ?? 0,
            Contacts: stats.contacts ?? 0,
            "Wallet Cards": stats.cards ?? 0,
            Subscriptions: stats.subscriptions ?? 0,
            Purchases: stats.purchases ?? 0,
          };
          return (
            <Card key={stat.label} className="reui-card p-5">
              <CardHeader className="pb-2 flex items-center justify-between">
                <CardTitle className="text-body-2-medium">{stat.label}</CardTitle>
                <stat.icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{map[stat.label] ?? "--"}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "User Management", href: "/admin/users", desc: "Create, edit and remove platform users.", icon: Users },
          { title: "Roles & Access", href: "/admin/roles", desc: "Role-based access control configuration.", icon: ShieldIcon },
          { title: "Features & Modules", href: "/admin/features", desc: "Activate/deactivate platform features.", icon: Activity },
          { title: "Database & R2 Storage", href: "/admin/storage", desc: "Database tables and object storage overview.", icon: DatabaseIcon },
          { title: "Public Website Content", href: "/admin/content", desc: "Manage landing page and marketing content.", icon: FileIcon },
          { title: "Platform Settings", href: "/admin/settings", desc: "Site name, tagline, registration and maintenance.", icon: SettingsIcon },
        ].map((item) => (
          <Card key={item.title} className="reui-card hover:shadow-md transition-shadow cursor-pointer" onClick={() => { window.location.href = item.href; }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") window.location.href = item.href; }}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <item.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="text-title-3-semibold">{item.title}</h3>
              </div>
              <p className="text-body-2-medium text-muted-foreground">{item.desc}</p>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ShieldIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>); }
function DatabaseIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="22" height="12" x="1" y="10" rx="2" ry="2"/><path d="M1 14h22"/><path d="M4 18h16"/><path d="M1 10h22"/><path d="M4 14h16"/></svg>); }
function FileIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 16 15 16 9"/></svg>); }
function SettingsIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09A1.65 1.65 0 0 0 19.4 5a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09A1.65 1.65 0 0 0 19.4 15"/></svg>); }
