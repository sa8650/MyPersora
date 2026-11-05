/**
 * Persora — Blog page
 */

export default function BlogPage() {
  const posts = [
    { title: "Introducing Persora", date: "2026-10-15", excerpt: "A personal management platform built on Cloudflare D1 and R2." },
    { title: "Custom Auth Without Third Parties", date: "2026-10-08", excerpt: "Why we built application-managed authentication with bcrypt and sessions." },
    { title: "The ReUI Design System", date: "2026-10-01", excerpt: "Consistent tokens, typography and components across admin, user and public interfaces." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-12 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <nav className="mb-8 flex items-center gap-1 text-caption-2-medium text-muted-foreground">
        <span className="text-muted-foreground">Home</span>
        <span>/</span>
        <span className="text-foreground">Blog</span>
      </nav>
      <h1 className="text-display-4-bold text-foreground mb-8">Blog</h1>
      <div className="space-y-6">
        {posts.map((post) => (
          <article key={post.title} className="reui-card p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-title-2-semibold text-foreground mb-1">{post.title}</h2>
                <p className="text-body-medium text-muted-foreground">{post.excerpt}</p>
              </div>
              <time className="text-caption-2-medium text-muted-foreground">{post.date}</time>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
