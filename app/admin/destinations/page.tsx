"use client";

import { useState, useEffect } from "react";
import { Search, RefreshCw, Plus, Edit2, Trash2, MapPin, XCircle, UploadCloud, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRef } from "react";

export default function AdminDestinationsPage() {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: "",
    description: "",
    isPopular: false,
    history: "",
    touristPlaces: "",
    bestTimeToVisit: "",
    mainAttractionsStr: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const popularCount = destinations.filter(d => d.isPopular && d.id !== editingId).length;

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      
      const res = await fetch("/api/admin/destinations", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDestinations(data.data);
      }
    } catch (err) {
      console.error("Error fetching destinations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, [user]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: "", slug: "", image: "", description: "", isPopular: false, history: "", touristPlaces: "", bestTimeToVisit: "", mainAttractionsStr: "" });
    setImageFile(null);
    setImagePreview("");
    setError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dest: any) => {
    setEditingId(dest.id);
    setFormData({
      name: dest.name,
      slug: dest.slug,
      image: dest.image,
      description: dest.description || "",
      isPopular: dest.isPopular || false,
      history: dest.history || "",
      touristPlaces: dest.touristPlaces || "",
      bestTimeToVisit: dest.bestTimeToVisit || "",
      mainAttractionsStr: dest.mainAttractions ? dest.mainAttractions.join(", ") : ""
    });
    setImageFile(null);
    setImagePreview(dest.image || "");
    setError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this destination?")) return;
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const res = await fetch(`/api/admin/destinations?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchDestinations();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error deleting destination:", err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Only JPG, PNG, and WebP are allowed.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Only JPG, PNG, and WebP are allowed.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    
    if (!imageFile && !formData.image) {
      setError("Please upload a cover image.");
      setSaving(false);
      return;
    }

    
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

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
          setError("Image is too large for Firestore. Please upload an image smaller than 700KB.");
          setSaving(false);
          return;
        }
        imageUrl = await fileToBase64(imageFile);
      }

      const processedData = {
        ...formData,
        mainAttractions: formData.mainAttractionsStr.split(",").map(s => s.trim()).filter(Boolean),
        image: imageUrl
      };
      const { mainAttractionsStr, ...finalData } = processedData;

      const method = editingId ? "PUT" : "POST";
      const payload = editingId ? { id: editingId, ...finalData } : finalData;

      const res = await fetch("/api/admin/destinations", {
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
        fetchDestinations();
      } else {
        setError(data.message || "Failed to save destination");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData(prev => ({
      ...prev,
      name: newName,
      slug: prev.slug === generateSlug(prev.name) ? generateSlug(newName) : prev.slug
    }));
  };

  const filteredDestinations = destinations.filter((d) => 
    d.name?.toLowerCase().includes(search.toLowerCase()) || 
    d.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Destinations</h1>
          <p className="text-muted-foreground">Manage travel destinations and locations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenCreate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl font-semibold transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Destination</span>
          </button>
          <button onClick={fetchDestinations} className="p-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-all shadow-sm">
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
              <MapPin className="w-6 h-6 text-primary" />
              {editingId ? "Edit Destination" : "Add New Destination"}
            </h2>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm flex items-start gap-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Destination Name</label>
                  <input 
                    type="text" required 
                    value={formData.name} onChange={handleNameChange}
                    className="w-full bg-muted/30 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all"
                    placeholder="e.g. Switzerland"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">URL Slug</label>
                  <input 
                    type="text" required 
                    value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})}
                    className="w-full bg-muted/30 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all font-mono text-sm"
                    placeholder="e.g. switzerland"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cover Image</label>
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
                  className="w-full h-48 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/10 transition-colors relative overflow-hidden group"
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

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Short Description</label>
                <textarea 
                  required rows={2}
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-all resize-none"
                  placeholder="Short introductory summary..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">History & Overview</label>
                <textarea 
                  rows={4}
                  value={formData.history} onChange={e => setFormData({...formData, history: e.target.value})}
                  className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-all resize-none"
                  placeholder="Tell the story and history of this destination..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tourist Places</label>
                <textarea 
                  rows={4}
                  value={formData.touristPlaces} onChange={e => setFormData({...formData, touristPlaces: e.target.value})}
                  className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-all resize-none"
                  placeholder="Describe the overall tourist spots and geography..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Best Time to Visit</label>
                  <input 
                    type="text" 
                    value={formData.bestTimeToVisit} onChange={e => setFormData({...formData, bestTimeToVisit: e.target.value})}
                    className="w-full bg-muted/30 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all"
                    placeholder="e.g. October to March"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main Attractions (Comma Separated)</label>
                  <input 
                    type="text" 
                    value={formData.mainAttractionsStr} onChange={e => setFormData({...formData, mainAttractionsStr: e.target.value})}
                    className="w-full bg-muted/30 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all"
                    placeholder="e.g. Tsomgo Lake, Nathula Pass, MG Marg"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={`flex items-center gap-3 text-sm font-semibold cursor-pointer p-4 rounded-xl border transition-all ${
                  popularCount >= 4 && !formData.isPopular
                    ? "bg-muted/50 border-border/50 text-muted-foreground cursor-not-allowed opacity-70"
                    : "bg-primary/5 border-primary/20 text-foreground hover:bg-primary/10"
                }`}>
                  <input 
                    type="checkbox" 
                    checked={formData.isPopular} 
                    disabled={popularCount >= 4 && !formData.isPopular}
                    onChange={e => {
                      if (popularCount >= 4 && e.target.checked) return;
                      setFormData({...formData, isPopular: e.target.checked});
                    }} 
                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary disabled:opacity-50" 
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      Show in "Popular Destinations" on Landing Page
                      {formData.isPopular && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold tracking-wider">Active</span>}
                    </div>
                    {popularCount >= 4 && !formData.isPopular && (
                      <div className="text-xs text-amber-600 mt-1 font-normal">
                        Maximum of 4 popular destinations reached. Uncheck another first.
                      </div>
                    )}
                  </div>
                </label>
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
                  {saving ? "Saving..." : editingId ? "Update Destination" : "Add Destination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            All Destinations
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search destinations..." 
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
                  <th className="px-6 py-4 font-semibold tracking-wider">Destination</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Slug</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDestinations.map((dest) => (
                  <tr key={dest.id} className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border">
                          <Image src={dest.image} alt={dest.name} fill sizes="64px" className="object-cover" />
                        </div>
                        <div className="font-medium text-foreground">{dest.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{dest.slug}</span>
                    </td>
                    <td className="px-6 py-4">
                      {dest.isPopular ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Popular
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(dest)} className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(dest.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredDestinations.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <MapPin className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-lg font-medium">No destinations found</p>
                        <p className="text-sm">Click "Add Destination" to create one.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <p>Loading destinations...</p>
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
