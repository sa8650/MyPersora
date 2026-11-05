"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, Plus, Trash2, Edit3, Search, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const u = new URL("/api/admin/users", window.location.origin);
      if (query) u.searchParams.set("q", query);
      const res = await fetch(u.toString()).then((r) => r.json() as any);
      setUsers(Array.isArray(res?.users) ? res.users : []);
    } catch {
      toast({ title: "Failed to load users" });
    } finally {
      setLoading(false);
    }
  }, [query, toast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const roleColor = (r: string): "destructive" | "secondary" =>
    r === "admin" ? "destructive" : "secondary";

  async function createUser() {
    const email = window.prompt("Email address:");
    if (!email) return;
    const password = window.prompt("Temporary password (min 8 chars):");
    if (!password) return;
    const name = window.prompt("Full name (optional):");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined, role: "user" }),
      });
      if (!res.ok) throw new Error("Create failed");
      fetchUsers();
      toast({ title: "User created" });
    } catch {
      toast({ title: "Could not create user" });
    }
  }

  async function setRole(id: string, role: string) {
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      fetchUsers();
      toast({ title: "Role updated" });
    } catch {
      toast({ title: "Could not update role" });
    }
  }

  async function removeUser(id: string) {
    if (!window.confirm("Delete this user?")) return;
    try {
      await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      fetchUsers();
      toast({ title: "User removed" });
    } catch {
      toast({ title: "Could not remove user" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-display-4-bold text-foreground">User Management</h1>
          <p className="text-body-medium text-muted-foreground">
            Create, edit and remove platform users and their roles.
          </p>
        </div>
        <Button onClick={createUser} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Add user
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by email or name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="reui-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-caption-1-medium text-muted-foreground">
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium text-center hidden md:table-cell">Role</th>
                  <th className="p-4 font-medium text-center">Joined</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center"><div className="reui-skeleton w-48 h-10 mx-auto" /></td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-body-medium text-muted-foreground">No users found.</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b border-border/50 group hover:bg-accent/50 transition-colors">
                      <td className="p-4 text-body-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                            <Users className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-body-semibold">{u.name ?? u.email}</span>
                            <span className="text-caption-2-medium text-muted-foreground">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-body-2-medium text-center hidden md:table-cell">
                        <Badge variant={roleColor(u.role)}>{u.role}</Badge>
                      </td>
                      <td className="p-4 text-body-2-medium text-center">{u.created_at}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setRole(u.id, u.role === "admin" ? "user" : "admin")}>
                            {u.role === "admin" ? "Demote" : "Promote"}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => removeUser(u.id)}>
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
