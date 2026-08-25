"use client";

import { useState, useEffect } from "react";
import { Search, RefreshCw, Plus, Edit2, Trash2, Package, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function AdminTransferPackagesPage() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      
      const res = await fetch("/api/admin/transfer-packages", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      
      if (data.success) {
        setPackages(data.data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ title: "", description: "" });
    setError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: any) => {
    setEditingId(pkg.id);
    setFormData({
      title: pkg.title || "",
      description: pkg.description || "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transfer package?")) return;
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const res = await fetch(`/api/admin/transfer-packages?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error deleting transfer package:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    
    if (!formData.title) {
      setError("Please provide a title");
      setSaving(false);
      return;
    }
    
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const method = editingId ? "PUT" : "POST";
      const payload = editingId ? { id: editingId, ...formData } : { ...formData };

      const res = await fetch("/api/admin/transfer-packages", {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchData();
      } else {
        setError(data.message || "Failed to save transfer package");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const filteredPackages = packages.filter((p) => 
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Transfer Packages</h1>
          <p className="text-muted-foreground">Manage top-level packages for Private Transfers.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenCreate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl font-semibold transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Package</span>
          </button>
          <button onClick={fetchData} className="p-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-all shadow-sm">
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-background border border-border rounded-2xl shadow-xl w-full max-w-lg p-6 relative my-8 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              {editingId ? "Edit Transfer Package" : "Add New Transfer Package"}
            </h2>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm flex items-start gap-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title <span className="text-destructive">*</span></label>
                <input 
                  type="text" required 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-muted/30 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all"
                  placeholder="e.g. Shimla"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Brief Description</label>
                <textarea 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-muted/30 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all min-h-[100px]"
                  placeholder="A brief description of this transfer package..."
                />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={saving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl px-6 py-2.5 transition-all disabled:opacity-70 flex items-center gap-2"
                >
                  {saving ? "Saving..." : editingId ? "Update Package" : "Add Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            All Transfer Packages
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search packages..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary transition-all shadow-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-y border-border/50">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Package Title</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Description</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackages.map((pkg) => {
                  return (
                    <tr key={pkg.id} className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {pkg.title}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {pkg.description || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleOpenEdit(pkg)} className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(pkg.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredPackages.length === 0 && !loading && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-lg font-medium">No transfer packages found</p>
                        <p className="text-sm">Click "Add Package" to create one.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <p>Loading packages...</p>
                      </div>
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
