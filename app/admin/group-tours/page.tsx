"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Search, Edit, Trash2, XCircle, UploadCloud, ImageIcon, Calendar, Users, Percent, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupTour, Destination } from "@/lib/firestore-utils";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

export default function AdminGroupToursPage() {
  const { user } = useAuth();
  const [tours, setTours] = useState<GroupTour[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    image: "",
    duration: "",
    days: 3,
    nights: 2,
    destination: "",
    status: "Active",
    isFeatured: false,
    highlightsStr: "",
    rating: 5.0,
    reviews: 0,
    termsAndConditions: "",
    maxAdults: 20,
    maxChildren: 10,
    maxInfants: 5,
    gstPercentage: 5,
    price: 4000,
    childPrice: 2000,
    partPayment: { enabled: false, percentage: 50 },
    seasonalPrices: [] as { startDate: string; endDate: string; price: number; childPrice?: number }[],
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

      const [toursRes, destinationsRes] = await Promise.all([
        fetch("/api/admin/group-tours", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/destinations", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const toursData = await toursRes.json();
      const destData = await destinationsRes.json();

      if (toursData.success) {
        setTours(toursData.data);
      }
      if (destData.success) {
        setDestinations(destData.data);
      }
    } catch (error) {
      console.error("Error fetching group tours:", error);
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

  const handleEdit = (tour: GroupTour) => {
    setEditingId(tour.id);
    setFormData({
      title: tour.title || "",
      slug: tour.slug || "",
      description: tour.description || "",
      image: tour.image || "",
      duration: tour.duration || "",
      days: tour.days || 3,
      nights: tour.nights || 2,
      destination: tour.destination || "",
      status: tour.status || "Active",
      isFeatured: !!tour.isFeatured,
      highlightsStr: Array.isArray(tour.highlights) ? tour.highlights.join("\n") : "",
      rating: tour.rating || 5.0,
      reviews: tour.reviews || 0,
      termsAndConditions: tour.termsAndConditions || tour.terms || "",
      maxAdults: tour.maxAdults || 20,
      maxChildren: tour.maxChildren || 10,
      maxInfants: tour.maxInfants || 5,
      gstPercentage: tour.gstPercentage || 0,
      price: tour.price || 0,
      childPrice: tour.childPrice || 0,
      partPayment: tour.partPayment || { enabled: false, percentage: 50 },
      seasonalPrices: tour.seasonalPrices || [],
    });
    setItinerary(tour.itinerary && tour.itinerary.length > 0 ? tour.itinerary : [{ day: 1, title: "", desc: "" }]);
    setInclusions(tour.inclusions && tour.inclusions.length > 0 ? tour.inclusions : [{ text: "", included: true }]);
    setImagePreview(tour.image || "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this group tour?")) return;
    try {
      if (!user) return;
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/group-tours?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTours(tours.filter(t => t.id !== id));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error deleting group tour:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const missingFields: string[] = [];
    if (!formData.title) missingFields.push("Tour Title");
    if (!formData.destination || formData.destination.trim() === "") missingFields.push("Destination");
    if (!formData.description) missingFields.push("Description");
    if (formData.price === undefined || formData.price <= 0) missingFields.push("Price Per Person (Adult)");

    if (missingFields.length > 0) {
      alert(`Please fill out the following required fields:\n- ${missingFields.join("\n- ")}`);
      setSaving(false);
      return;
    }

    try {
      if (!user) return;
      const token = await user.getIdToken();

      let finalImageUrl = formData.image;

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
          alert("Image is too large. Please upload an image smaller than 700KB, or provide an Image URL.");
          setSaving(false);
          return;
        }
        finalImageUrl = await fileToBase64(imageFile);
      }

      const highlights = formData.highlightsStr
        .split("\n")
        .map(h => h.trim())
        .filter(Boolean);

      const computedDuration = `${formData.days} Days / ${formData.nights} Nights`;

      const payload = {
        ...(editingId ? { id: editingId } : {}),
        ...formData,
        duration: formData.duration || computedDuration,
        image: finalImageUrl || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
        highlights,
        itinerary,
        inclusions,
        price: Number(formData.price) || 0,
        childPrice: Number(formData.childPrice) || 0,
        gstPercentage: Number(formData.gstPercentage) || 0,
        seasonalPrices: formData.seasonalPrices || [],
        partPayment: formData.partPayment,
        terms: formData.termsAndConditions,
      };

      const res = await fetch("/api/admin/group-tours", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        handleCloseModal();
        fetchData();
      } else {
        alert(data.message || "Failed to save group tour");
      }
    } catch (error: any) {
      console.error("Error saving group tour:", error);
      alert("Error saving group tour: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      title: "", slug: "", description: "", image: "", duration: "", days: 3, nights: 2,
      destination: "", status: "Active", isFeatured: false, highlightsStr: "",
      rating: 5.0, reviews: 0, termsAndConditions: "", maxAdults: 20, maxChildren: 10, maxInfants: 5,
      gstPercentage: 5, price: 4000, childPrice: 2000, partPayment: { enabled: false, percentage: 50 },
      seasonalPrices: [],
    });
    setItinerary([{ day: 1, title: "", desc: "" }]);
    setInclusions([{ text: "", included: true }]);
    setImageFile(null);
    setImagePreview("");
  };

  const filteredTours = tours.filter(t =>
    (t.title && t.title.toLowerCase().includes(search.toLowerCase())) ||
    (t.destination && t.destination.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Group Tours</h1>
          <p className="text-muted-foreground mt-1">Manage all your package-priced shared group tours & departures.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Group Tour
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Group Tours</span>
          <div className="text-2xl font-bold mt-2 text-foreground">{tours.length}</div>
        </div>
        <div className="bg-background border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Departures</span>
          <div className="text-2xl font-bold mt-2 text-emerald-600">
            {tours.filter(t => t.status === "Active").length}
          </div>
        </div>
        <div className="bg-background border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pricing Model</span>
          <div className="text-2xl font-bold mt-2 text-primary">Package / Per Person</div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-4 bg-background border border-border rounded-2xl p-3 shadow-sm">
        <Search className="w-5 h-5 text-muted-foreground ml-2" />
        <input
          type="text"
          placeholder="Search by tour title or destination..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
        />
      </div>

      {/* Tours Table */}
      <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-4 px-6">Tour</th>
                <th className="py-4 px-6">Destination</th>
                <th className="py-4 px-6">Duration</th>
                <th className="py-4 px-6">Price / Person</th>
                <th className="py-4 px-6">Child Price</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">Loading group tours...</td>
                </tr>
              ) : filteredTours.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">No group tours found. Click "+ Add Group Tour" to create one.</td>
                </tr>
              ) : (
                filteredTours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden relative flex-shrink-0">
                          {tour.image ? (
                            <Image src={tour.image} alt={tour.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground block">{tour.title}</span>
                          <span className="text-xs text-muted-foreground">⭐ {tour.rating || 5.0} ({tour.reviews || 0} reviews)</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground font-medium">{tour.destination}</td>
                    <td className="py-4 px-6 text-muted-foreground">{tour.duration || `${tour.days}D / ${tour.nights}N`}</td>
                    <td className="py-4 px-6 font-semibold text-foreground">
                      ₹{tour.price?.toLocaleString("en-IN") || 0}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">
                      {tour.childPrice ? `₹${tour.childPrice.toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        tour.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                      }`}>
                        {tour.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(tour)}
                          className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tour.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
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
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? "Edit Group Tour" : "Create New Group Tour"}
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-muted/20 border border-border/80 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Tour Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. North Sikkim 3D/2N Shared Group Tour"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Destination <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={formData.destination}
                      onChange={e => setFormData({ ...formData, destination: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary text-sm"
                    >
                      <option value="">Select Destination</option>
                      {destinations.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Duration (Days & Nights)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Days"
                        value={formData.days}
                        onChange={e => setFormData({ ...formData, days: parseInt(e.target.value) || 1 })}
                        className="w-full bg-background border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary text-sm"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Nights"
                        value={formData.nights}
                        onChange={e => setFormData({ ...formData, nights: parseInt(e.target.value) || 0 })}
                        className="w-full bg-background border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary text-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Image URL or File Upload
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={formData.image}
                      onChange={e => {
                        setFormData({ ...formData, image: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      className="flex-1 bg-background border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary text-sm"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl flex items-center gap-2"
                    >
                      <UploadCloud className="w-4 h-4" /> Upload
                    </Button>
                  </div>
                  {imagePreview && (
                    <div className="mt-2 w-28 h-20 relative rounded-xl overflow-hidden border border-border">
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Package-Based Pricing System */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
                    <Percent className="w-4 h-4" /> Package-Based Pricing (Per Person)
                  </h3>
                  <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-full">
                    Package Pricing System
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Base Price / Adult (₹) <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-background border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Child Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.childPrice}
                      onChange={e => setFormData({ ...formData, childPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-background border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      GST (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="28"
                      value={formData.gstPercentage}
                      onChange={e => setFormData({ ...formData, gstPercentage: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-background border border-border rounded-xl py-2 px-4 focus:outline-none focus:border-primary text-sm"
                    />
                  </div>
                </div>

                {/* Part Payment */}
                <div className="bg-background border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="partPaymentToggle"
                      checked={formData.partPayment.enabled}
                      onChange={e => setFormData({
                        ...formData,
                        partPayment: { ...formData.partPayment, enabled: e.target.checked }
                      })}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                    <label htmlFor="partPaymentToggle" className="text-sm font-medium cursor-pointer">
                      Enable Part Payment / Advance for Group Tour
                    </label>
                  </div>
                  {formData.partPayment.enabled && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-semibold">Advance Required:</span>
                      <input
                        type="number"
                        min="10"
                        max="90"
                        value={formData.partPayment.percentage}
                        onChange={e => setFormData({
                          ...formData,
                          partPayment: { ...formData.partPayment, percentage: parseInt(e.target.value) || 50 }
                        })}
                        className="w-20 bg-muted/40 border border-border rounded-lg py-1 px-2 text-center text-sm font-bold"
                      />
                      <span className="text-sm font-bold">%</span>
                    </div>
                  )}
                </div>

                {/* Seasonal Pricing Periods */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Seasonal Dates & Custom Pricing (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          seasonalPrices: [
                            ...formData.seasonalPrices,
                            { startDate: "", endDate: "", price: formData.price, childPrice: formData.childPrice }
                          ]
                        });
                      }}
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Seasonal Period
                    </button>
                  </div>

                  {formData.seasonalPrices.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No seasonal pricing added. Base per-person price will apply for all dates.</p>
                  ) : (
                    formData.seasonalPrices.map((sp, idx) => (
                      <div key={idx} className="flex flex-wrap items-center gap-2 bg-background p-3 rounded-xl border border-border">
                        <div className="flex-1 min-w-[130px]">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Start Date</span>
                          <input
                            type="date"
                            value={sp.startDate}
                            onChange={e => {
                              const updated = [...formData.seasonalPrices];
                              updated[idx].startDate = e.target.value;
                              setFormData({ ...formData, seasonalPrices: updated });
                            }}
                            className="w-full bg-muted/30 border border-border rounded-lg p-1.5 text-xs"
                          />
                        </div>
                        <div className="flex-1 min-w-[130px]">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">End Date</span>
                          <input
                            type="date"
                            value={sp.endDate}
                            onChange={e => {
                              const updated = [...formData.seasonalPrices];
                              updated[idx].endDate = e.target.value;
                              setFormData({ ...formData, seasonalPrices: updated });
                            }}
                            className="w-full bg-muted/30 border border-border rounded-lg p-1.5 text-xs"
                          />
                        </div>
                        <div className="w-28">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Adult (₹)</span>
                          <input
                            type="number"
                            value={sp.price}
                            onChange={e => {
                              const updated = [...formData.seasonalPrices];
                              updated[idx].price = parseFloat(e.target.value) || 0;
                              setFormData({ ...formData, seasonalPrices: updated });
                            }}
                            className="w-full bg-muted/30 border border-border rounded-lg p-1.5 text-xs font-semibold"
                          />
                        </div>
                        <div className="w-28">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Child (₹)</span>
                          <input
                            type="number"
                            value={sp.childPrice || 0}
                            onChange={e => {
                              const updated = [...formData.seasonalPrices];
                              updated[idx].childPrice = parseFloat(e.target.value) || 0;
                              setFormData({ ...formData, seasonalPrices: updated });
                            }}
                            className="w-full bg-muted/30 border border-border rounded-lg p-1.5 text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              seasonalPrices: formData.seasonalPrices.filter((_, i) => i !== idx)
                            });
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg mt-4"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Description & Highlights */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Description <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl p-3 focus:outline-none focus:border-primary text-sm"
                    placeholder="Comprehensive description of the group tour..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Key Highlights (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.highlightsStr}
                    onChange={e => setFormData({ ...formData, highlightsStr: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl p-3 focus:outline-none focus:border-primary text-sm"
                    placeholder="Shared mountain coach transfer&#10;Yumthang Valley excursion&#10;Hotel twin sharing with meals"
                  />
                </div>
              </div>

              {/* Day-by-Day Itinerary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tour Itinerary
                  </label>
                  <button
                    type="button"
                    onClick={() => setItinerary([...itinerary, { day: itinerary.length + 1, title: "", desc: "" }])}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Day
                  </button>
                </div>
                {itinerary.map((item, idx) => (
                  <div key={idx} className="bg-muted/20 border border-border rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">Day {item.day}</span>
                      {itinerary.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setItinerary(itinerary.filter((_, i) => i !== idx))}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Day Title (e.g. Gangtok to Lachung Drive)"
                      value={item.title}
                      onChange={e => {
                        const updated = [...itinerary];
                        updated[idx].title = e.target.value;
                        setItinerary(updated);
                      }}
                      className="w-full bg-background border border-border rounded-lg p-2 text-sm"
                    />
                    <textarea
                      placeholder="Day activities and route details..."
                      rows={2}
                      value={item.desc}
                      onChange={e => {
                        const updated = [...itinerary];
                        updated[idx].desc = e.target.value;
                        setItinerary(updated);
                      }}
                      className="w-full bg-background border border-border rounded-lg p-2 text-sm"
                    />
                  </div>
                ))}
              </div>

              {/* Inclusions & Exclusions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Inclusions & Exclusions
                  </label>
                  <button
                    type="button"
                    onClick={() => setInclusions([...inclusions, { text: "", included: true }])}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>
                {inclusions.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={item.included ? "yes" : "no"}
                      onChange={e => {
                        const updated = [...inclusions];
                        updated[idx].included = e.target.value === "yes";
                        setInclusions(updated);
                      }}
                      className={`text-xs font-bold rounded-lg p-2 border ${
                        item.included ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-red-500/10 text-red-600 border-red-500/30"
                      }`}
                    >
                      <option value="yes">✓ Included</option>
                      <option value="no">✕ Excluded</option>
                    </select>
                    <input
                      type="text"
                      placeholder="e.g. Daily breakfast and dinner"
                      value={item.text}
                      onChange={e => {
                        const updated = [...inclusions];
                        updated[idx].text = e.target.value;
                        setInclusions(updated);
                      }}
                      className="flex-1 bg-background border border-border rounded-lg p-2 text-sm"
                    />
                    {inclusions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setInclusions(inclusions.filter((_, i) => i !== idx))}
                        className="text-red-500 p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Terms and Conditions
                </label>
                <textarea
                  rows={4}
                  value={formData.termsAndConditions}
                  onChange={e => setFormData({ ...formData, termsAndConditions: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-3 focus:outline-none focus:border-primary text-sm"
                  placeholder="Terms, cancellation rules, permit requirements..."
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="rounded-xl px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl px-8 bg-primary text-primary-foreground font-semibold"
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Group Tour"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
