"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Calendar, Mail, User, Clock, Trash2, CheckCircle } from "lucide-react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const auth = getAuth(app);

  const fetchInquiries = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      
      // We will create an API route to fetch inquiries
      const res = await fetch("/api/admin/inquiries", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setInquiries(data.data || []);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchInquiries();
    });
    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/admin/inquiries?id=${id}`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: "read" })
      });
      if (res.ok) fetchInquiries();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/admin/inquiries?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchInquiries();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Contact Inquiries</h1>
          <p className="text-muted-foreground">Manage messages from the contact form.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
        {inquiries.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium">No inquiries found</p>
            <p className="text-muted-foreground">When customers use the contact form, their messages will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className={`p-6 transition-colors ${inquiry.status === 'new' ? 'bg-primary/5' : ''}`}>
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        {inquiry.subject}
                        {inquiry.status === 'new' && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wide">New</span>
                        )}
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5"><User className="w-4 h-4" /> {inquiry.name}</div>
                      <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> <a href={`mailto:${inquiry.email}`} className="hover:text-primary transition-colors">{inquiry.email}</a></div>
                      <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(inquiry.createdAt).toLocaleDateString()}</div>
                      <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(inquiry.createdAt).toLocaleTimeString()}</div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50 text-foreground/80 whitespace-pre-wrap text-sm leading-relaxed">
                      {inquiry.message}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center justify-end gap-3 shrink-0">
                    {inquiry.status === 'new' && (
                      <button 
                        onClick={() => markAsRead(inquiry.id)}
                        className="p-2 rounded-xl bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors tooltip-trigger"
                        title="Mark as Read"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteInquiry(inquiry.id)}
                      className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors tooltip-trigger"
                      title="Delete Inquiry"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
