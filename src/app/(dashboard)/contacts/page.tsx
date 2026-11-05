"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Users, Plus, Search, Trash2, Edit3, ChevronRight, Phone, Mail, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Contact {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  is_favorite: number;
  avatar_url: string | null;
}

export default function ContactsPage() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", company: "" });

  const fetchContacts = useCallback(async () => {
    try {
      const url = new URL("/api/contacts", window.location.origin);
      if (query) url.searchParams.set("q", query);
      const res = await fetch(url.toString()).then((r) => r.json() as any);
      setContacts(Array.isArray(res?.contacts) ? res.contacts : []);
    } catch {
      toast({ title: "Failed to load contacts" });
    } finally {
      setLoading(false);
    }
  }, [query, toast]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const filtered = contacts.filter((c) => {
    const q = query.toLowerCase();
    return !q || `${c.first_name ?? ""} ${c.last_name ?? ""} ${c.email ?? ""} ${c.company ?? ""}`.toLowerCase().includes(q);
  });

  async function createContact() {
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, email: form.email || undefined, phone: form.phone || undefined }),
      });
      if (!res.ok) throw new Error("Create failed");
      setOpen(false);
      setForm({ first_name: "", last_name: "", email: "", phone: "", company: "" });
      fetchContacts();
      toast({ title: "Contact added" });
    } catch {
      toast({ title: "Could not add contact" });
    }
  }

  async function deleteContact(id: string) {
    if (!window.confirm("Delete this contact?")) return;
    try {
      await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      fetchContacts();
      toast({ title: "Contact deleted" });
    } catch {
      toast({ title: "Could not delete contact" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-display-4-bold text-foreground">Contacts Manager</h1>
          <p className="text-body-medium text-muted-foreground">
            Store and organize your personal and professional contacts.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Add contact
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="contact-search">Search</Label>
          <Input
            id="contact-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, email, company…"
          />
        </div>
      </div>

      <Card className="reui-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-caption-1-medium text-muted-foreground">
                  <th className="p-4 font-medium">Contact</th>
                  <th className="p-4 font-medium text-center hidden md:table-cell">Company</th>
                  <th className="p-4 font-medium text-center hidden lg:table-cell">Email</th>
                  <th className="p-4 font-medium text-center hidden lg:table-cell">Phone</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center"><div className="reui-skeleton w-48 h-10 mx-auto" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-body-medium text-muted-foreground">No contacts found.</td></tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="border-b border-border/50 group hover:bg-accent/50 transition-colors">
                      <td className="p-4 text-body-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {c.avatar_url ? <AvatarImage src={c.avatar_url} /> : null}
                            <AvatarFallback>{(c.first_name ?? "?").charAt(0).toUpperCase()}{(c.last_name ?? "").charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-body-semibold">{`${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || "Unnamed contact"}</span>
                            {c.job_title && <span className="text-caption-1-medium text-muted-foreground">{c.job_title}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-body-2-medium text-center hidden md:table-cell">{c.company ?? "—"}</td>
                      <td className="p-4 text-body-2-medium text-center hidden lg:table-cell">
                        <a href={c.email ? `mailto:${c.email}` : undefined} className="text-primary hover:underline">{c.email ?? "—"}</a>
                      </td>
                      <td className="p-4 text-body-2-medium text-center hidden lg:table-cell">
                        <a href={c.phone ? `tel:${c.phone}` : undefined} className="text-primary hover:underline">{c.phone ?? "—"}</a>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center gap-2">
                          <Badge variant={c.is_favorite ? "secondary" : "outline"} className="text-xs">{c.is_favorite ? "★" : "☆"}</Badge>
                          <Button variant="ghost" size="sm" onClick={() => deleteContact(c.id)}>
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
