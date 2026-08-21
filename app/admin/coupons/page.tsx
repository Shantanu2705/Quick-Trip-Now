"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Tag, Percent, Users, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountPercentage: "",
    targetUserId: "",
    minBookingsRequired: "2",
  });

  const fetchData = async () => {
    try {
      const [couponsRes, usersRes] = await Promise.all([
        fetch("/api/admin/coupons"),
        fetch("/api/admin/users?role=user")
      ]);
      const couponsData = await couponsRes.json();
      const usersData = await usersRes.json();
      
      if (couponsData.success) setCoupons(couponsData.data);
      if (usersData.success) setUsers(usersData.data);
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
    
    if (!newCoupon.code || !newCoupon.discountPercentage || !newCoupon.targetUserId) {
      setError("Please fill in all required fields.");
      return;
    }

    const selectedUser = users.find(u => u.uid === newCoupon.targetUserId);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCoupon,
          targetUserName: selectedUser?.fullName || selectedUser?.email || "User"
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setCoupons([data.data, ...coupons]);
        setIsCreating(false);
        setNewCoupon({ code: "", discountPercentage: "", targetUserId: "", minBookingsRequired: "2" });
      } else {
        setError(data.message || "Failed to create coupon");
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons(coupons.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Coupons</h1>
          <p className="text-muted-foreground mt-1">Manage user-specific discount coupons.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="rounded-xl px-6">
          <Plus className="w-4 h-4 mr-2" />
          {isCreating ? "Cancel" : "Create Coupon"}
        </Button>
      </div>

      {isCreating && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-background p-6 rounded-2xl border border-border shadow-sm">
          <h2 className="text-xl font-bold mb-4">Create New Coupon</h2>
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

            <div className="space-y-2">
              <label className="text-sm font-semibold">Target User</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <select
                  value={newCoupon.targetUserId}
                  onChange={(e) => setNewCoupon({ ...newCoupon, targetUserId: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                  required
                >
                  <option value="">Select a user...</option>
                  {users.map(user => (
                    <option key={user.uid} value={user.uid}>
                      {user.fullName || user.email} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Minimum Bookings Required</label>
              <input
                type="number"
                min="0"
                value={newCoupon.minBookingsRequired}
                onChange={(e) => setNewCoupon({ ...newCoupon, minBookingsRequired: e.target.value })}
                className="w-full px-4 py-2 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                required
              />
              <p className="text-xs text-muted-foreground">User must have this many past bookings to use it.</p>
            </div>

            <div className="md:col-span-2 pt-2">
              <Button type="submit" className="rounded-xl px-8 w-full md:w-auto">Generate Coupon</Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Discount</th>
                <th className="px-6 py-4 font-semibold">Assigned To</th>
                <th className="px-6 py-4 font-semibold">Min Bookings</th>
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
                    <div className="font-medium">{coupon.targetUserName}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">{coupon.targetUserId}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {coupon.minBookingsRequired}
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
                    <button 
                      onClick={() => handleDelete(coupon.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No coupons found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
