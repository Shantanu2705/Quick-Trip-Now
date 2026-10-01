"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, MonitorPlay, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminHowToUsePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      
      const res = await fetch("/api/admin/how-to-use", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error("Error fetching how-to-use items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchItems();
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !videoUrl) return alert("Please fill in all fields.");
    
    setSubmitting(true);
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const res = await fetch("/api/admin/how-to-use", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, videoUrl })
      });
      
      const data = await res.json();
      if (data.success) {
        setTitle("");
        setVideoUrl("");
        fetchItems();
      } else {
        alert("Error adding item: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const res = await fetch(`/api/admin/how-to-use?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.success) {
        fetchItems();
      } else {
        alert("Error deleting item: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">How to Use</h1>
        <p className="text-muted-foreground">Manage video tutorials and guides for users.</p>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add New Section
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-sm font-medium">Section Title (e.g. How to Login)</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title" 
                className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>
            <div className="flex-1 w-full space-y-2">
              <label className="text-sm font-medium">Video URL (e.g. YouTube Link)</label>
              <input 
                type="url" 
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/..." 
                className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={submitting}
              className="rounded-xl px-6"
            >
              {submitting ? "Adding..." : "Add Section"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 border border-border/50 rounded-2xl text-muted-foreground">
            No "How to Use" sections added yet.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-background border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <MonitorPlay className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold">{item.title}</h4>
                  <a 
                    href={item.videoUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-primary flex items-center gap-1 hover:underline mt-0.5"
                  >
                    {item.videoUrl} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(item.id)}
                className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors shrink-0 self-end sm:self-auto"
                title="Delete Section"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
