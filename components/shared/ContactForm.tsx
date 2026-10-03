"use client";

import { Send, Loader2 } from "lucide-react";
import { useState } from "react";

export function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert("Message sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        alert("Failed to send message: " + data.message);
      }
    } catch (err) {
      alert("An error occurred while sending your message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-muted/30 p-8 rounded-3xl border border-border/50 shadow-sm space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
          <input required type="text" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
          <input required type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Subject</label>
        <input required type="text" placeholder="How can we help you?" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Message</label>
        <textarea required rows={5} placeholder="Write your message here..." value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none" />
      </div>
      <button disabled={loading} type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} 
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
