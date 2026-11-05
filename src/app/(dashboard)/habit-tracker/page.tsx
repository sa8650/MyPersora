"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Activity, Plus, Trash2, Edit3, Check, ChevronRight, RefreshCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Habit {
  id: string;
  name: string;
  description: string | null;
  frequency: string;
  target: number;
  is_active: number;
}

interface HabitEntry {
  id: string;
  habit_id: string;
  date: string;
  count: number;
  completed: number;
}

export default function HabitTrackerPage() {
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily");

  const fetchData = useCallback(async () => {
    try {
      const [hRes, eRes] = await Promise.all([
        fetch("/api/habits?active=1").then((r) => r.json() as any),
        fetch("/api/habit-entries").then((r) => r.json() as any),
      ]);
      setHabits(Array.isArray(hRes?.habits) ? hRes.habits : []);
      setEntries(Array.isArray(eRes?.entries) ? eRes.entries : []);
    } catch {
      toast({ title: "Failed to load habits", description: "Try again later." });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function createHabit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), frequency, target: 1 }),
      });
      if (!res.ok) throw new Error("Create failed");
      setName("");
      fetchData();
      toast({ title: "Habit created", description: `${name} has been added.` });
    } catch {
      toast({ title: "Could not create habit" });
    }
  }

  async function toggleEntry(habit: Habit, date: string) {
    const existing = entries.find((e) => e.habit_id === habit.id && e.date === date);
    try {
      const res = await fetch("/api/habit-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habit_id: habit.id,
          date,
          count: existing ? existing.count + 1 : 1,
          completed: true,
        }),
      });
      if (!res.ok) throw new Error("Entry failed");
      fetchData();
    } catch {
      toast({ title: "Could not log entry" });
    }
  }

  const completedToday = (habit: Habit) => {
    const today = new Date().toISOString().slice(0, 10);
    return entries.some((e) => e.habit_id === habit.id && e.date === today && e.completed === 1);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="reui-skeleton w-24 h-8" />
      </div>
    );
  }

  const freqLabel = { daily: "Daily", weekly: "Weekly", monthly: "Monthly" }[frequency];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-display-4-bold text-foreground">Habit Tracker</h1>
          <p className="text-body-medium text-muted-foreground">
            Build and track your daily routines. Mark a habit complete each day.
          </p>
        </div>
      </div>

      <form onSubmit={createHabit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="habit-name">Habit name</Label>
          <Input id="habit-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Morning walk" disabled={loading} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="habit-frequency">Frequency</Label>
          <select id="habit-frequency" value={frequency} onChange={(e) => setFrequency(e.target.value as any)} disabled={loading} className="reui-input">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <Button type="submit" disabled={loading || !name.trim()} className="md:col-span-1">
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Add habit
        </Button>
      </form>

      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
        <CardHeader className="bg-card/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-title-2-semibold">Today's Habits</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCcw className="h-4 w-4 mr-2" aria-hidden="true" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-caption-1-medium text-muted-foreground">
                  <th className="p-4 font-medium">Habit</th>
                  <th className="p-4 font-medium text-center">Frequency</th>
                  <th className="p-4 font-medium text-center">Target</th>
                  <th className="p-4 font-medium text-center">Today</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {habits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-body-medium text-muted-foreground">
                      No habits yet. Add your first habit above.
                    </td>
                  </tr>
                ) : (
                  habits.map((habit) => (
                    <tr key={habit.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                      <td className="p-4 text-body-medium">
                        <div className="flex items-center gap-2">
                          {habit.is_active ? <Activity className="h-4 w-4 text-primary" aria-hidden="true" /> : null}
                          {habit.name}
                        </div>
                        {habit.description && <p className="text-caption-2-medium text-muted-foreground">{habit.description}</p>}
                      </td>
                        <td className="p-4 text-body-2-medium text-center"><Badge variant="outline">{frequencyLabel(habit.frequency)}</Badge></td>
                      <td className="p-4 text-body-2-medium text-center">{habit.target}</td>
                      <td className="p-4 text-center">
                        <Button
                          variant={completedToday(habit) ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => toggleEntry(habit, new Date().toISOString().slice(0, 10))}
                          disabled={loading}
                        >
                          {completedToday(habit) ? (
                            <Check className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Plus className="h-4 w-4" aria-hidden="true" />
                          )}
                        </Button>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" disabled={loading}>
                          <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </div>
    </div>
  );
}

function frequencyLabel(freq: string) {
  return { daily: "Daily", weekly: "Weekly", monthly: "Monthly" }[freq] ?? freq;
}
