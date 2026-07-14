"use client";

import { useAuth } from "@/hooks/useAuth";

export function PackagePriceDisplay({ 
  basePrice, 
  multiplier = 1,
  isTotal = false
}: { 
  basePrice: number;
  multiplier?: number;
  isTotal?: boolean;
}) {
  const { userData } = useAuth();
  const discountPercent = userData?.role === "agent" || userData?.role === "admin" 
    ? (userData.discountPercentage ?? 20) 
    : 0;
  const hasDiscount = discountPercent > 0;
  const discountMultiplier = hasDiscount ? (100 - discountPercent) / 100 : 1;
  
  const finalPrice = basePrice * discountMultiplier;
  const displayPrice = finalPrice * multiplier;

  if (isTotal) {
    return (
      <div className="flex justify-between items-center text-sm font-medium mb-6">
        <span className="text-muted-foreground">Total</span>
        <div className="flex flex-col items-end">
          {hasDiscount && (
            <span className="text-sm line-through text-muted-foreground">₹{basePrice * multiplier}</span>
          )}
          <span className="text-xl font-bold">₹{displayPrice}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <span className="text-muted-foreground text-sm uppercase tracking-wider font-semibold">Starting From</span>
      <div className="flex flex-col mt-1">
        {hasDiscount && (
          <span className="text-sm line-through text-muted-foreground">₹{basePrice}</span>
        )}
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-heading font-bold text-primary">₹{displayPrice}</span>
        </div>
      </div>
    </div>
  );
}
