"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Calendar as CalendarIcon, Users, Compass, Car, Sparkles, Navigation, Clock, Palmtree, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { getDestinations, getVehicles, getCabRoutes, Destination, Vehicle, CabRoute } from "@/lib/firestore-utils";

const TABS = [
  { id: "tours", label: "Tours and Packages", icon: Compass },
  { id: "cabs", label: "Private Transfers", icon: Car },
];

export function BookingSearchCard({ globalMaxChildAge = 12 }: { globalMaxChildAge?: number }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("tours");
  const [date, setDate] = useState<Date>();
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [guestError, setGuestError] = useState("");
  const [destination, setDestination] = useState("");
  const [cabRouteId, setCabRouteId] = useState("");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [cabRoutes, setCabRoutes] = useState<CabRoute[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [dests, vechs, routes] = await Promise.all([
          getDestinations(),
          getVehicles(),
          getCabRoutes()
        ]);
        setDestinations(dests);
        setVehicles(vechs);
        setCabRoutes(routes);
      } catch (err) {
        console.error("Failed to load options", err);
      }
    }
    loadData();
  }, []);

  const handleExplore = () => {
    if (adults < 1) {
      setGuestError("Need at least 1 adult");
      return;
    }
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (date) params.set("date", date.toISOString());
    params.set("adults", adults.toString());
    params.set("children", children.toString());
    
    router.push(`/packages?${params.toString()}`);
  };

  const handleCabExplore = () => {
    if (!cabRouteId) {
      setGuestError("Please select a route");
      return;
    }
    if (!date) {
      setGuestError("Please select a date");
      return;
    }
    const params = new URLSearchParams();
    params.set("type", "cabs");
    params.set("route", cabRouteId);
    params.set("date", date.toISOString());
    params.set("adults", adults.toString());
    params.set("children", children.toString());
    
    router.push(`/book?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[1100px] mx-auto relative flex flex-col items-center"
    >
      {/* Premium Glass Tabs */}
      <div className="flex items-center p-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] mb-8 z-10">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2.5 px-6 py-3 rounded-full transition-all duration-300",
                isActive ? "text-primary-foreground" : "text-white hover:bg-white/10"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTabBubble"
                  className="absolute inset-0 bg-primary rounded-full shadow-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className={cn("w-4 h-4 relative z-10", isActive ? "text-primary-foreground" : "opacity-90")} />
              <span className={cn("text-sm font-semibold tracking-wide relative z-10")}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Search Container - Solid background with subtle glow */}
      <div className="w-full bg-background rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-2 md:p-3 relative z-0 border border-border/60">
        <AnimatePresence mode="wait">
          {/* CURATED TOURS TAB */}
          {activeTab === "tours" && (
            <motion.div
              key="tours"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col md:flex-row items-center w-full gap-2"
            >
              {/* Destination Field (Dropdown) */}
              <div className="flex-1 w-full rounded-2xl hover:bg-muted transition-colors p-3 md:p-4 cursor-pointer group border border-transparent hover:border-border flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex flex-col flex-1 relative">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Destination</span>
                  <Select value={destination} onValueChange={(val) => setDestination(val || "")}>
                    <SelectTrigger className="border-none shadow-none p-0 h-auto focus:ring-0 bg-transparent text-left text-base font-semibold w-full">
                      <SelectValue placeholder="Where to next?" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinations.map(d => (
                        <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                      ))}
                      {destinations.length === 0 && <SelectItem value="loading" disabled>Loading...</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-12 bg-border" />

              {/* Date Field */}
              <Popover>
                <PopoverTrigger className="flex-1 w-full rounded-2xl hover:bg-muted transition-colors p-3 md:p-4 cursor-pointer group border border-transparent hover:border-border flex items-center gap-4 text-left outline-none">
                  <div className="bg-primary/10 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <CalendarIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Travel Dates</span>
                    <span className="font-semibold text-foreground/80">
                      {date ? format(date, "PPP") : "Add dates"}
                    </span>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>

              {/* Divider */}
              <div className="hidden md:block w-px h-12 bg-border" />

              {/* Travelers Field */}
              <Popover>
                <PopoverTrigger className="flex-1 w-full rounded-2xl hover:bg-muted transition-colors p-3 md:p-4 cursor-pointer group border border-transparent hover:border-border flex items-center gap-4 text-left outline-none">
                  <div className="bg-primary/10 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex flex-col flex-1 relative">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Travelers</span>
                    <div className="flex items-center gap-1">
                      <span className="text-base font-semibold text-foreground">
                        {adults} Adult{adults !== 1 ? 's' : ''}{children > 0 ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''}
                      </span>
                    </div>
                    {guestError && (
                      <span className="absolute -bottom-6 left-0 text-[10px] text-red-500 font-bold tracking-wide whitespace-nowrap">
                        {guestError}
                      </span>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">Adults</span>
                        <span className="text-xs text-muted-foreground">Ages 13 or above</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={adults <= 1}>
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-4 text-center font-medium">{adults}</span>
                        <button onClick={() => setAdults(adults + 1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="h-px bg-border/50 w-full" />
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">Children</span>
                        <span className="text-xs text-muted-foreground">Ages 2-{globalMaxChildAge}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={children <= 0}>
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-4 text-center font-medium">{children}</span>
                        <button onClick={() => setChildren(children + 1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Search Button */}
              <div className="w-full md:w-auto p-2 relative">
                <button 
                  onClick={handleExplore}
                  className="w-full md:w-[160px] h-[64px] bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl flex items-center justify-center gap-3 font-semibold transition-all shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 text-lg">
                  <Search className="w-5 h-5" />
                  <span>Explore</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* PRIVATE TRANSFERS TAB */}
          {activeTab === "cabs" && (
            <motion.div
              key="cabs"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col md:flex-row items-center w-full gap-2"
            >
              {/* Select Cab Route Field (Dropdown) */}
              <div className="flex-1 w-full rounded-2xl hover:bg-muted transition-colors p-3 md:p-4 cursor-pointer group border border-transparent hover:border-border flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Select Package</span>
                  <Select value={cabRouteId} onValueChange={(val) => val && setCabRouteId(val)}>
                    <SelectTrigger className="border-none shadow-none p-0 h-auto focus:ring-0 bg-transparent text-left text-base font-semibold w-full">
                      <SelectValue placeholder="Where are you going?" />
                    </SelectTrigger>
                    <SelectContent className="min-w-[320px] p-2">
                      {cabRoutes.length > 0 ? (
                        cabRoutes.map((route) => (
                          <SelectItem key={route.id} value={route.id} className="py-3 px-4 rounded-xl mb-1 cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-base text-foreground">{route.title}</span>
                              {route.subtitle && <span className="text-[13px] text-muted-foreground">{route.subtitle}</span>}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled className="py-3 px-4">
                          <span className="text-muted-foreground text-sm">Loading routes...</span>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-12 bg-border" />

              {/* Date Field */}
              <Popover>
                <PopoverTrigger className="flex-1 w-full rounded-2xl hover:bg-muted transition-colors p-3 md:p-4 cursor-pointer group border border-transparent hover:border-border flex items-center gap-4 text-left outline-none">
                  <div className="bg-primary/10 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <CalendarIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Date</span>
                    <span className="font-semibold text-foreground/80">
                      {date ? format(date, "PPP") : "Select date"}
                    </span>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>

              {/* Divider */}
              <div className="hidden md:block w-px h-12 bg-border" />

              {/* Travelers Field */}
              <Popover>
                <PopoverTrigger className="flex-1 w-full rounded-2xl hover:bg-muted transition-colors p-3 md:p-4 cursor-pointer group border border-transparent hover:border-border flex items-center gap-4 text-left outline-none">
                  <div className="bg-primary/10 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex flex-col flex-1 relative">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Travelers</span>
                    <div className="flex items-center gap-1">
                      <span className="text-base font-semibold text-foreground">
                        {adults} Adult{adults !== 1 ? 's' : ''}{children > 0 ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''}
                      </span>
                    </div>
                    {guestError && (
                      <span className="absolute -bottom-6 left-0 text-[10px] text-red-500 font-bold tracking-wide whitespace-nowrap">
                        {guestError}
                      </span>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">Adults</span>
                        <span className="text-xs text-muted-foreground">Ages 13 or above</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={adults <= 1}>
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-4 text-center font-medium">{adults}</span>
                        <button onClick={() => setAdults(adults + 1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="h-px bg-border/50 w-full" />
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">Children</span>
                        <span className="text-xs text-muted-foreground">Ages 2-{globalMaxChildAge}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={children <= 0}>
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-4 text-center font-medium">{children}</span>
                        <button onClick={() => setChildren(children + 1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Search Button */}
              <div className="w-full md:w-auto p-2">
                <button 
                  onClick={handleCabExplore}
                  className="w-full md:w-[160px] h-[64px] bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl flex items-center justify-center gap-3 font-semibold transition-all shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 text-lg">
                  <Search className="w-5 h-5" />
                  <span>Book Vehicle</span>
                </button>
              </div>
            </motion.div>
          )}


        </AnimatePresence>
      </div>
    </motion.div>
  );
}
