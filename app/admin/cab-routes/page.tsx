"use client";

import { useState, useEffect } from "react";
import { Search, RefreshCw, Plus, Edit2, Trash2, Route, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function AdminCabRoutesPage() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    distance: "",
    duration: "",
    itinerary: [{ location: "" }, { location: "" }]
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      
      const res = await fetch("/api/admin/cab-routes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRoutes(data.data);
      }
    } catch (err) {
      console.error("Error fetching cab routes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [user]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ title: "", subtitle: "", distance: "", duration: "", itinerary: [{ location: "" }, { location: "" }] });
    setError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (route: any) => {
    setEditingId(route.id);
    setFormData({
      title: route.title || "",
      subtitle: route.subtitle || "",
      distance: route.distance || "",
      duration: route.duration || "",
      itinerary: route.itinerary && route.itinerary.length > 0 ? route.itinerary : [{ location: "" }, { location: "" }]
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cab route?")) return;
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const res = await fetch(`/api/admin/cab-routes?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchRoutes();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error deleting cab route:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const method = editingId ? "PUT" : "POST";
      const payload = editingId ? { id: editingId, ...formData } : formData;

      const res = await fetch("/api/admin/cab-routes", {
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
        fetchRoutes();
      } else {
        setError(data.message || "Failed to save cab route");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const filteredRoutes = routes.filter((r) => 
    r.title?.toLowerCase().includes(search.toLowerCase()) || 
    r.subtitle?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddLocation = () => {
    setFormData({ ...formData, itinerary: [...formData.itinerary, { location: "" }] });
  };

  const handleRemoveLocation = (index: number) => {
    if (formData.itinerary.length > 1) {
      const newItinerary = [...formData.itinerary];
      newItinerary.splice(index, 1);
      setFormData({ ...formData, itinerary: newItinerary });
    }
  };

  const handleLocationChange = (index: number, value: string) => {
    const newItinerary = [...formData.itinerary];
    newItinerary[index].location = value;
    setFormData({ ...formData, itinerary: newItinerary });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Cab Routes</h1>
          <p className="text-muted-foreground">Manage cab routes and options for vehicle bookings.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenCreate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl font-semibold transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Route</span>
          </button>
          <button onClick={fetchRoutes} className="p-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-all shadow-sm">
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
              <Route className="w-6 h-6 text-primary" />
              {editingId ? "Edit Cab Route" : "Add New Cab Route"}
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
                  placeholder="e.g. Bagdogra Airport to Gangtok"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subtitle</label>
                <input 
                  type="text" 
                  value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})}
                  className="w-full bg-muted/30 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all"
                  placeholder="e.g. Bagdogra Airport | NJP | Siliguri to Gangtok"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Approx Distance <span className="text-destructive">*</span></label>
                <input 
                  type="text" required
                  value={formData.distance} onChange={e => setFormData({...formData, distance: e.target.value})}
                  className="w-full bg-muted/30 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all"
                  placeholder="e.g. Approx 130 Kms"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Approx Duration <span className="text-destructive">*</span></label>
                <input 
                  type="text" required
                  value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})}
                  className="w-full bg-muted/30 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all"
                  placeholder="e.g. 4.5 Hours Journey"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Route Itinerary (Locations) <span className="text-destructive">*</span></label>
                  <button type="button" onClick={handleAddLocation} className="text-xs text-primary hover:underline font-semibold">+ Add Stop</button>
                </div>
                {formData.itinerary.map((loc, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      type="text" required
                      value={loc.location} onChange={e => handleLocationChange(idx, e.target.value)}
                      className="flex-1 bg-muted/30 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all"
                      placeholder={`Stop ${idx + 1} (e.g. Gangtok)`}
                    />
                    {formData.itinerary.length > 1 && (
                      <button type="button" onClick={() => handleRemoveLocation(idx)} className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
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
                  {saving ? "Saving..." : editingId ? "Update Route" : "Add Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5 text-primary" />
            All Cab Routes
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search routes..." 
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
                  <th className="px-6 py-4 font-semibold tracking-wider">Title</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Subtitle</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map((route) => (
                  <tr key={route.id} className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{route.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-muted-foreground">{route.subtitle}</div>
                      <div className="text-xs text-muted-foreground mt-1">{route.distance} • {route.duration}</div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(route)} className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(route.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredRoutes.length === 0 && !loading && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <Route className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-lg font-medium">No routes found</p>
                        <p className="text-sm">Click "Add Route" to create one.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <p>Loading routes...</p>
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
