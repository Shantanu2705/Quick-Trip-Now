"use client";

import { useState, useEffect } from "react";
import { User, CheckCircle, XCircle, Ban, AlertCircle, Search, RefreshCw, Trash2, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({ fullName: "", email: "", password: "", role: "user" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // For this to work, the admin must be authenticated and provide their token
      // Assuming firebase client auth is available globally or through a hook
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      
      const res = await fetch("/api/admin/users?role=agent", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const handleUpdateStatus = async (uid: string, newStatus: string, reason?: string) => {
    let discountPercentage: string | null = null;
    if (newStatus === 'approved') {
      discountPercentage = window.prompt("Enter the discount percentage for this agent (e.g. 10 for 10%):", "20");
      if (discountPercentage === null) {
        // User cancelled the prompt
        return;
      }
    }

    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const body: any = { status: newStatus, reason };
      if (discountPercentage !== null) {
        body.discountPercentage = discountPercentage;
      }

      const res = await fetch(`/api/admin/users/${uid}/status`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        // Refresh list
        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm("Are you sure you want to permanently delete this account? This action cannot be undone.")) return;
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const res = await fetch(`/api/admin/users?uid=${uid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const filteredUsers = users.filter((u) => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newAccount)
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setNewAccount({ fullName: "", email: "", password: "", role: "user" });
        fetchUsers();
      } else {
        setCreateError(data.message || "Failed to create account");
      }
    } catch (error: any) {
      setCreateError(error.message || "An error occurred");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Agent Approvals</h1>
          <p className="text-muted-foreground">Approve, reject, and manage travel agent accounts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl font-semibold transition-all shadow-sm flex items-center gap-2"
          >
            <span>+ Create Account</span>
          </button>
          <button onClick={fetchUsers} className="p-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-all">
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6">Create New Account</h2>
            
            {createError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text" required 
                  value={newAccount.fullName} onChange={e => setNewAccount({...newAccount, fullName: e.target.value})}
                  className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Email</label>
                <input 
                  type="email" required 
                  value={newAccount.email} onChange={e => setNewAccount({...newAccount, email: e.target.value})}
                  className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Password</label>
                <input 
                  type="text" required 
                  value={newAccount.password} onChange={e => setNewAccount({...newAccount, password: e.target.value})}
                  className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Role</label>
                <select 
                  value={newAccount.role} onChange={e => setNewAccount({...newAccount, role: e.target.value})}
                  className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary"
                >
                  <option value="user">User</option>
                  <option value="agent">Agent</option>
                </select>
              </div>
              <button 
                type="submit" disabled={creating}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-3 mt-4 disabled:opacity-70"
              >
                {creating ? "Creating..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}

      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Agents</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search agents..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted/30 border border-border rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-y border-border">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-medium text-foreground">{user.fullName || "N/A"}</div>
                      <div className="text-muted-foreground">{user.email}</div>
                      <div className="text-xs text-muted-foreground">{user.phone}</div>
                    </td>
                    <td className="px-4 py-4 capitalize">{user.role}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        user.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-right space-x-2">
                      {user.status === 'pending' && (
                        <>
                          <button onClick={() => handleUpdateStatus(user.uid, 'approved')} className="text-emerald-600 hover:text-emerald-700 p-1" title="Approve">
                            <CheckCircle className="w-5 h-5 inline" />
                          </button>
                          <button onClick={() => handleUpdateStatus(user.uid, 'rejected')} className="text-red-600 hover:text-red-700 p-1" title="Reject">
                            <XCircle className="w-5 h-5 inline" />
                          </button>
                        </>
                      )}
                      {user.status === 'approved' && user.role !== 'admin' && (
                        <>
                          <button onClick={() => handleUpdateStatus(user.uid, 'approved')} className="text-blue-600 hover:text-blue-700 p-1" title="Edit Discount">
                            <Edit2 className="w-5 h-5 inline" />
                          </button>
                          <button onClick={() => handleUpdateStatus(user.uid, 'blocked')} className="text-amber-600 hover:text-amber-700 p-1" title="Block">
                            <Ban className="w-5 h-5 inline" />
                          </button>
                        </>
                      )}
                      {(user.status === 'blocked' || user.status === 'rejected') && (
                        <button onClick={() => handleUpdateStatus(user.uid, 'approved')} className="text-emerald-600 hover:text-emerald-700 p-1" title="Unblock/Approve">
                          <CheckCircle className="w-5 h-5 inline" />
                        </button>
                      )}
                      <button onClick={() => handleDeleteUser(user.uid)} className="text-red-600 hover:text-red-700 p-1 ml-2" title="Delete Account">
                        <Trash2 className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No agents found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
