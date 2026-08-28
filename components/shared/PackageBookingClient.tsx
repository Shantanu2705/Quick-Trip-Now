"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Users, Car, Check, X, Calendar as CalendarIcon, Info } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PackagePriceDisplay } from "./PackagePriceDisplay";

export function PackageBookingClient({
  packageSlug,
  maxAdults,
  maxChildren,
  maxInfants,
  gstPercentage,
  vehicles,
  packageDetailsContent
}: {
  packageSlug: string;
  maxAdults: number;
  maxChildren: number;
  maxInfants: number;
  gstPercentage: number;
  vehicles: any[];
  packageDetailsContent: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [adults, setAdults] = useState(() => parseInt(searchParams?.get("adults") || "2", 10) || 2);
  const [children, setChildren] = useState(() => parseInt(searchParams?.get("children") || "0", 10) || 0);
  const [infants, setInfants] = useState(() => parseInt(searchParams?.get("infants") || "0", 10) || 0);
  
  const dateParam = searchParams?.get("date");
  const [date, setDate] = useState<Date | undefined>(dateParam ? new Date(dateParam) : undefined);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  const totalTravelers = adults + children + infants;

  // Process vehicles to determine required quantities and seasonal prices
  const processedVehicles = useMemo(() => {
    let availableVehicles = vehicles;
    
    if (date) {
      const dateStr = format(date, "yyyy-MM-dd");
      availableVehicles = availableVehicles.filter(v => {
        if (v.unavailableDates && v.unavailableDates.includes(dateStr)) return false;
        return true;
      });
    }

    return availableVehicles.map(v => {
      let currentPrice = v.price || 0;
      if (date && v.seasonalPrices) {
        const dateStr = format(date, "yyyy-MM-dd");
        const validPriceObj = v.seasonalPrices.find((sp: any) => dateStr >= sp.startDate && dateStr <= sp.endDate);
        if (validPriceObj) {
          currentPrice = validPriceObj.price;
        }
      }

      const calculateCars = () => {
        let cars = 0;
        let a = adults;
        let c = children;
        let i = infants;
        let maxA = v.maxAdults || v.seats || 4;
        let totalSeats = v.seats || 4;
      
        if (a === 0 && c === 0 && i === 0) return 1;
      
        while (a > 0 || c > 0 || i > 0) {
          cars++;
          let adultsInThisCar = Math.min(a, maxA);
          a -= adultsInThisCar;
          
          let seatsLeft = totalSeats - adultsInThisCar;
          
          let childrenInThisCar = Math.min(c, seatsLeft);
          c -= childrenInThisCar;
          seatsLeft -= childrenInThisCar;
          
          let infantsInThisCar = Math.min(i, seatsLeft);
          i -= infantsInThisCar;
          
          if (totalSeats <= 0) break;
        }
        return cars;
      };

      const qtyRequired = calculateCars();
      return { ...v, qtyRequired, currentPrice };
    });
  }, [vehicles, adults, children, infants, date]);

  const selectedVehicle = processedVehicles.find(v => v.id === selectedVehicleId);
  const requiredVehiclesCount = selectedVehicle?.qtyRequired || 1;
  const vehiclePrice = selectedVehicle?.currentPrice || 0;
  
  // Total Base Price is calculated purely from vehicles
  const calculatedBasePrice = selectedVehicle ? vehiclePrice * requiredVehiclesCount : 0;

  const handleBookNow = () => {
    if (!date) {
      alert("Please select a travel date.");
      return;
    }
    if (!selectedVehicleId) {
      alert("Please select a vehicle.");
      return;
    }

    const params = new URLSearchParams({
      package: packageSlug,
      date: date.toISOString(),
      adults: adults.toString(),
      children: children.toString(),
      infants: infants.toString(),
      vehicleId: selectedVehicleId,
      vehiclesRequired: requiredVehiclesCount.toString()
    });
    
    router.push(`/book?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 flex flex-col lg:flex-row gap-12 relative">
      
      {/* LEFT COLUMN: Package Details & Booking Inputs */}
      <div className="w-full lg:w-2/3">
        {packageDetailsContent}

        <hr className="my-12 border-border/50" />

        {/* BOOKING CONFIGURATION */}
        <div className="mb-12" id="booking-configuration">
          <h3 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
            Configure Your Trip
          </h3>

          <div className="bg-muted/10 border border-border/50 p-6 md:p-8 rounded-3xl space-y-8">
            
            {/* Travel Date */}
            <div>
              <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Travel Date</label>
              <Popover>
                <PopoverTrigger 
                  className={`inline-flex items-center justify-start whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 w-full md:w-auto font-normal rounded-xl h-14 ${!date && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  {date ? format(date, "PPP") : "Select travel date"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar 
                    mode="single" 
                    selected={date} 
                    onSelect={setDate} 
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} 
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Travelers */}
            <div>
              <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Travelers</label>
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col bg-background border border-border p-3 rounded-2xl">
                  <span className="text-xs font-semibold text-muted-foreground mb-2">Adults (Max {maxAdults})</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold hover:bg-primary/20 hover:text-primary transition-colors">-</button>
                    <span className="w-4 text-center font-bold">{adults}</span>
                    <button onClick={() => setAdults(Math.min(maxAdults, adults + 1))} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold hover:bg-primary/20 hover:text-primary transition-colors">+</button>
                  </div>
                </div>

                <div className="flex flex-col bg-background border border-border p-3 rounded-2xl">
                  <span className="text-xs font-semibold text-muted-foreground mb-2">Children (Max {maxChildren})</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold hover:bg-primary/20 hover:text-primary transition-colors">-</button>
                    <span className="w-4 text-center font-bold">{children}</span>
                    <button onClick={() => setChildren(Math.min(maxChildren, children + 1))} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold hover:bg-primary/20 hover:text-primary transition-colors">+</button>
                  </div>
                </div>

                <div className="flex flex-col bg-background border border-border p-3 rounded-2xl">
                  <span className="text-xs font-semibold text-muted-foreground mb-2">Infants (Max {maxInfants})</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setInfants(Math.max(0, infants - 1))} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold hover:bg-primary/20 hover:text-primary transition-colors">-</button>
                    <span className="w-4 text-center font-bold">{infants}</span>
                    <button onClick={() => setInfants(Math.min(maxInfants, infants + 1))} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold hover:bg-primary/20 hover:text-primary transition-colors">+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Selection */}
            <div>
              <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Select Vehicle</span>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs normal-case font-semibold">
                  Required: {totalTravelers} Travelers
                </span>
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {processedVehicles.map(v => (
                  <div 
                    key={v.id} 
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`cursor-pointer border-2 rounded-2xl p-4 transition-all ${
                      selectedVehicleId === v.id 
                        ? 'border-primary bg-primary/5 shadow-md ring-4 ring-primary/10' 
                        : 'border-border/50 bg-background hover:border-primary/50'
                    }`}
                  >
                    <div className="flex gap-4">
                      {v.image ? (
                        <div className="w-20 h-16 rounded-xl overflow-hidden relative shrink-0">
                          <Image src={v.image} alt={v.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-20 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                          <Car className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex flex-col justify-center flex-1">
                        <h4 className="font-bold text-foreground">{v.name}</h4>
                        <div className="text-sm text-muted-foreground flex justify-between items-center mt-1">
                          <span>{v.seats} Seats/Car</span>
                          <span className="font-semibold text-foreground">
                            {date ? `₹${v.currentPrice}` : "Select date for price"}
                          </span>
                        </div>
                      </div>
                    </div>
                    {v.qtyRequired > 1 && (
                      <div className="mt-3 bg-amber-500/10 text-amber-600 border border-amber-500/20 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Due to party size, {v.qtyRequired} vehicles are required.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Vehicle Details */}
            {selectedVehicle && (
              <div className="mt-6 bg-background rounded-2xl border border-border/50 overflow-hidden">
                <div className="bg-muted/30 px-6 py-4 border-b border-border/50">
                  <h4 className="font-bold flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary" /> 
                    {selectedVehicle.name} Details
                  </h4>
                </div>
                <div className="p-6 space-y-6">
                  
                  {/* Vehicle Inclusions/Exclusions */}
                  {(selectedVehicle.inclusions && selectedVehicle.inclusions.length > 0) && (
                    <div>
                      <h5 className="text-sm font-bold text-foreground mb-3">Vehicle Inclusions & Exclusions</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedVehicle.inclusions.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2">
                            {item.included ? (
                              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                            )}
                            <span className={`text-sm ${item.included ? "text-foreground/80" : "text-muted-foreground line-through"}`}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vehicle Terms */}
                  {selectedVehicle.termsAndConditions && (
                    <div>
                      <h5 className="text-sm font-bold text-foreground mb-2">Vehicle Terms & Conditions</h5>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap p-4 bg-muted/20 rounded-xl">
                        {selectedVehicle.termsAndConditions}
                      </div>
                    </div>
                  )}

                  {(!selectedVehicle.inclusions?.length && !selectedVehicle.termsAndConditions) && (
                    <p className="text-sm text-muted-foreground italic">No additional details provided for this vehicle.</p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Sticky Sidebar */}
      <div className="w-full lg:w-1/3 relative">
        <div className="sticky top-28 space-y-6">
          <div className="bg-background rounded-3xl p-6 md:p-8 shadow-xl border border-border/50">
            <h3 className="text-2xl font-heading font-bold mb-6">Price Summary</h3>
            
            {!selectedVehicle ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Select a vehicle to see your total price.</p>
                <div className="w-16 h-1 bg-border rounded-full mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-border/50">
                  <span className="text-muted-foreground">Vehicle</span>
                  <span className="font-medium text-right">{selectedVehicle.name}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-border/50">
                  <span className="text-muted-foreground">Quantity Required</span>
                  <span className="font-semibold text-right text-primary">x {requiredVehiclesCount}</span>
                </div>
                
                <PackagePriceDisplay 
                  basePrice={calculatedBasePrice}
                  gstPercentage={gstPercentage}
                  isTotal={true}
                />
                
                <Button 
                  onClick={handleBookNow} 
                  size="lg" 
                  className="w-full rounded-xl py-6 text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all mt-4"
                >
                  Book Now
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  You won't be charged yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
