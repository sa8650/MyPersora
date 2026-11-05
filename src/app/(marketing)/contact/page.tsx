/**
 * Persora — Contact page
 */

import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-12 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <nav className="mb-8 flex items-center gap-1 text-caption-2-medium text-muted-foreground">
        <span className="text-muted-foreground">Home</span>
        <span>/</span>
        <span className="text-foreground">Contact</span>
      </nav>
      <h1 className="text-display-4-bold text-foreground mb-6">Contact Us</h1>
      <p className="text-body-medium text-foreground mb-6 leading-relaxed">
        Have questions about Persora, need help with your workspace, or want to
        discuss enterprise administration? Reach out and we'll get back to you.
      </p>
      <form className="space-y-4" action="#">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-body-medium font-medium">Full name</label>
            <input id="name" type="text" className="reui-input" required />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-body-medium font-medium">Email address</label>
            <input id="email" type="email" className="reui-input" required />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="subject" className="text-body-medium font-medium">Subject</label>
          <input id="subject" type="text" className="reui-input" required />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="message" className="text-body-medium font-medium">Message</label>
          <textarea id="message" rows={5} className="reui-input" required />
        </div>
        <Button type="submit">Send message</Button>
      </form>
    </div>
  );
}
