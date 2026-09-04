"use client";

import { useAuth } from "@/hooks/useAuth";

export function PackagePriceDisplay({ 
  basePrice, 
  multiplier = 1,
  isTotal = false,
  gstPercentage = 0
}: { 
  basePrice: number;
  multiplier?: number;
  isTotal?: boolean;
  gstPercentage?: number;
}) {
  const { userData } = useAuth();
  const discountPercent = userData?.role === "agent" || userData?.role === "admin" 
    ? (userData.discountPercentage ?? 20) 
    : 0;
  const hasDiscount = discountPercent > 0;
  const discountMultiplier = hasDiscount ? (100 - discountPercent) / 100 : 1;
  
  const finalPrice = basePrice * discountMultiplier;
  const displayPrice = finalPrice * multiplier;
  const gstAmount = (displayPrice * gstPercentage) / 100;

  if (isTotal) {
    return (
      <div className="flex justify-between items-center text-sm font-medium mb-6">
        <span className="text-muted-foreground">Total</span>
        <div className="flex flex-col items-end">
          {hasDiscount && (
            <span className="text-sm line-through text-muted-foreground">₹{basePrice * multiplier}</span>
          )}
          <span className="text-xl font-bold">₹{displayPrice}</span>
          {gstPercentage > 0 && (
            <span className="text-xs font-medium text-muted-foreground/60 mt-0.5">+ ₹{Number(gstAmount.toFixed(2))} GST</span>
          )}
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
        <div className="flex flex-col">
          <span className="text-4xl font-heading font-bold text-primary">₹{displayPrice}</span>
          {gstPercentage > 0 && (
            <span className="text-sm font-medium text-muted-foreground/60 mt-0.5">+ ₹{Number(gstAmount.toFixed(2))} GST</span>
          )}
        </div>
      </div>
    </div>
  );
}
