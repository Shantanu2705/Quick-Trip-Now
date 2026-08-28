"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Edit, Trash2, XCircle, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminVehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [inclusions, setInclusions] = useState([{ text: "", included: true }]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [unavailableDateInput, setUnavailableDateInput] = useState("");
  const [seasonalInput, setSeasonalInput] = useState({ startDate: "", endDate: "", price: 0 });

  const [formData, setFormData] = useState({
    name: "",
    type: "SUV",
    image: "",
    price: 0,
    seats: 4,
    maxAdults: 4,
    maxChildren: 0,
    maxChildAge: 12,
    ac: true,
    status: "Active",
    unavailableDates: [] as string[],
    seasonalPrices: [] as { startDate: string, endDate: string, price: number }[],
    termsAndConditions: "",
    gstPercentage: 0,
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      
      const res = await fetch("/api/admin/vehicles", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setVehicles(data.data);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [user]);

  const handleEdit = (v: any) => {
    setEditingId(v.id);
    setFormData({
      name: v.name || "",
      type: v.type || "SUV",
      image: v.image || "",
      price: v.price || v.pricePerDay || 0,
      seats: v.seats || 4,
      maxAdults: v.maxAdults || 4,
      maxChildren: v.maxChildren || 0,
      maxChildAge: v.maxChildAge || 12,
      ac: v.ac !== undefined ? v.ac : true,
      status: v.status || "Active",
      unavailableDates: v.unavailableDates || [],
      seasonalPrices: v.seasonalPrices || [],
      termsAndConditions: v.termsAndConditions || "",
      gstPercentage: v.gstPercentage || 0,
    });
    setInclusions(v.inclusions && v.inclusions.length > 0 ? v.inclusions : [{ text: "", included: true }]);
    setImageFile(null);
    setImagePreview(v.image || "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const res = await fetch(`/api/admin/vehicles?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchVehicles();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        alert("Invalid file type. Only JPG, PNG, and WebP are allowed.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        alert("Invalid file type. Only JPG, PNG, and WebP are allowed.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !formData.image) {
      alert("Please upload a vehicle image.");
      return;
    }

    setSaving(true);
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      let imageUrl = formData.image;
      
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      };

      if (imageFile) {
        if (imageFile.size > 700 * 1024) {
          alert("Image is too large for Firestore. Please upload an image smaller than 700KB.");
          setSaving(false);
          return;
        }
        imageUrl = await fileToBase64(imageFile);
      }

      const payload = {
        ...(editingId ? { id: editingId } : {}),
        ...formData,
        inclusions,
        image: imageUrl
      };
      const method = editingId ? "PUT" : "POST";

      const res = await fetch("/api/admin/vehicles", {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        handleCloseModal();
        fetchVehicles();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error saving vehicle:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");
    setFormData({
      name: "", type: "SUV", image: "", price: 0, seats: 4, maxAdults: 4, maxChildren: 0, maxChildAge: 12, ac: true, status: "Active", unavailableDates: [], seasonalPrices: [], termsAndConditions: "", gstPercentage: 0
    });
    setInclusions([{ text: "", included: true }]);
    setUnavailableDateInput("");
  };

  const handleAddUnavailableDate = () => {
    if (!unavailableDateInput) return;
    if (!formData.unavailableDates.includes(unavailableDateInput)) {
      setFormData({
        ...formData,
        unavailableDates: [...formData.unavailableDates, unavailableDateInput].sort()
      });
    }
    setUnavailableDateInput("");
  };

  const handleRemoveUnavailableDate = (date: string) => {
    setFormData({
      ...formData,
      unavailableDates: formData.unavailableDates.filter(d => d !== date)
    });
  };

  const handleAddSeasonalPrice = () => {
    if (!seasonalInput.startDate || !seasonalInput.endDate || seasonalInput.price <= 0) return;
    
    // Check for overlap
    const newStart = new Date(seasonalInput.startDate).getTime();
    const newEnd = new Date(seasonalInput.endDate).getTime();
    
    if (newEnd < newStart) {
      alert("End date cannot be before start date");
      return;
    }

    const hasOverlap = formData.seasonalPrices.some(season => {
      const existingStart = new Date(season.startDate).getTime();
      const existingEnd = new Date(season.endDate).getTime();
      return (newStart <= existingEnd && newEnd >= existingStart);
    });

    if (hasOverlap) {
      alert("This date range overlaps with an existing seasonal price. No overlaps allowed.");
      return;
    }

    setFormData({
      ...formData,
      seasonalPrices: [...formData.seasonalPrices, { ...seasonalInput }].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    });
    setSeasonalInput({ startDate: "", endDate: "", price: 0 });
  };

  const handleRemoveSeasonalPrice = (index: number) => {
    const newPrices = [...formData.seasonalPrices];
    newPrices.splice(index, 1);
    setFormData({ ...formData, seasonalPrices: newPrices });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Vehicle Fleet</h1>
          <p className="text-muted-foreground mt-1">Manage all your rental cars and transport vehicles.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Vehicle
        </Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-background border border-border rounded-2xl shadow-xl w-full max-w-2xl p-6 relative my-8 max-h-[90vh] overflow-y-auto">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6">{editingId ? "Edit Vehicle" : "Add New Vehicle"}</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Vehicle Name (e.g. Innova Crysta)</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Type</label>
                  <input type="text" required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} placeholder="e.g. SUV, Bike, Sedan" className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary" />
                </div>

                {/* File Dropzone */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Upload Vehicle Image</label>
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-border hover:border-primary rounded-xl p-8 text-center bg-muted/10 transition-colors relative"
                  >
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/webp,image/jpg" 
                      onChange={handleImageChange} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {imagePreview ? (
                      <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-sm">
                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white font-medium flex items-center gap-2"><UploadCloud className="w-5 h-5" /> Change Image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-3 py-6">
                        <div className="p-4 bg-primary/10 text-primary rounded-full">
                          <UploadCloud className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Click or drag image to upload</p>
                          <p className="text-sm text-muted-foreground mt-1">SVG, PNG, JPG or WEBP (max 700KB)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Route Price (₹)</label>
                  <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">GST Percentage (%)</label>
                  <input type="number" value={formData.gstPercentage} onChange={e => setFormData({...formData, gstPercentage: Number(e.target.value)})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary" placeholder="e.g. 12" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Seats</label>
                  <input type="number" required value={formData.seats} onChange={e => setFormData({...formData, seats: Number(e.target.value)})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Max Adults Allowed</label>
                  <input type="number" required value={formData.maxAdults} onChange={e => setFormData({...formData, maxAdults: Number(e.target.value)})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Max Children Allowed</label>
                  <input type="number" required value={formData.maxChildren} onChange={e => setFormData({...formData, maxChildren: Number(e.target.value)})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Max Children Age</label>
                  <input type="number" required value={formData.maxChildAge} onChange={e => setFormData({...formData, maxChildAge: Number(e.target.value)})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">AC</label>
                  <select value={formData.ac ? "true" : "false"} onChange={e => setFormData({...formData, ac: e.target.value === "true"})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div className="md:col-span-2 bg-muted/10 p-4 rounded-xl border border-border/50">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Unavailable Dates</label>
                  <div className="flex items-center gap-2 mb-3">
                    <input 
                      type="date" 
                      value={unavailableDateInput} 
                      onChange={e => setUnavailableDateInput(e.target.value)}
                      className="bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary flex-1 max-w-[200px]"
                    />
                    <Button type="button" onClick={handleAddUnavailableDate} variant="secondary" className="rounded-xl">Add Date</Button>
                  </div>
                  {formData.unavailableDates.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.unavailableDates.map((date, idx) => (
                        <div key={idx} className="bg-destructive/10 text-destructive text-sm px-3 py-1 rounded-full flex items-center gap-1 border border-destructive/20">
                          {date}
                          <button type="button" onClick={() => handleRemoveUnavailableDate(date)} className="hover:text-destructive/70"><XCircle className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No unavailable dates set. This vehicle is available every day.</p>
                  )}
                </div>

                <div className="md:col-span-2 bg-muted/10 p-4 rounded-xl border border-border/50">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Seasonal Pricing</label>
                  <p className="text-xs text-muted-foreground mb-3">Set custom prices for specific date ranges. Overlaps are not permitted.</p>
                  <div className="flex flex-col md:flex-row items-center gap-2 mb-3">
                    <div className="flex-1 flex gap-2 w-full">
                      <input 
                        type="date" 
                        value={seasonalInput.startDate} 
                        onChange={e => setSeasonalInput({...seasonalInput, startDate: e.target.value})}
                        className="bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary flex-1"
                        placeholder="Start Date"
                      />
                      <input 
                        type="date" 
                        value={seasonalInput.endDate} 
                        onChange={e => setSeasonalInput({...seasonalInput, endDate: e.target.value})}
                        className="bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary flex-1"
                        placeholder="End Date"
                      />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <input 
                        type="number" 
                        min="1"
                        placeholder="Price (₹)"
                        value={seasonalInput.price || ""} 
                        onChange={e => setSeasonalInput({...seasonalInput, price: Number(e.target.value)})}
                        className="bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary w-full md:w-32"
                      />
                      <Button type="button" onClick={handleAddSeasonalPrice} variant="secondary" className="rounded-xl whitespace-nowrap">Add</Button>
                    </div>
                  </div>
                  {formData.seasonalPrices && formData.seasonalPrices.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {formData.seasonalPrices.map((season, idx) => (
                        <div key={idx} className="bg-primary/10 text-primary text-sm px-4 py-2 rounded-lg flex items-center justify-between border border-primary/20">
                          <div>
                            <span className="font-semibold">{season.startDate}</span> to <span className="font-semibold">{season.endDate}</span> : 
                            <span className="font-bold ml-2">₹{season.price}</span>
                          </div>
                          <button type="button" onClick={() => handleRemoveSeasonalPrice(idx)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No seasonal prices set. Base price applies year-round.</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Terms & Conditions</label>
                  <textarea 
                    value={formData.termsAndConditions} onChange={e => setFormData({...formData, termsAndConditions: e.target.value})}
                    className="w-full bg-muted/30 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all min-h-[100px]"
                    placeholder="Enter vehicle-specific terms and conditions here..."
                  />
                </div>
              </div>

              {/* Inclusions */}
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold">Inclusions / Exclusions</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => setInclusions([...inclusions, { text: "", included: true }])}>+ Add Item</Button>
                </div>
                <div className="space-y-2">
                  {inclusions.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center bg-muted/10 p-2 rounded-xl border border-border/50">
                      <select value={item.included ? "true" : "false"} onChange={e => { const newInc = [...inclusions]; newInc[index].included = e.target.value === "true"; setInclusions(newInc); }} className="bg-background border border-border rounded-lg py-2 px-2 text-sm focus:outline-none">
                        <option value="true">Included</option>
                        <option value="false">Excluded</option>
                      </select>
                      <input type="text" placeholder="e.g. Fuel, Toll Taxes" value={item.text} onChange={e => { const newInc = [...inclusions]; newInc[index].text = e.target.value; setInclusions(newInc); }} className="flex-1 bg-background border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary" />
                      <button type="button" onClick={() => setInclusions(inclusions.filter((_, i) => i !== index))} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-3 mt-4 disabled:opacity-70">
                {saving ? "Saving..." : (editingId ? "Update Vehicle" : "Save Vehicle")}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-background border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Vehicle</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Type</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Route Price</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Seats</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      {v.image && (
                        <div className="w-12 h-10 relative rounded-lg overflow-hidden border border-border">
                          <Image src={v.image} alt={v.name} fill className="object-cover" />
                        </div>
                      )}
                      <span>{v.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{v.type}</td>
                  <td className="px-6 py-4 font-bold">₹{v.price || v.pricePerDay}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <div>{v.seats} Seats</div>
                    <div className="text-xs text-foreground/60">{v.maxAdults} Adults, {v.maxChildren} Children (Max age {v.maxChildAge || 12})</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(v)} className="p-2 hover:bg-muted/50 rounded-lg text-muted-foreground hover:text-primary transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(v.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && !loading && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No vehicles found. Add your first car!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
