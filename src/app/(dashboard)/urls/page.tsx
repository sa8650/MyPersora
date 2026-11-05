"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Link as LinkIcon, Plus, Trash2, RefreshCcw, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface UrlItem {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category: string | null;
  tags: string[];
  is_favorite: number;
  visit_count: number;
}

export default function UrlsPage() {
  const { toast } = useToast();
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUrls = useCallback(async () => {
    try {
      const u = new URL("/api/urls", window.location.origin);
      if (categoryFilter) u.searchParams.set("category", categoryFilter);
      const res = await fetch(u.toString()).then((r) => r.json() as any);
      setUrls(Array.isArray(res?.urls) ? res.urls : []);
    } catch {
      toast({ title: "Failed to load URLs" });
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, toast]);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);

  const categories = Array.from(new Set(urls.map((u) => u.category).filter(Boolean)));

  async function deleteUrl(id: string) {
    if (!window.confirm("Delete this bookmark?")) return;
    try {
      await fetch(`/api/urls/${id}`, { method: "DELETE" });
      fetchUrls();
      toast({ title: "Bookmark deleted" });
    } catch {
      toast({ title: "Could not delete bookmark" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-display-4-bold text-foreground">URL Manager</h1>
          <p className="text-body-medium text-muted-foreground">
            Organize, categorize and favorite your bookmarks.
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button variant={categoryFilter ? "secondary" : "outline"} size="sm" onClick={() => setCategoryFilter("")}>
          All
        </Button>
        {categories.map((cat) => (
          <Button key={cat} variant={categoryFilter === cat ? "secondary" : "outline"} size="sm" onClick={() => setCategoryFilter(cat ?? "")}>
            {cat}
          </Button>
        ))}
      </div>

      <Card className="reui-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-caption-1-medium text-muted-foreground">
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium text-center hidden md:table-cell">URL</th>
                  <th className="p-4 font-medium text-center hidden lg:table-cell">Category</th>
                  <th className="p-4 font-medium text-center hidden lg:table-cell">Tags</th>
                  <th className="p-4 font-medium text-center">Visits</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center"><div className="reui-skeleton w-48 h-10 mx-auto" /></td></tr>
                ) : urls.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-body-medium text-muted-foreground">No URLs saved.</td></tr>
                ) : (
                  urls.map((u) => (
                    <tr key={u.id} className="border-b border-border/50 group hover:bg-accent/50 transition-colors">
                      <td className="p-4 text-body-medium">
                        <div className="flex items-center gap-3">
                          <a href={u.url} target="_blank" rel="noopener noreferrer" className="text-body-semibold hover:underline">
                            {u.title}
                          </a>
                          {u.is_favorite && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" aria-label="Favorite" />}
                        </div>
                        {u.description && <p className="text-caption-2-medium text-muted-foreground">{u.description}</p>}
                      </td>
                      <td className="p-4 text-body-2-medium text-center hidden md:table-cell truncate max-w-[200px]">
                        <a href={u.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{new URL(u.url).hostname}</a>
                      </td>
                      <td className="p-4 text-body-2-medium text-center hidden lg:table-cell">{u.category ?? "—"}</td>
                      <td className="p-4 text-body-2-medium text-center hidden lg:table-cell">
                        {u.tags.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>).join(" ")}
                      </td>
                      <td className="p-4 text-body-2-medium text-center">{u.visit_count}</td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => deleteUrl(u.id)}>
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
