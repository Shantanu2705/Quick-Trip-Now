"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar as CalendarIcon, User, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { PackagePriceDisplay } from "./PackagePriceDisplay";
import { getApplicablePrice } from "@/lib/price-utils";

export function PackageBookingSidebar({ 
  packageSlug, 
  seasonalPrices,
  childPrice,
  maxChildAge
}: { 
  packageSlug: string;
  seasonalPrices: any[];
  childPrice?: number;
  maxChildAge?: number;
}) {
  const [date, setDate] = useState<Date>();
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);

  const activePrice = getApplicablePrice(seasonalPrices, date);
  const applicableChildPrice = childPrice ?? activePrice;
  const combinedBasePrice = (activePrice * adults) + (applicableChildPrice * children);
  
  const isValidGuests = adults > 0;
  const totalTravelers = adults + children;

  return (
    <div className="sticky top-32 bg-background border border-border shadow-xl rounded-3xl p-6 lg:p-8">
      <PackagePriceDisplay basePrice={activePrice} />

      <div className="space-y-4 mb-6">
        {/* Date Field */}
        <Popover>
          <PopoverTrigger className="w-full bg-muted/30 rounded-xl p-4 border border-border/50 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors text-left outline-none">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Dates</span>
                <span className="font-medium text-sm">
                  {date ? format(date, "PPP") : "Select travel dates"}
                </span>
              </div>
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

        {/* Travelers Field */}
        <Popover>
          <PopoverTrigger className="w-full bg-muted/30 rounded-xl p-4 border border-border/50 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors text-left group outline-none">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <div className="flex flex-col flex-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Travelers</span>
                <span className="text-sm font-medium">
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
                  <span className="text-xs text-muted-foreground">Ages 2-{maxChildAge || 12}</span>
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
      </div>

      <PackagePriceDisplay basePrice={combinedBasePrice} multiplier={1} isTotal />

      {!isValidGuests && totalTravelers > 0 && (
        <div className="mb-4 text-xs font-medium text-destructive bg-destructive/10 p-2 rounded text-center">
          Minimum 1 adult required to book.
        </div>
      )}

      {isValidGuests ? (
        <Link href={`/book?package=${packageSlug}&date=${date?.toISOString() || ""}&adults=${adults}&children=${children}`}>
          <Button className="w-full py-6 text-lg rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
            Book Now
          </Button>
        </Link>
      ) : (
        <Button disabled className="w-full py-6 text-lg rounded-xl font-bold transition-all">
          Book Now
        </Button>
      )}
      
      <p className="text-center text-xs text-muted-foreground mt-4">
        You won't be charged yet.
      </p>
    </div>
  );
}
