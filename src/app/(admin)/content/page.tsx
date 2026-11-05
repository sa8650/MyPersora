"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Globe, Edit3 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AdminContentPage() {
  const { toast } = useToast();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-4-bold text-foreground">Public Website Content</h1>
        <p className="text-body-medium text-muted-foreground">
          Manage landing page and marketing content for the public website.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "Landing Page", desc: "Hero, features and call-to-action sections.", icon: <Globe className="h-5 w-5" aria-hidden="true" /> },
          { title: "About", desc: "Company story and principles.", icon: <FileText className="h-5 w-5" aria-hidden="true" /> },
          { title: "Contact", desc: "Contact form and support details.", icon: <FileText className="h-5 w-5" aria-hidden="true" /> },
        ].map((item) => (
          <Card key={item.title} className="reui-card p-5 hover:shadow-md transition-shadow">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
              {item.icon}
            </div>
            <CardTitle className="text-title-3-semibold">{item.title}</CardTitle>
            <p className="text-body-2-medium text-muted-foreground">{item.desc}</p>
            <CardContent className="pt-4">
              <Button variant="outline" size="sm">
                <Edit3 className="h-4 w-4 mr-2" aria-hidden="true" />
                Edit content
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
