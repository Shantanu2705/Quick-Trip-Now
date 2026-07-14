"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Search, Edit, Trash2, XCircle, UploadCloud, ImageIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Package } from "@/lib/firestore-utils";
import { useAuth } from "@/hooks/useAuth";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getApplicablePrice } from "@/lib/price-utils";
import Image from "next/image";

export default function AdminPackagesPage() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
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
    childPrice: "",
    maxChildAge: 12,
  });

  const [seasonalPrices, setSeasonalPrices] = useState<{ startDate: string; endDate: string; price: number }[]>([
    { startDate: "", endDate: "", price: 0 }
  ]);
  const [itinerary, setItinerary] = useState([{ day: 1, title: "", desc: "" }]);
  const [inclusions, setInclusions] = useState([{ text: "", included: true }]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const fetchPackages = async () => {
    setLoading(true);
    try {
      if (!user) return;
      const token = await user.getIdToken();
      
      const res = await fetch("/api/admin/packages", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPackages(data.data);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
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
      childPrice: pkg.childPrice?.toString() || "",
      maxChildAge: pkg.maxChildAge || 12,
    });
    setSeasonalPrices(pkg.seasonalPrices && pkg.seasonalPrices.length > 0 ? pkg.seasonalPrices : [{ startDate: "", endDate: "", price: 0 }]);
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
        fetchPackages();
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
    if (!formData.destination || formData.destination.trim() === "") missingFields.push(`Destination (You typed: '${formData.destination}')`);
    if (!formData.duration) missingFields.push("Duration Text (e.g. 3 Days / 2 Nights)");
    if (!formData.description) missingFields.push("Description");

    if (missingFields.length > 0) {
      alert(`Please fill out the following required fields:\n- ${missingFields.join("\n- ")}`);
      return;
    }

    if (!imageFile && !formData.image) {
      alert("Please upload a cover image.");
      return;
    }

    if (seasonalPrices.length === 0) {
      alert("Please add at least one seasonal pricing period.");
      return;
    }

    for (const season of seasonalPrices) {
      if (!season.startDate || !season.endDate || !season.price) {
        alert("Please fill all fields for seasonal pricing.");
        return;
      }
      if (new Date(season.endDate) < new Date(season.startDate)) {
        alert("End date cannot be before start date in seasonal pricing.");
        return;
      }
      if (Number(season.price) <= 0) {
        alert("Price must be greater than zero.");
        return;
      }
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

      // Convert image to Base64 to store in Firestore
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
        childPrice: formData.childPrice === "" ? 0 : Number(formData.childPrice),
        maxChildAge: Number(formData.maxChildAge),
        image: imageUrl,
        seasonalPrices: seasonalPrices.map(s => ({ ...s, price: Number(s.price) })),
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
        fetchPackages();
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
      rating: 5.0, reviews: 0, childPrice: "", maxChildAge: 12
    });
    setSeasonalPrices([{ startDate: "", endDate: "", price: 0 }]);
    setItinerary([{ day: 1, title: "", desc: "" }]);
    setInclusions([{ text: "", included: true }]);
    setImageFile(null);
    setImagePreview("");
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
                  <input type="text" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Duration <span className="text-destructive">*</span></label>
                  <input type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary" placeholder="e.g. 3 Days / 2 Nights" />
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

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Child Price (Flat Rate)</label>
                    <input type="number" min="0" value={formData.childPrice} onChange={e => setFormData({...formData, childPrice: e.target.value})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary" placeholder="e.g. 5000" />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Max Child Age</label>
                    <input type="number" min="1" max="18" value={formData.maxChildAge} onChange={e => setFormData({...formData, maxChildAge: Number(e.target.value)})} className="w-full bg-muted/30 border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary" />
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
              </div>

              {/* Seasonal Pricing */}
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold flex items-center gap-2"><Calendar className="w-5 h-5 text-primary"/> Seasonal Pricing <span className="text-destructive">*</span></h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => setSeasonalPrices([...seasonalPrices, { startDate: "", endDate: "", price: 0 }])}>+ Add Period</Button>
                </div>
                <div className="space-y-3">
                  {seasonalPrices.map((season, index) => (
                    <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-muted/10 p-3 rounded-xl border border-border/50">
                      <div className="w-full md:w-1/3">
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Start Date <span className="text-destructive">*</span></label>
                        <input type="date" value={season.startDate} onChange={e => { const newP = [...seasonalPrices]; newP[index].startDate = e.target.value; setSeasonalPrices(newP); }} className="w-full bg-background border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary" />
                      </div>
                      <div className="w-full md:w-1/3">
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">End Date <span className="text-destructive">*</span></label>
                        <input type="date" value={season.endDate} onChange={e => { const newP = [...seasonalPrices]; newP[index].endDate = e.target.value; setSeasonalPrices(newP); }} className="w-full bg-background border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary" />
                      </div>
                      <div className="w-full md:w-1/3">
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Package Price (₹) <span className="text-destructive">*</span></label>
                        <input type="number" min="1" value={season.price || ''} onChange={e => { const newP = [...seasonalPrices]; newP[index].price = Number(e.target.value); setSeasonalPrices(newP); }} className="w-full bg-background border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary" />
                      </div>
                      <button type="button" onClick={() => setSeasonalPrices(seasonalPrices.filter((_, i) => i !== index))} className="p-2.5 text-destructive hover:bg-destructive/10 rounded-lg shrink-0 mb-0.5"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {seasonalPrices.length === 0 && (
                    <div className="text-sm text-destructive font-medium">Please add at least one pricing period.</div>
                  )}
                </div>
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
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Package Name</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Destination</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Category</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Price (Today)</th>
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
                  <td className="px-6 py-4 font-bold text-primary">₹{getApplicablePrice(pkg.seasonalPrices)}</td>
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
