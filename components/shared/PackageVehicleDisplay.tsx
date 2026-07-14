"use client";

import { useState } from "react";
import Image from "next/image";
import { Users, Car } from "lucide-react";

export function PackageVehicleDisplay({ vehicles }: { vehicles: any[] }) {
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const totalTravelers = adults + children;

  // Calculate required quantities of each vehicle
  // E.g., if totalTravelers = 6, and maxCapacity = 4, quantity = Math.ceil(6 / 4) = 2.
  const recommendedVehicles = vehicles.map(v => {
    // Total capacity per vehicle (sum of maxAdults + maxChildren, bounded by seats if needed, but we'll use seats as a simple cap or maxAdults+maxChildren)
    // The user rules say: "if there is a car that has an accomodation of only 4 peoples and a user choose 4 adults and 2 childs then the total number becomes 6 which is greater than the number"
    // So capacity = v.seats OR (v.maxAdults + v.maxChildren) whichever is the hard cap. Let's use `v.seats` as total capacity per vehicle for simplicity.
    const capacityPerVehicle = v.seats || 4;
    const qtyRequired = Math.max(1, Math.ceil(totalTravelers / capacityPerVehicle));

    return {
      ...v,
      qtyRequired
    };
  });

  return (
    <div className="mb-12">
      <h3 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
        <Car className="w-6 h-6 text-primary" /> Available Vehicles
      </h3>
      
      <div className="bg-muted/20 p-6 rounded-3xl border border-border/50 mb-6">
        <p className="text-sm text-muted-foreground mb-4">Select the number of travelers to see required vehicle quantities.</p>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Adults</label>
            <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-2 py-1">
              <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-lg font-medium">-</button>
              <span className="w-4 text-center font-semibold">{adults}</span>
              <button type="button" onClick={() => setAdults(adults + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-lg font-medium">+</button>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Children</label>
            <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-2 py-1">
              <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-lg font-medium">-</button>
              <span className="w-4 text-center font-semibold">{children}</span>
              <button type="button" onClick={() => setChildren(children + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-lg font-medium">+</button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0 ml-auto bg-primary/10 text-primary px-4 py-2 rounded-xl font-medium">
            <Users className="w-5 h-5" /> Total Travelers: {totalTravelers}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendedVehicles.map(v => (
          <div key={v.id} className="flex gap-4 p-4 border border-border/50 rounded-2xl hover:border-primary/50 transition-colors bg-card">
            {v.image ? (
              <div className="w-24 h-20 rounded-xl overflow-hidden relative shrink-0">
                <Image src={v.image} alt={v.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-24 h-20 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                <Car className="w-8 h-8" />
              </div>
            )}
            <div className="flex flex-col justify-center">
              <h4 className="font-bold text-foreground text-lg">{v.name}</h4>
              <p className="text-sm text-muted-foreground">{v.type} • AC: {v.ac ? "Yes" : "No"}</p>
              
              <div className="mt-2 inline-flex items-center gap-2 bg-primary/10 text-primary px-2 py-1 rounded-lg text-xs font-semibold w-fit">
                Requires {v.qtyRequired} {v.qtyRequired > 1 ? "Vehicles" : "Vehicle"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
