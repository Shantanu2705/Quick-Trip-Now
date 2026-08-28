"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Tag, Percent, CheckCircle2, XCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountPercentage: "",
  });

  const [sendModal, setSendModal] = useState<{ isOpen: boolean; coupon: any; minTrips: string }>({
    isOpen: false,
    coupon: null,
    minTrips: "1",
  });
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState("");

  const getAuthToken = async () => {
    const authModule = await import("@/lib/firebase");
    const currentUser = authModule.auth?.currentUser;
    if (!currentUser) return null;
    return await currentUser.getIdToken();
  };

  const fetchData = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      const couponsRes = await fetch("/api/admin/coupons", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const couponsData = await couponsRes.json();
      
      if (couponsData.success) setCoupons(couponsData.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!newCoupon.code || !newCoupon.discountPercentage) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const token = await getAuthToken();
      if (!token) return;
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newCoupon)
      });
      const data = await res.json();
      
      if (data.success) {
        setCoupons([data.data, ...coupons]);
        setIsCreating(false);
        setNewCoupon({ code: "", discountPercentage: "" });
      } else {
        setError(data.message || "Failed to create coupon");
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id, isActive: !currentStatus })
      });
      if (res.ok) {
        setCoupons(coupons.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const token = await getAuthToken();
      if (!token) return;
      const res = await fetch(`/api/admin/coupons?id=${id}`, { 
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCoupons(coupons.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendCoupon = async () => {
    if (!sendModal.coupon) return;
    setSending(true);
    setSendResult("");
    try {
      const token = await getAuthToken();
      if (!token) return;
      const res = await fetch("/api/admin/coupons/send", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          couponCode: sendModal.coupon.code,
          minTrips: sendModal.minTrips,
          discountPercentage: sendModal.coupon.discountPercentage
        })
      });
      const data = await res.json();
      if (data.success) {
        setSendResult(`Success: ${data.message}`);
        setTimeout(() => {
          setSendModal({ isOpen: false, coupon: null, minTrips: "1" });
          setSendResult("");
        }, 3000);
      } else {
        setSendResult(`Error: ${data.message}`);
      }
    } catch (error: any) {
      setSendResult(`Error: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Coupons</h1>
          <p className="text-muted-foreground mt-1">Manage global discount coupons.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="rounded-xl px-6">
          <Plus className="w-4 h-4 mr-2" />
          {isCreating ? "Cancel" : "Create Coupon"}
        </Button>
      </div>

      {isCreating && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-background p-6 rounded-2xl border border-border shadow-sm">
          <h2 className="text-xl font-bold mb-4">Create New Global Coupon</h2>
          {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}
          
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Coupon Code</label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="e.g. SUMMER20"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none uppercase"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Discount Percentage (%)</label>
              <div className="relative">
                <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="e.g. 10"
                  value={newCoupon.discountPercentage}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountPercentage: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-2">
              <Button type="submit" className="rounded-xl px-8 w-full md:w-auto">Generate Coupon</Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Discount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600">
                    {coupon.discountPercentage}% OFF
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(coupon.id, coupon.isActive)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                        coupon.isActive 
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {coupon.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setSendModal({ isOpen: true, coupon, minTrips: "1" })}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1 font-semibold text-xs"
                        title="Send to Users"
                      >
                        <Send className="w-4 h-4" /> Send
                      </button>
                      <button 
                        onClick={() => handleDelete(coupon.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No coupons found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {sendModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card w-full max-w-md p-6 rounded-2xl border border-border shadow-lg"
            >
              <h3 className="text-xl font-bold mb-2">Send Coupon: {sendModal.coupon?.code}</h3>
              <p className="text-sm text-muted-foreground mb-4">Send this coupon to users who have completed a minimum number of trips.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold block mb-1">Minimum Trips Completed</label>
                  <input
                    type="number"
                    min="0"
                    value={sendModal.minTrips}
                    onChange={(e) => setSendModal({ ...sendModal, minTrips: e.target.value })}
                    className="w-full px-4 py-2 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">E.g., 1 means users with at least 1 trip will receive this coupon via in-app notification.</p>
                </div>

                {sendResult && (
                  <div className={`p-3 rounded-lg text-sm font-medium ${sendResult.startsWith('Error') ? 'bg-destructive/10 text-destructive' : 'bg-emerald-100 text-emerald-700'}`}>
                    {sendResult}
                  </div>
                )}

                <div className="flex gap-3 justify-end mt-6">
                  <Button variant="outline" onClick={() => { setSendModal({ isOpen: false, coupon: null, minTrips: "1" }); setSendResult(""); }} disabled={sending}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendCoupon} disabled={sending}>
                    {sending ? 'Sending...' : 'Send Now'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
