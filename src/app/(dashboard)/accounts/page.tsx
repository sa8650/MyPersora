"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Banknote, Plus, Trash2, RefreshCcw, Globe, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Account {
  id: string;
  type: string;
  provider_name: string;
  account_name: string | null;
  account_number_masked: string | null;
  url: string | null;
  is_active: number;
}

export default function AccountsPage() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/accounts").then((r) => r.json() as any);
      setAccounts(Array.isArray(res?.accounts) ? res.accounts : []);
    } catch {
      toast({ title: "Failed to load accounts" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  async function deleteAccount(id: string) {
    if (!window.confirm("Remove this account record?")) return;
    try {
      await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      fetchAccounts();
      toast({ title: "Account removed" });
    } catch {
      toast({ title: "Could not remove account" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-display-4-bold text-foreground">Account Manager</h1>
          <p className="text-body-medium text-muted-foreground">
            Store internet and bank account records. Credentials are encrypted at rest.
          </p>
        </div>
      </div>

      <Card className="reui-card overflow-hidden">
        <CardHeader>
          <CardTitle className="text-title-2-semibold">Saved Accounts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-caption-1-medium text-muted-foreground">
                  <th className="p-4 font-medium">Provider</th>
                  <th className="p-4 font-medium text-center hidden md:table-cell">Type</th>
                  <th className="p-4 font-medium text-center hidden lg:table-cell">Account</th>
                  <th className="p-4 font-medium text-right hidden lg:table-cell">Number</th>
                  <th className="p-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center"><div className="reui-skeleton w-48 h-10 mx-auto" /></td></tr>
                ) : accounts.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-body-medium text-muted-foreground">No accounts saved.</td></tr>
                ) : (
                  accounts.map((a) => (
                    <tr key={a.id} className="border-b border-border/50 group hover:bg-accent/50 transition-colors">
                      <td className="p-4 text-body-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <Globe className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-body-semibold">{a.provider_name}</span>
                            {a.account_name && <span className="text-caption-2-medium text-muted-foreground">{a.account_name}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-body-2-medium text-center hidden md:table-cell">
                        <Badge variant="outline">{a.type}</Badge>
                      </td>
                      <td className="p-4 text-body-2-medium text-center hidden lg:table-cell">{a.account_name ?? "—"}</td>
                      <td className="p-4 text-body-2-medium text-right hidden lg:table-cell">{a.account_number_masked ?? "—"}</td>
                      <td className="p-4 text-right">
                        <Badge variant={a.is_active ? "secondary" : "outline"}>{a.is_active ? "Active" : "Inactive"}</Badge>
                        <div className="mt-2 flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => deleteAccount(a.id)}>
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
        <CardFooter className="pt-4">
          <p className="text-caption-2-medium text-muted-foreground">
            Usernames and passwords are encrypted before storage. Add new records through the account form.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
