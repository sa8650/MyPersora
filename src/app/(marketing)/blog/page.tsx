/**
 * Persora — Blog (/blog).
 *
 * Posts are static content defined in this file: the repository has no CMS and
 * no `posts` table, so there are no individual article routes yet.
 */

import { PageShell } from "@/components/marketing/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const POSTS = [
  {
    title: "Introducing Persora",
    date: "2026-10-15",
    tag: "Product",
    excerpt:
      "Why a personal management platform needs one workspace instead of six scattered tools, and what shipped first.",
  },
  {
    title: "Custom auth without third parties",
    date: "2026-10-08",
    tag: "Engineering",
    excerpt:
      "How Persora handles accounts: bcrypt hashing, database-backed sessions, HTTP-only cookies and a role check on every administrative request.",
  },
  {
    title: "Running Next.js on Cloudflare Workers",
    date: "2026-11-05",
    tag: "Deployment",
    excerpt:
      "OpenNext, static asset serving, and the Tailwind pipeline mistake that shipped an unstyled stylesheet — and how it was fixed.",
  },
];

export default function BlogPage() {
  return (
    <PageShell
      title="Blog"
      description="Notes on the product, the engineering and the deployment of Persora."
      breadcrumb={[{ label: "Blog" }]}
      width="wide"
    >
      <div className="grid gap-5 md:grid-cols-2">
        {POSTS.map((post) => (
          <Card key={post.title} className="flex flex-col p-6">
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="secondary">{post.tag}</Badge>
              <time dateTime={post.date} className="text-caption-2-medium text-muted-foreground">
                {post.date}
              </time>
            </div>
            <h2 className="text-title-3-semibold text-foreground">{post.title}</h2>
            <p className="mt-2 flex-1 text-body-2-medium leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
            <p className="mt-4 text-caption-2-medium text-muted-foreground">
              Full articles are not published yet — this listing is static content in the
              repository.
            </p>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
