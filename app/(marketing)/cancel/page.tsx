"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Search } from "lucide-react";

export default function CancelPage() {
  const [bookingId, setBookingId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) return;
    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
    }, 1500);
  };

  return (
    <div className="bg-background min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
            Cancel Your Trip
          </h1>
          <p className="text-muted-foreground text-lg">
            We understand plans change. Enter your booking ID to initiate a cancellation.
          </p>
        </div>

        <div className="bg-muted/30 p-8 rounded-3xl border border-border/50 shadow-sm">
          {status === "success" ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Request Submitted</h3>
              <p className="text-muted-foreground mb-6">
                Your cancellation request for booking <strong>{bookingId}</strong> has been received. Our team will process it according to the cancellation policy and notify you via email.
              </p>
              <button 
                onClick={() => setStatus("idle")}
                className="text-primary font-semibold hover:underline"
              >
                Cancel another trip
              </button>
            </div>
          ) : (
            <form onSubmit={handleCancel} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Booking ID</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    placeholder="e.g. QTN-123456"
                    className="w-full bg-background border border-border rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
              
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-amber-500 w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Please review our cancellation policy before proceeding. Refunds are processed within 5-7 business days depending on the terms of your specific package.
                </p>
              </div>

              <button
                type="submit"
                disabled={status === "loading" || !bookingId}
                className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold py-3.5 rounded-xl transition-all disabled:opacity-70 flex justify-center"
              >
                {status === "loading" ? "Processing..." : "Initiate Cancellation"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
