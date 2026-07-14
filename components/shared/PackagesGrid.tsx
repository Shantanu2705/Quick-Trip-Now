"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Clock, Users, Star, Calendar as CalendarIcon, Plus, Minus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { getApplicablePrice } from "@/lib/price-utils";
import { useAuth } from "@/hooks/useAuth";

export function PackagesGrid({ tours, globalMaxChildAge = 12 }: { tours: any[], globalMaxChildAge?: number }) {
  const searchParams = useSearchParams();
  const initialDateParam = searchParams?.get("date");
  const initialAdultsParam = searchParams?.get("adults");
  const initialChildrenParam = searchParams?.get("children");

  const [date, setDate] = useState<Date | undefined>(initialDateParam ? new Date(initialDateParam) : undefined);
  const [adults, setAdults] = useState<number>(initialAdultsParam ? parseInt(initialAdultsParam, 10) || 2 : 2);
  const [children, setChildren] = useState<number>(initialChildrenParam ? parseInt(initialChildrenParam, 10) || 0 : 0);
  
  const totalTravelers = adults + children;
  const { userData } = useAuth();
  const discountPercent = userData?.role === "agent" || userData?.role === "admin" 
    ? (userData.discountPercentage ?? 20) 
    : 0;
  const hasDiscount = discountPercent > 0;
  const discountMultiplier = hasDiscount ? (100 - discountPercent) / 100 : 1;

  return (
    <div className="w-full">
      {/* Search Filters */}
      <div className="bg-background border border-border/60 rounded-3xl p-2 md:p-4 shadow-sm mb-12 flex flex-col md:flex-row items-center gap-4 relative z-10 max-w-3xl mx-auto">
        {/* Date Field */}
        <Popover>
          <PopoverTrigger className="flex-1 w-full rounded-2xl hover:bg-muted transition-colors p-3 cursor-pointer group border border-transparent hover:border-border flex items-center gap-4 text-left outline-none">
            <div className="bg-primary/10 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <CalendarIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Travel Date</span>
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
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </PopoverContent>
        </Popover>

        <div className="hidden md:block w-px h-12 bg-border" />

        {/* Travelers Field */}
        <Popover>
          <PopoverTrigger className="flex-1 w-full rounded-2xl hover:bg-muted transition-colors p-3 cursor-pointer group border border-transparent hover:border-border flex items-center gap-4 text-left outline-none">
            <div className="bg-primary/10 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Persons</span>
              <div className="flex items-center gap-1">
                <span className="text-base font-semibold text-foreground">
                  {adults} Adult{adults !== 1 ? 's' : ''}{children > 0 ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''}
                </span>
              </div>
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
        
        {/* Reset Button (only show if something is selected) */}
        {(date || totalTravelers > 2) && (
          <div className="px-4 pb-2 md:pb-0">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground rounded-full" onClick={() => { setDate(undefined); setAdults(2); setChildren(0); }}>
              Reset
            </Button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tours.map((tour) => {
          // Dynamically calculate price based on selected date and guests
          const basePricePerPerson = getApplicablePrice(tour.seasonalPrices, date);
          const childPrice = tour.childPrice || basePricePerPerson;
          const totalBasePrice = (basePricePerPerson * adults) + (childPrice * children);
          const finalPrice = hasDiscount ? totalBasePrice * discountMultiplier : totalBasePrice;

          return (
            <div
              key={tour.id}
              className="group bg-background rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-border/50 transition-all duration-300 flex flex-col"
            >
              <Link href={`/package/${tour.slug}`} className="relative h-64 overflow-hidden block">
                <Image
                  src={tour.image || "https://images.unsplash.com/photo-1626079973809-541dd441b83d?q=80&w=800&auto=format&fit=crop"}
                  alt={tour.title}
                  fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-primary">
                  {tour.category || "Tour"}
                </div>
              </Link>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold text-sm">{tour.rating || "5.0"}</span>
                    <span className="text-muted-foreground text-xs ml-1">({tour.reviews || 0})</span>
                  </div>
                </div>
                
                <Link href={`/package/${tour.slug}`}>
                  <h3 className="text-xl font-heading font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                    {tour.title}
                  </h3>
                </Link>
                
                <div className="flex items-center gap-4 text-muted-foreground text-sm mb-6 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{tour.duration || `${tour.days}D / ${tour.nights}N`}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>Shared/Private</span>
                  </div>
                </div>
                
                <div className="h-px w-full bg-border/50 mb-4" />
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                      {totalTravelers > 1 ? `Total for ${totalTravelers}` : "Starting from"}
                    </span>
                    {hasDiscount ? (
                      <div className="flex flex-col">
                        <span className="text-sm line-through text-muted-foreground">₹{totalBasePrice}</span>
                        <span className="text-2xl font-bold text-primary font-heading">₹{Math.round(finalPrice)}</span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-primary font-heading">₹{totalBasePrice}</span>
                    )}
                  </div>
                  <Link href={`/package/${tour.slug}`}>
                    <Button className="rounded-xl font-medium px-6">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        
        {tours.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No packages found. Check back later!
          </div>
        )}
      </div>
    </div>
  );
}
