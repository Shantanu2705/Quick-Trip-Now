"use client";

import { useState, useEffect } from "react";
import { MonitorPlay, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HowToUsePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/how-to-use");
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
    fetchItems();
  }, []);

  return (
    <div className="bg-background min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mb-16">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6 flex items-center gap-4">
            <MonitorPlay className="w-10 h-10 md:w-12 md:h-12 text-primary" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">How to Use</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Watch our step-by-step video tutorials to learn how to make the most of Quick Trip Now.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-medium">Loading tutorials...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-muted/30 border border-border/50 rounded-3xl p-12 text-center text-muted-foreground">
            <MonitorPlay className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-2xl font-bold text-foreground mb-2">Check back soon!</h3>
            <p>We are currently preparing video tutorials for you.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <div key={item.id} className="bg-card rounded-3xl overflow-hidden border border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group flex flex-col">
                <div className="p-6 md:p-8 flex-1 flex flex-col items-start justify-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-5 h-5 ml-1" />
                  </div>
                  <h3 className="text-xl font-bold font-heading group-hover:text-primary transition-colors">{item.title}</h3>
                </div>
                <div className="p-4 border-t border-border/50 bg-muted/20 mt-auto">
                  <a 
                    href={item.videoUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors py-3 px-4 rounded-xl font-semibold"
                  >
                    Watch Video <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
