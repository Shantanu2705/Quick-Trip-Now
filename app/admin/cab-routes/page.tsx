"use client";

import { useState, useEffect } from "react";
import { Search, RefreshCw, Plus, Edit2, Trash2, Route, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function AdminCabRoutesPage() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<any[]>([]);
  const [transferPackages, setTransferPackages] = useState<any[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    packageId: "",
    terms: "",
    allowedVehicles: [] as string[],
    vehiclePrices: {} as Record<string, number>,
    vehicleSeasonalPrices: {} as Record<string, { startDate: string; endDate: string; price: number }[]>,
    gstPercentage: 0,
  });
  const [inclusions, setInclusions] = useState([{ text: "", included: true }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      
      const [routesRes, tpRes, vehRes] = await Promise.all([
        fetch("/api/admin/cab-routes", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/transfer-packages", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/vehicles", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const routesData = await routesRes.json();
      const tpData = await tpRes.json();
      const vehData = await vehRes.json();
      
      if (routesData.success) setRoutes(routesData.data);
      if (tpData.success) setTransferPackages(tpData.data);
      if (vehData.success) setAvailableVehicles(vehData.data);
      
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
    setFormData({ title: "", destination: "", packageId: "", terms: "", allowedVehicles: [], vehiclePrices: {}, vehicleSeasonalPrices: {}, gstPercentage: 0 });
    setInclusions([{ text: "", included: true }]);
    setError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (route: any) => {
    setEditingId(route.id);
    setFormData({
      title: route.title || "",
      destination: route.destination || route.subtitle || "",
      packageId: route.packageId || "",
      terms: route.terms || "",
      allowedVehicles: route.allowedVehicles || [],
      vehiclePrices: route.vehiclePrices || {},
      vehicleSeasonalPrices: route.vehicleSeasonalPrices || {},
      gstPercentage: route.gstPercentage || 0,
    });
    setInclusions(route.inclusions && route.inclusions.length > 0 ? route.inclusions : [{ text: "", included: true }]);
    setError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this private transfer?")) return;
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
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error deleting private transfer:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    
    if (!formData.packageId) {
      setError("Please select an associated transfer package");
      setSaving(false);
      return;
    }
    
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const method = editingId ? "PUT" : "POST";
      const payload = editingId ? { id: editingId, ...formData, inclusions } : { ...formData, inclusions };

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
        fetchData();
      } else {
        setError(data.message || "Failed to save private transfer");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const toggleVehicle = (vehicleId: string) => {
    setFormData(prev => {
      if (prev.allowedVehicles.includes(vehicleId)) {
        return { ...prev, allowedVehicles: prev.allowedVehicles.filter(id => id !== vehicleId) };
      } else {
        return { ...prev, allowedVehicles: [...prev.allowedVehicles, vehicleId] };
      }
    });
  };

  const filteredRoutes = routes.filter((r) => 
    r.title?.toLowerCase().includes(search.toLowerCase()) || 
    (r.destination || r.subtitle)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Private Transfers</h1>
          <p className="text-muted-foreground">Manage private transfers and link them to transfer packages.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenCreate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl font-semibold transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Route</span>
          </button>
          <button onClick={fetchData} className="p-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-all shadow-sm">
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-background border border-border rounded-2xl shadow-xl w-full max-w-2xl p-6 relative my-8 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Route className="w-6 h-6 text-primary" />
              {editingId ? "Edit Private Transfer" : "Add New Private Transfer"}
            </h2>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm flex items-start gap-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Associated Transfer Package <span className="text-destructive">*</span></label>
                <select 
                  required
                  value={formData.packageId}
                  onChange={e => setFormData({...formData, packageId: e.target.value})}
                  className="w-full bg-muted/30 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all"
                >
                  <option value="">Select a package</option>
                  {transferPackages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>{pkg.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description <span className="text-destructive">*</span></label>
                  <textarea 
                    required rows={3}
                    value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})}
                    className="w-full bg-muted/30 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all resize-y"
                    placeholder="e.g. Gangtok"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">GST Percentage (%)</label>
                  <input 
                    type="number" 
                    value={formData.gstPercentage || ''} 
                    onChange={e => setFormData({...formData, gstPercentage: Number(e.target.value)})}
                    className="w-full bg-muted/30 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all"
                    placeholder="e.g. 5"
                  />
                </div>
              </div>

              {/* Available Vehicles Selection */}
              <div className="bg-muted/10 p-4 rounded-xl border border-border/50">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Allowed Vehicles</label>
                <p className="text-xs text-muted-foreground mb-3">Select the vehicles that can be booked for this specific route. (If none selected, all are allowed).</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableVehicles.map(veh => (
                    <div key={veh.id} className="flex flex-col gap-2 p-2 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.allowedVehicles.includes(veh.id)}
                          onChange={() => toggleVehicle(veh.id)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="truncate">{veh.name}</span>
                      </label>
                      {formData.allowedVehicles.includes(veh.id) && (
                        <div className="flex flex-col gap-3 mt-2 pt-2 border-t border-border/50">

                          
                          <div className="space-y-2">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Seasonal Prices</span>
                            {(formData.vehicleSeasonalPrices[veh.id] || []).map((sp, idx) => (
                              <div key={idx} className="flex flex-col gap-1.5 bg-muted/50 p-2 rounded-md border border-border/50">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-medium">Season {idx + 1}</span>
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      const newSp = [...(formData.vehicleSeasonalPrices[veh.id] || [])];
                                      newSp.splice(idx, 1);
                                      setFormData({
                                        ...formData,
                                        vehicleSeasonalPrices: {
                                          ...formData.vehicleSeasonalPrices,
                                          [veh.id]: newSp
                                        }
                                      });
                                    }}
                                    className="text-destructive hover:text-destructive/80 text-[10px]"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <div className="flex gap-2">
                                  <input 
                                    type="date" 
                                    value={sp.startDate}
                                    onChange={(e) => {
                                      const newSp = [...(formData.vehicleSeasonalPrices[veh.id] || [])];
                                      newSp[idx].startDate = e.target.value;
                                      setFormData({ ...formData, vehicleSeasonalPrices: { ...formData.vehicleSeasonalPrices, [veh.id]: newSp } });
                                    }}
                                    className="w-1/2 bg-background border border-border rounded py-1 px-2 text-[10px]"
                                  />
                                  <input 
                                    type="date" 
                                    value={sp.endDate}
                                    onChange={(e) => {
                                      const newSp = [...(formData.vehicleSeasonalPrices[veh.id] || [])];
                                      newSp[idx].endDate = e.target.value;
                                      setFormData({ ...formData, vehicleSeasonalPrices: { ...formData.vehicleSeasonalPrices, [veh.id]: newSp } });
                                    }}
                                    className="w-1/2 bg-background border border-border rounded py-1 px-2 text-[10px]"
                                  />
                                </div>
                                <input 
                                  type="number" 
                                  placeholder="Price"
                                  value={sp.price || ''}
                                  onChange={(e) => {
                                    const newSp = [...(formData.vehicleSeasonalPrices[veh.id] || [])];
                                    newSp[idx].price = Number(e.target.value);
                                    setFormData({ ...formData, vehicleSeasonalPrices: { ...formData.vehicleSeasonalPrices, [veh.id]: newSp } });
                                  }}
                                  className="w-full bg-background border border-border rounded py-1 px-2 text-[10px]"
                                />
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const newSp = [...(formData.vehicleSeasonalPrices[veh.id] || []), { startDate: '', endDate: '', price: 0 }];
                                setFormData({
                                  ...formData,
                                  vehicleSeasonalPrices: {
                                    ...formData.vehicleSeasonalPrices,
                                    [veh.id]: newSp
                                  }
                                });
                              }}
                              className="text-[10px] text-primary hover:underline font-medium block"
                            >
                              + Add Seasonal Price
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Terms & Conditions</label>
                <textarea 
                  value={formData.terms} onChange={e => setFormData({...formData, terms: e.target.value})}
                  className="w-full bg-muted/30 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all min-h-[100px]"
                  placeholder="Enter route-specific terms and conditions here..."
                />
              </div>

              {/* Inclusions */}
              <div className="border-t border-border/50 pt-4 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm">Inclusions / Exclusions</h3>
                  <button type="button" className="text-xs font-semibold text-primary hover:underline" onClick={() => setInclusions([...inclusions, { text: "", included: true }])}>+ Add Item</button>
                </div>
                <div className="space-y-2">
                  {inclusions.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center bg-muted/10 p-2 rounded-xl border border-border/50">
                      <select value={item.included ? "true" : "false"} onChange={e => { const newInc = [...inclusions]; newInc[index].included = e.target.value === "true"; setInclusions(newInc); }} className="bg-background border border-border rounded-lg py-2 px-2 text-sm focus:outline-none">
                        <option value="true">Included</option>
                        <option value="false">Excluded</option>
                      </select>
                      <input type="text" placeholder="e.g. Tolls and taxes" value={item.text} onChange={e => { const newInc = [...inclusions]; newInc[index].text = e.target.value; setInclusions(newInc); }} className="flex-1 bg-background border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary" />
                      <button type="button" onClick={() => setInclusions(inclusions.filter((_, i) => i !== index))} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
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
            All Private Transfers
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
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-y border-border/50">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Transfer Title</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Transfer Package</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map((route) => {
                  const pkg = transferPackages.find(p => p.id === route.packageId);
                  return (
                    <tr key={route.id} className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{route.title}</div>
                        {route.allowedVehicles && route.allowedVehicles.length > 0 && (
                          <div className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block mt-2">
                            {route.allowedVehicles.length} Vehicles Allowed
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {pkg ? (
                          <div className="text-sm font-medium">{pkg.title}</div>
                        ) : (
                          <div className="text-sm text-red-500">Unlinked</div>
                        )}
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
                  );
                })}
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
