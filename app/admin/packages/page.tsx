"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Search, Edit, Trash2, XCircle, UploadCloud, ImageIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Package, Destination } from "@/lib/firestore-utils";
import { useAuth } from "@/hooks/useAuth";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";

export default function AdminPackagesPage() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    duration: "",
    days: 3,
    nights: 2,
    category: "Shared Tour",
    destination: "",
    status: "Active",
    isFeatured: false,
    highlightsStr: "",
    rating: 5.0,
    reviews: 0,
    termsAndConditions: "",
    maxAdults: 4,
    maxChildren: 2,
    maxInfants: 2,
    gstPercentage: 0,
    allowedVehicles: [] as string[],
    vehiclePrices: {} as Record<string, number>,
    vehicleSeasonalPrices: {} as Record<string, { startDate: string; endDate: string; price: number }[]>,
  });
  const [itinerary, setItinerary] = useState([{ day: 1, title: "", desc: "" }]);
  const [inclusions, setInclusions] = useState([{ text: "", included: true }]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!user) return;
      const token = await user.getIdToken();
      
      const [packagesRes, vehiclesRes, destinationsRes] = await Promise.all([
        fetch("/api/admin/packages", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/vehicles", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/destinations", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const pkgData = await packagesRes.json();
      const vehData = await vehiclesRes.json();
      const destData = await destinationsRes.json();
      
      if (pkgData.success) setPackages(pkgData.data);
      if (vehData.success) setAvailableVehicles(vehData.data);
      if (destData.success) setDestinations(destData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const handleEdit = (pkg: Package) => {
    setEditingId(pkg.id);
    setFormData({
      title: pkg.title || "",
      description: pkg.description || "",
      image: pkg.image || "",
      duration: pkg.duration || "",
      days: pkg.days || 3,
      nights: pkg.nights || 2,
      category: pkg.category || "Shared Tour",
      destination: pkg.destination || "",
      status: pkg.status || "Active",
      isFeatured: pkg.isFeatured || false,
      highlightsStr: pkg.highlights?.join(", ") || "",
      rating: pkg.rating || 5.0,
      reviews: pkg.reviews || 0,
      termsAndConditions: pkg.termsAndConditions || "",
      maxAdults: pkg.maxAdults || 4,
      maxChildren: pkg.maxChildren || 2,
      maxInfants: pkg.maxInfants || 2,
      gstPercentage: pkg.gstPercentage || 0,
      allowedVehicles: pkg.allowedVehicles || [],
      vehiclePrices: pkg.vehiclePrices || {},
      vehicleSeasonalPrices: pkg.vehicleSeasonalPrices || {},
    });
    setItinerary(pkg.itinerary && pkg.itinerary.length > 0 ? pkg.itinerary : [{ day: 1, title: "", desc: "" }]);
    setInclusions(pkg.inclusions && pkg.inclusions.length > 0 ? pkg.inclusions : [{ text: "", included: true }]);
    setImagePreview(pkg.image || "");
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      if (!user) return;
      const token = await user.getIdToken();

      const res = await fetch(`/api/admin/packages?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error deleting package:", error);
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
    
    // Form Validation
    const missingFields = [];
    if (!formData.title) missingFields.push("Package Name");
    if (!formData.destination || formData.destination.trim() === "") missingFields.push(`Destination`);
    if (!formData.description) missingFields.push("Description");

    if (missingFields.length > 0) {
      alert(`Please fill out the following required fields:\n- ${missingFields.join("\n- ")}`);
      return;
    }

    if (!imageFile && !formData.image) {
      alert("Please upload a cover image.");
      return;
    }

    setSaving(true);
    try {
      if (!user) {
        alert("Authentication error. Please refresh the page.");
        return;
      }
      const token = await user.getIdToken();

      let imageUrl = formData.image;

      // Helper to convert file to base64
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
          alert("Image is too large for Firestore. Please upload an image smaller than 700KB, or use a URL.");
          setSaving(false);
          return;
        }
        imageUrl = await fileToBase64(imageFile);
      }

      const pkgData = {
        ...(editingId ? { id: editingId } : {}),
        ...formData,
        duration: `${formData.days} Days / ${formData.nights} ${formData.nights > 1 ? 'Nights' : 'Night'}`,
        maxAdults: Number(formData.maxAdults),
        maxChildren: Number(formData.maxChildren),
        maxInfants: Number(formData.maxInfants),
        image: imageUrl,
        highlights: formData.highlightsStr.split(",").map(s => s.trim()).filter(Boolean),
        itinerary,
        inclusions
      };

      const method = editingId ? "PUT" : "POST";

      const res = await fetch("/api/admin/packages", {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(pkgData)
      });
      
      const data = await res.json();
      if (data.success) {
        handleCloseModal();
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (error: any) {
      console.error("Error saving package:", error);
      alert("Error saving package: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      title: "", description: "", image: "", duration: "", days: 3, nights: 2,
      category: "Shared Tour", destination: "", status: "Active", isFeatured: false, highlightsStr: "",
      rating: 5.0, reviews: 0, termsAndConditions: "", maxAdults: 4, maxChildren: 2, maxInfants: 2, gstPercentage: 0, allowedVehicles: [], vehiclePrices: {}, vehicleSeasonalPrices: {}
    });
    setItinerary([{ day: 1, title: "", desc: "" }]);
    setInclusions([{ text: "", included: true }]);
    setImageFile(null);
    setImagePreview("");
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Packages</h1>
          <p className="text-muted-foreground mt-1">Manage all your travel packages, tours, and services.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Package
        </Button>
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div className="bg-background border border-border rounded-2xl shadow-xl w-full max-w-4xl p-6 relative my-10 lg:my-auto">
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-muted/50 rounded-full hover:text-foreground transition-all"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6">{editingId ? "Edit Package" : "Create New Package"}</h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Package Name <span className="text-destructive">*</span></label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Destination <span className="text-destructive">*</span></label>
                  <select value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary appearance-none">
                    <option value="" disabled>Select a destination</option>
                    {destinations.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-muted/50 border border-border rounded-xl py-2 px-3 focus:outline-none focus:border-primary">
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">GST Percentage (%)</label>
                  <input type="number" value={formData.gstPercentage} onChange={(e) => setFormData({ ...formData, gstPercentage: Number(e.target.value) })} className="w-full bg-muted/50 border border-border rounded-xl py-2 px-3 focus:outline-none focus:border-primary" placeholder="e.g. 5" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary">
                    <option>Shared Tour</option>
                    <option>Private Tour</option>
                    <option>Honeymoon</option>
                    <option>Adventure</option>
                  </select>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Days</label>
                    <input type="number" value={formData.days} onChange={e => setFormData({...formData, days: Number(e.target.value)})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary" />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Nights</label>
                    <input type="number" value={formData.nights} onChange={e => setFormData({...formData, nights: Number(e.target.value)})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Rating (e.g. 4.5)</label>
                    <input type="number" step="0.1" max="5" min="1" value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary" />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Number of Reviews</label>
                    <input type="number" min="0" value={formData.reviews} onChange={e => setFormData({...formData, reviews: Number(e.target.value)})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary" />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description <span className="text-destructive">*</span></label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer p-3 bg-primary/5 rounded-xl border border-primary/20">
                    <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                    Feature this package on the Landing Page (Most Popular)
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Cover Image <span className="text-destructive">*</span></label>
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png, image/webp, image/jpg" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="w-full h-40 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/10 transition-colors relative overflow-hidden group"
                  >
                    {imagePreview ? (
                      <>
                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-white font-medium flex items-center gap-2"><UploadCloud className="w-5 h-5"/> Replace Image</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground">
                        <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                        <span className="font-medium text-sm">Click or Drag & Drop to upload</span>
                        <span className="text-xs mt-1 opacity-75">JPG, PNG, WebP allowed</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Highlights (Comma separated)</label>
                  <input type="text" value={formData.highlightsStr} onChange={e => setFormData({...formData, highlightsStr: e.target.value})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary" placeholder="Mountain View, Breakfast, Free WiFi" />
                </div>
                
                {/* Available Vehicles Selection */}
                <div className="md:col-span-2 bg-muted/10 p-4 rounded-xl border border-border/50">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Allowed Vehicles</label>
                  <p className="text-xs text-muted-foreground mb-3">Select the vehicles that can be booked with this package. (If none selected, all are allowed).</p>
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
              </div>

              {/* Terms and Conditions */}
              <div className="border-t border-border pt-4">
                <h3 className="font-bold mb-2">Terms & Conditions</h3>
                <textarea 
                  rows={4} 
                  value={formData.termsAndConditions} 
                  onChange={e => setFormData({...formData, termsAndConditions: e.target.value})} 
                  placeholder="Enter specific terms and conditions for this package..."
                  className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary" 
                />
              </div>

              {/* Itinerary */}
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold">Daily Itinerary</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => setItinerary([...itinerary, { day: itinerary.length + 1, title: "", desc: "" }])}>+ Add Day</Button>
                </div>
                <div className="space-y-3">
                  {itinerary.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start bg-muted/10 p-3 rounded-xl border border-border/50">
                      <div className="bg-primary/10 text-primary font-bold px-3 py-2 rounded-lg">D{item.day}</div>
                      <div className="flex-1 space-y-2">
                        <input type="text" placeholder="Day Title (e.g. Arrival in Gangtok)" value={item.title} onChange={e => { const newIt = [...itinerary]; newIt[index].title = e.target.value; setItinerary(newIt); }} className="w-full bg-background border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary" />
                        <textarea placeholder="Description of the day..." rows={2} value={item.desc} onChange={e => { const newIt = [...itinerary]; newIt[index].desc = e.target.value; setItinerary(newIt); }} className="w-full bg-background border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary" />
                      </div>
                      <button type="button" onClick={() => setItinerary(itinerary.filter((_, i) => i !== index))} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
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
                      <input type="text" placeholder="e.g. Hotel stay for 2 nights" value={item.text} onChange={e => { const newInc = [...inclusions]; newInc[index].text = e.target.value; setInclusions(newInc); }} className="flex-1 bg-background border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary" />
                      <button type="button" onClick={() => setInclusions(inclusions.filter((_, i) => i !== index))} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit" disabled={saving}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-4 mt-4 disabled:opacity-70 text-lg shadow-md transition-all"
              >
                {saving ? "Saving..." : (editingId ? "Update Package" : "Save Package")}
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
                <th className="px-6 py-4 font-semibold tracking-wider">Package Name</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Destination</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Category</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id} className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      {pkg.image && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0">
                          <Image src={pkg.image} alt="" fill className="object-cover" sizes="40px" />
                        </div>
                      )}
                      <span>{pkg.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{pkg.destination}</td>
                  <td className="px-6 py-4 text-muted-foreground">{pkg.category}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400`}>
                      {pkg.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(pkg)} className="p-2 hover:bg-muted/50 rounded-lg text-muted-foreground hover:text-primary transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(pkg.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {packages.length === 0 && !loading && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No packages found. Create one!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
