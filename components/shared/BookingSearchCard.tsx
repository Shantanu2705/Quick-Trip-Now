"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Calendar as CalendarIcon, Users, Compass, Car, Sparkles, Navigation, Clock, Palmtree } from "lucide-react";
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

const TABS = [
  { id: "tours", label: "Curated Tours", icon: Compass },
  { id: "cabs", label: "Private Transfers", icon: Car },
  { id: "bespoke", label: "Bespoke Journey", icon: Sparkles },
];

export function BookingSearchCard() {
  const [activeTab, setActiveTab] = useState("tours");
  const [date, setDate] = useState<Date>();
  const [guests, setGuests] = useState<number | string>(2);
  const [guestError, setGuestError] = useState("");

  const handleExplore = () => {
    if (guests === "" || Number(guests) < 1) {
      setGuestError("Please enter at least 1 guest.");
      return;
    }
    // Proceed with search
    console.log("Exploring with:", { date, guests });
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
                  <Select>
                    <SelectTrigger className="border-none shadow-none p-0 h-auto focus:ring-0 bg-transparent text-left text-base font-semibold w-full">
                      <SelectValue placeholder="Where to next?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sikkim">Sikkim</SelectItem>
                      <SelectItem value="east-sikkim">East Sikkim</SelectItem>
                      <SelectItem value="north-sikkim">North Sikkim</SelectItem>
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
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Divider */}
              <div className="hidden md:block w-px h-12 bg-border" />

              {/* Guests Field */}
              <div className="flex-1 w-full rounded-2xl hover:bg-muted transition-colors p-3 md:p-4 cursor-pointer group border border-transparent hover:border-border flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="flex flex-col flex-1 relative">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Guests</span>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      min="1" 
                      value={guests} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setGuestError("");
                        if (val === "") {
                          setGuests("");
                        } else {
                          const parsed = parseInt(val, 10);
                          setGuests(isNaN(parsed) ? "" : parsed);
                        }
                      }} 
                      className="w-12 bg-transparent border-none p-0 h-auto focus:ring-0 text-left text-base font-semibold outline-none appearance-none" 
                    />
                    <span className="text-base font-semibold text-foreground">Travelers</span>
                  </div>
                  {guestError && (
                    <span className="absolute -bottom-6 left-0 text-[10px] text-red-500 font-bold tracking-wide whitespace-nowrap">
                      {guestError}
                    </span>
                  )}
                </div>
              </div>

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
              {/* Pick-up Field (Dropdown) */}
              <div className="flex-1 w-full rounded-2xl hover:bg-muted transition-colors p-3 md:p-4 cursor-pointer group border border-transparent hover:border-border flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Pick-up</span>
                  <Select>
                    <SelectTrigger className="border-none shadow-none p-0 h-auto focus:ring-0 bg-transparent text-left text-base font-semibold w-full">
                      <SelectValue placeholder="From where?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sikkim">Sikkim</SelectItem>
                      <SelectItem value="east-sikkim">East Sikkim</SelectItem>
                      <SelectItem value="north-sikkim">North Sikkim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-12 bg-border" />

              {/* Drop-off Field (Dropdown) */}
              <div className="flex-1 w-full rounded-2xl hover:bg-muted transition-colors p-3 md:p-4 cursor-pointer group border border-transparent hover:border-border flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Navigation className="w-6 h-6 text-primary" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Drop-off</span>
                  <Select>
                    <SelectTrigger className="border-none shadow-none p-0 h-auto focus:ring-0 bg-transparent text-left text-base font-semibold w-full">
                      <SelectValue placeholder="To where?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sikkim">Sikkim</SelectItem>
                      <SelectItem value="east-sikkim">East Sikkim</SelectItem>
                      <SelectItem value="north-sikkim">North Sikkim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-12 bg-border" />

              {/* Vehicle Type Field (Dropdown) */}
              <div className="flex-1 w-full rounded-2xl hover:bg-muted transition-colors p-3 md:p-4 cursor-pointer group border border-transparent hover:border-border flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Vehicle</span>
                  <Select>
                    <SelectTrigger className="border-none shadow-none p-0 h-auto focus:ring-0 bg-transparent text-left text-base font-semibold w-full">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="premium-suv">Premium SUV</SelectItem>
                      <SelectItem value="luxury-sedan">Luxury Sedan</SelectItem>
                      <SelectItem value="standard-suv">Standard SUV</SelectItem>
                      <SelectItem value="hatchback">Hatchback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search Button */}
              <div className="w-full md:w-auto p-2">
                <Link 
                  href="/book?type=cabs"
                  className="w-full md:w-[160px] h-[64px] bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl flex items-center justify-center gap-3 font-semibold transition-all shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 text-lg">
                  <Search className="w-5 h-5" />
                  <span>Book Vehicle</span>
                </Link>
              </div>
            </motion.div>
          )}

          {/* BESPOKE JOURNEY TAB */}
          {activeTab === "bespoke" && (
            <motion.div
              key="bespoke"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col md:flex-row items-center w-full gap-2"
            >
              {/* Region Field (Dropdown) */}
              <div className="flex-1 w-full rounded-2xl hover:bg-muted transition-colors p-3 md:p-4 cursor-pointer group border border-transparent hover:border-border flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Region</span>
                  <Select>
                    <SelectTrigger className="border-none shadow-none p-0 h-auto focus:ring-0 bg-transparent text-left text-base font-semibold w-full">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sikkim">Sikkim</SelectItem>
                      <SelectItem value="east-sikkim">East Sikkim</SelectItem>
                      <SelectItem value="north-sikkim">North Sikkim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-12 bg-border" />

              {/* Vibe Field (Dropdown) */}
              <div className="flex-1 w-full rounded-2xl hover:bg-muted transition-colors p-3 md:p-4 cursor-pointer group border border-transparent hover:border-border flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Palmtree className="w-6 h-6 text-primary" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Experience</span>
                  <Select>
                    <SelectTrigger className="border-none shadow-none p-0 h-auto focus:ring-0 bg-transparent text-left text-base font-semibold w-full">
                      <SelectValue placeholder="Select vibe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adventure">Adventure</SelectItem>
                      <SelectItem value="wellness">Wellness Retreat</SelectItem>
                      <SelectItem value="luxury">Luxury & Comfort</SelectItem>
                      <SelectItem value="culture">Culture & Heritage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-12 bg-border" />

              {/* Duration Field (Dropdown) */}
              <div className="flex-1 w-full rounded-2xl hover:bg-muted transition-colors p-3 md:p-4 cursor-pointer group border border-transparent hover:border-border flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Duration</span>
                  <Select>
                    <SelectTrigger className="border-none shadow-none p-0 h-auto focus:ring-0 bg-transparent text-left text-base font-semibold w-full">
                      <SelectValue placeholder="How long?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3-days">3 Days</SelectItem>
                      <SelectItem value="5-days">5 Days</SelectItem>
                      <SelectItem value="7-days">7 Days</SelectItem>
                      <SelectItem value="10-days">10+ Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="w-full md:w-auto p-2">
                <button className="w-full md:w-[180px] h-[64px] bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-2xl flex items-center justify-center gap-2 font-semibold transition-all shadow-lg hover:shadow-secondary/20 hover:-translate-y-0.5 active:translate-y-0 text-base">
                  <Sparkles className="w-4 h-4" />
                  <span>Craft Journey</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
