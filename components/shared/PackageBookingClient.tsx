"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Users, Check, X, Calendar as CalendarIcon, ShieldCheck, Sparkles, Clock, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";

export function PackageBookingClient({
  packageSlug,
  packageData,
  maxAdults = 20,
  maxChildren = 10,
  maxInfants = 10,
  gstPercentage = 0,
  packageDetailsContent
}: {
  packageSlug: string;
  packageData?: any;
  maxAdults?: number;
  maxChildren?: number;
  maxInfants?: number;
  gstPercentage?: number;
  packageDetailsContent: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData } = useAuth();

  // State from URL query or defaults
  const [adults, setAdults] = useState(() => parseInt(searchParams?.get("adults") || "2", 10) || 2);
  const [children, setChildren] = useState(() => parseInt(searchParams?.get("children") || "0", 10) || 0);
  const [infants, setInfants] = useState(() => parseInt(searchParams?.get("infants") || "0", 10) || 0);
  
  const dateParam = searchParams?.get("date");
  const [date, setDate] = useState<Date | undefined>(dateParam ? new Date(dateParam) : undefined);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Default prices from package data
  const defaultAdultPrice = Number(packageData?.price) || 0;
  const defaultChildPrice = (packageData?.childPrice !== undefined && Number(packageData.childPrice) > 0)
    ? Number(packageData.childPrice)
    : defaultAdultPrice;

  // Check seasonal price override if a date is selected
  const activeSeason = useMemo(() => {
    if (!date || !packageData?.seasonalPrices || !Array.isArray(packageData.seasonalPrices)) return null;
    const dateStr = format(date, "yyyy-MM-dd");
    return packageData.seasonalPrices.find((sp: any) => 
      sp.startDate && sp.endDate && dateStr >= sp.startDate && dateStr <= sp.endDate
    ) || null;
  }, [date, packageData?.seasonalPrices]);

  const applicableAdultPrice = activeSeason ? (Number(activeSeason.price) || defaultAdultPrice) : defaultAdultPrice;
  const applicableChildPrice = activeSeason
    ? (activeSeason.childPrice !== undefined && Number(activeSeason.childPrice) > 0 
        ? Number(activeSeason.childPrice) 
        : (Number(activeSeason.price) || defaultChildPrice))
    : defaultChildPrice;

  // Real-time automatic calculations based on persons
  const adultsSubtotal = adults * applicableAdultPrice;
  const childrenSubtotal = children * applicableChildPrice;
  const totalBasePrice = adultsSubtotal + childrenSubtotal;

  // Agent discount calculation
  const discountPercent = userData?.role === "agent" || userData?.role === "admin" 
    ? (userData.discountPercentage ?? 20) 
    : 0;
  const hasDiscount = discountPercent > 0;
  const discountAmount = hasDiscount ? (totalBasePrice * discountPercent) / 100 : 0;
  const discountedBasePrice = totalBasePrice - discountAmount;

  // GST
  const gstAmount = (discountedBasePrice * gstPercentage) / 100;
  const finalPrice = discountedBasePrice + gstAmount;

  const totalPersons = adults + children;

  const handleBookNow = () => {
    if (!date) {
      alert("Please select a travel date.");
      return;
    }
    if (adults < 1) {
      alert("At least 1 adult traveler is required.");
      return;
    }
    if (!termsAccepted) {
      alert("Please read and accept the package terms and conditions.");
      return;
    }

    const params = new URLSearchParams({
      package: packageSlug,
      date: date.toISOString(),
      adults: adults.toString(),
      children: children.toString(),
      infants: infants.toString()
    });
    
    router.push(`/book?${params.toString()}`);
  };

  const termsText = packageData?.termsAndConditions || packageData?.terms || "";

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 flex flex-col lg:flex-row gap-12 relative">
      
      {/* LEFT COLUMN: Package Details & Configuration */}
      <div className="w-full lg:w-2/3">
        {packageDetailsContent}

        <hr className="my-12 border-border/50" />

        {/* PACKAGE BOOKING CONFIGURATION */}
        <div className="mb-12" id="booking-configuration">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <h3 className="text-2xl font-heading font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Configure Your Tour Package
            </h3>
            <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
              Package Rate: ₹{applicableAdultPrice.toLocaleString("en-IN")} / person
            </span>
          </div>

          <div className="bg-muted/10 border border-border/60 p-6 md:p-8 rounded-3xl space-y-8 shadow-sm">
            
            {/* 1. Travel Date Picker */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                1. Select Travel Date
              </label>
              <Popover>
                <PopoverTrigger 
                  className={`inline-flex items-center justify-start whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-3 w-full sm:w-auto font-medium rounded-xl h-14 ${!date && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                  {date ? format(date, "PPP") : "Choose your departure date"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar 
                    mode="single" 
                    selected={date} 
                    onSelect={setDate} 
                    disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))} 
                  />
                </PopoverContent>
              </Popover>

              {activeSeason && (
                <div className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 w-fit">
                  <Check className="w-3.5 h-3.5" /> Special seasonal pricing active for this travel window!
                </div>
              )}
            </div>

            {/* 2. Number of Travelers (Persons) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  2. Number of Travelers
                </label>
                <span className="text-xs font-semibold text-foreground">
                  Total: {totalPersons} {totalPersons === 1 ? "Person" : "Persons"}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Adults */}
                <div className="bg-background border border-border/70 p-4 rounded-2xl flex flex-col justify-between shadow-xs">
                  <div>
                    <span className="font-bold text-sm text-foreground block">Adults</span>
                    <span className="text-xs text-muted-foreground block mt-0.5">Ages 13 and above</span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                    <button 
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))} 
                      disabled={adults <= 1}
                      className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center font-bold text-lg hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="text-lg font-bold w-8 text-center">{adults}</span>
                    <button 
                      type="button"
                      onClick={() => setAdults(adults + 1)} 
                      disabled={adults >= maxAdults}
                      className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center font-bold text-lg hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="bg-background border border-border/70 p-4 rounded-2xl flex flex-col justify-between shadow-xs">
                  <div>
                    <span className="font-bold text-sm text-foreground block">Children</span>
                    <span className="text-xs text-muted-foreground block mt-0.5">Ages 2 to 12</span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                    <button 
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))} 
                      disabled={children <= 0}
                      className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center font-bold text-lg hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="text-lg font-bold w-8 text-center">{children}</span>
                    <button 
                      type="button"
                      onClick={() => setChildren(children + 1)} 
                      disabled={children >= maxChildren}
                      className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center font-bold text-lg hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="bg-background border border-border/70 p-4 rounded-2xl flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">Infants</span>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Free</span>
                    </div>
                    <span className="text-xs text-muted-foreground block mt-0.5">Under 2 years</span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                    <button 
                      type="button"
                      onClick={() => setInfants(Math.max(0, infants - 1))} 
                      disabled={infants <= 0}
                      className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center font-bold text-lg hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="text-lg font-bold w-8 text-center">{infants}</span>
                    <button 
                      type="button"
                      onClick={() => setInfants(infants + 1)} 
                      disabled={infants >= maxInfants}
                      className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center font-bold text-lg hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Automatic Price Breakdown Live Card */}
            <div className="bg-background border border-border/70 p-5 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                3. Live Calculation Breakdown
              </span>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center text-foreground">
                  <span className="text-muted-foreground">
                    Adults ({adults} × ₹{applicableAdultPrice.toLocaleString("en-IN")})
                  </span>
                  <span className="font-semibold">₹{adultsSubtotal.toLocaleString("en-IN")}</span>
                </div>

                {children > 0 && (
                  <div className="flex justify-between items-center text-foreground">
                    <span className="text-muted-foreground">
                      Children ({children} × ₹{applicableChildPrice.toLocaleString("en-IN")})
                    </span>
                    <span className="font-semibold">₹{childrenSubtotal.toLocaleString("en-IN")}</span>
                  </div>
                )}

                {infants > 0 && (
                  <div className="flex justify-between items-center text-muted-foreground text-xs">
                    <span>Infants ({infants})</span>
                    <span className="text-emerald-600 font-semibold">Free</span>
                  </div>
                )}

                <div className="h-px bg-border/50 my-2" />

                <div className="flex justify-between items-center text-foreground">
                  <span className="text-muted-foreground">Base Package Price</span>
                  <span className="font-bold">₹{totalBasePrice.toLocaleString("en-IN")}</span>
                </div>

                {hasDiscount && (
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Agent Discount ({discountPercent}%)</span>
                    <span>-₹{Math.round(discountAmount).toLocaleString("en-IN")}</span>
                  </div>
                )}

                {gstPercentage > 0 && (
                  <div className="flex justify-between items-center text-muted-foreground text-xs">
                    <span>GST ({gstPercentage}%)</span>
                    <span>+₹{Number(gstAmount.toFixed(2)).toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 text-base font-bold border-t border-border/50">
                  <span className="text-foreground">Total for {totalPersons} {totalPersons === 1 ? "Person" : "Persons"}</span>
                  <span className="text-2xl font-bold font-heading text-primary">
                    ₹{Number(finalPrice.toFixed(2)).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Package Inclusions & Exclusions */}
            {packageData?.inclusions && packageData.inclusions.length > 0 && (
              <div className="bg-background rounded-2xl border border-border/60 p-6 space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  What's Included & Excluded
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {packageData.inclusions.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      {item.included ? (
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${item.included ? "text-foreground font-medium" : "text-muted-foreground line-through"}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Terms & Conditions (Configured by Admin) */}
            <div className="bg-background rounded-2xl border border-border/60 p-6 space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Terms & Conditions
              </h4>

              {termsText ? (
                <div className="text-sm text-muted-foreground whitespace-pre-wrap p-4 bg-muted/20 rounded-xl leading-relaxed border border-border/30 max-h-48 overflow-y-auto">
                  {termsText}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Standard tour package terms and conditions apply. Full itinerary subject to weather and local conditions.
                </p>
              )}

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={termsAccepted} 
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    I have read and accept the package prices, terms, and booking conditions.
                  </span>
                </label>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Sticky Sidebar Price Summary */}
      <div className="w-full lg:w-1/3 relative">
        <div className="sticky top-28 space-y-6">
          <div className="bg-background rounded-3xl p-6 md:p-8 shadow-xl border border-border/60 space-y-6">
            <div>
              <span className="text-xs uppercase font-bold text-primary tracking-widest block mb-1">
                Booking Summary
              </span>
              <h3 className="text-2xl font-heading font-bold text-foreground">
                {packageData?.title || "Tour Package"}
              </h3>
            </div>

            <div className="space-y-3 py-4 border-y border-border/50 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Travel Date</span>
                <span className="font-semibold text-right text-foreground">
                  {date ? format(date, "MMM dd, yyyy") : (
                    <span className="text-amber-500 text-xs font-semibold">Select date</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Persons</span>
                <span className="font-semibold text-right text-foreground">
                  {adults} Adult{adults > 1 ? "s" : ""}{children > 0 ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""}{infants > 0 ? `, ${infants} Infant` : ""}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Rate per Adult</span>
                <span className="font-semibold text-right text-foreground">
                  ₹{applicableAdultPrice.toLocaleString("en-IN")}
                </span>
              </div>

              {children > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Rate per Child</span>
                  <span className="font-semibold text-right text-foreground">
                    ₹{applicableChildPrice.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              {hasDiscount && (
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                  <span>Agent Discount ({discountPercent}%)</span>
                  <span>-₹{Math.round(discountAmount).toLocaleString("en-IN")}</span>
                </div>
              )}

              {gstPercentage > 0 && (
                <div className="flex justify-between items-center text-muted-foreground text-xs">
                  <span>GST ({gstPercentage}%)</span>
                  <span>+₹{Number(gstAmount.toFixed(2)).toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>

            {/* Total Display */}
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1">
                Total Price ({totalPersons} {totalPersons === 1 ? "Person" : "Persons"})
              </span>
              <div className="text-4xl font-heading font-bold text-primary">
                ₹{Number(finalPrice.toFixed(2)).toLocaleString("en-IN")}
              </div>
              {gstPercentage > 0 && (
                <span className="text-xs text-muted-foreground">Includes applicable GST ({gstPercentage}%)</span>
              )}
            </div>

            {/* Book Now Button */}
            <div className="space-y-2 pt-2">
              <Button 
                onClick={handleBookNow} 
                disabled={!date || !termsAccepted}
                size="lg" 
                className="w-full rounded-xl py-6 text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all disabled:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Book Package Now
              </Button>

              {!date && (
                <p className="text-xs text-center text-amber-500 font-medium">
                  Please select your travel date above to continue.
                </p>
              )}
              {date && !termsAccepted && (
                <p className="text-xs text-center text-muted-foreground font-medium">
                  Please accept the terms and conditions to proceed.
                </p>
              )}
              {date && termsAccepted && (
                <p className="text-xs text-center text-muted-foreground">
                  You won't be charged yet.
                </p>
              )}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
