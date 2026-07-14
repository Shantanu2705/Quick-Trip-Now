"use client";

import { Send } from "lucide-react";

export function ContactForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent successfully!");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-muted/30 p-8 rounded-3xl border border-border/50 shadow-sm space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
          <input required type="text" placeholder="John Doe" className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
          <input required type="email" placeholder="john@example.com" className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Subject</label>
        <input required type="text" placeholder="How can we help you?" className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Message</label>
        <textarea required rows={5} placeholder="Write your message here..." className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none" />
      </div>
      <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
        <Send className="w-5 h-5" /> Send Message
      </button>
    </form>
  );
}
