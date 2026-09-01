"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ArrowLeft, Lock, User as UserIcon, Car, Users, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";

const STEPS = ["Vehicle Selection", "Personal Info", "Secure Payment"];

export function BookingWizard({
  packageData,
  availableVehicles = [],
  selectedDate,
  adultsCount,
  childrenCount,
  infantsCount,
  maxChildAge,
  selectedVehicleId,
  vehiclesRequired,
}: {
  packageData?: any;
  availableVehicles?: any[];
  selectedDate?: Date;
  adultsCount?: number;
  childrenCount?: number;
  infantsCount?: number;
  maxChildAge?: number;
  selectedVehicleId?: string;
  vehiclesRequired?: number;
}) {
  const { userData, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(() => selectedVehicleId ? 1 : 0);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "verifying" | "success">("idle");
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [paymentSelection, setPaymentSelection] = useState<"full" | "part">("full");

  // Initialize single leader traveler
  const [travelers, setTravelers] = useState(() => {
    return [{
      type: "adult" as const,
      fullName: "",
      email: "",
      phone: "",
      age: ""
    }];
  });
  const [specialRequests, setSpecialRequests] = useState("");

  const discountPercent = userData?.role === "agent" || userData?.role === "admin" 
    ? (userData.discountPercentage ?? 20) 
    : 0;
  const hasDiscount = discountPercent > 0;
  const discountMultiplier = hasDiscount ? (100 - discountPercent) / 100 : 1;

  useEffect(() => {
    const savedState = sessionStorage.getItem("booking_wizard_state");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.travelers) setTravelers(parsed.travelers);
        if (parsed.specialRequests) setSpecialRequests(parsed.specialRequests);
        if (parsed.selectedVehicle) setSelectedVehicle(parsed.selectedVehicle);
        setCurrentStep(2);
        sessionStorage.removeItem("booking_wizard_state");
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (selectedVehicleId && availableVehicles && availableVehicles.length > 0 && !selectedVehicle) {
      const v = availableVehicles.find(v => v.id === selectedVehicleId);
      if (v) {
        setSelectedVehicle({ ...v, qtyRequired: vehiclesRequired || 1 });
      }
    }
  }, [selectedVehicleId, availableVehicles, vehiclesRequired, selectedVehicle]);

  const safeAdults = adultsCount || 1;
  const safeChildren = childrenCount || 0;
  const safeInfants = infantsCount || 0;
  const totalBasePrice = selectedVehicle ? ((selectedVehicle.price || selectedVehicle.pricePerDay || 0) * (selectedVehicle.qtyRequired || 1)) : 0;
  const discountedBasePrice = hasDiscount ? totalBasePrice * discountMultiplier : totalBasePrice;
  
  const couponDiscountAmount = appliedCoupon ? (discountedBasePrice * appliedCoupon.discount) / 100 : 0;
  const priceAfterCoupon = discountedBasePrice - couponDiscountAmount;
  
  const gstPercent = packageData?.gstPercentage || 0;
  const gstAmount = (priceAfterCoupon * gstPercent) / 100;
  const finalPrice = Math.round(priceAfterCoupon + gstAmount);
  
  const amountToPay = paymentSelection === "part" && packageData?.partPaymentEnabled
    ? Math.round((finalPrice * (packageData.partPaymentPercentage || 50)) / 100)
    : finalPrice;

  const applyCoupon = async () => {
    if (!couponCode || !userData) return;
    setValidatingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, userId: userData.uid })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon({ code: couponCode.toUpperCase(), discount: data.discountPercentage });
      } else {
        setCouponError(data.message);
        setAppliedCoupon(null);
      }
    } catch (e) {
      setCouponError("Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  useEffect(() => {
    if (userData && travelers.length > 0 && !travelers[0].fullName) {
      setTravelers(prev => {
        const newTravelers = [...prev];
        newTravelers[0] = {
          ...newTravelers[0],
          fullName: userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || ""
        };
        return newTravelers;
      });
    }
  }, [userData]);

  if (authLoading) {
    return <div className="py-24 text-center">Loading...</div>;
  }



  const triggerSuccess = async () => {
    setPaymentStatus("success");
    
    // Save to Firestore
    try {
      await fetch("/api/confirm-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData?.uid || "guest",
          customerName: travelers[0].fullName,
          email: travelers[0].email,
          phone: travelers[0].phone,
          packageId: packageData?.id,
          packageType: packageData?.title,
          date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
          adultsCount: safeAdults,
          childrenCount: safeChildren,
          infantsCount: safeInfants,
          travelers: travelers,
          specialRequests: specialRequests,
          amount: finalPrice,
          paidAmount: amountToPay,
          pendingAmount: finalPrice - amountToPay,
          paymentType: paymentSelection,
          baseAmount: totalBasePrice,
          gstPercentage: gstPercent,
          gstAmount: Math.round(gstAmount),
          discountApplied: hasDiscount,
          discountPercentage: discountPercent,
          type: 'tour',
          vehicleName: selectedVehicle?.name,
          vehicleQty: selectedVehicle?.qtyRequired,
          couponCode: appliedCoupon?.code,
          terms: packageData?.terms || "",
          inclusions: packageData?.inclusions || []
        })
      });
    } catch (err) {
      console.error("Failed to save booking to db", err);
    }
  };

  const handlePayment = async () => {
    setError("");
    setPaymentStatus("verifying");
    
    // Check if Razorpay is configured
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      // Simulate Razorpay success delay
      setTimeout(() => {
        triggerSuccess();
      }, 2000);
      return;
    }

    // Razorpay Integration (if key exists)
    try {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);

      await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for script to load

      const data = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: amountToPay, 
          couponCode: appliedCoupon?.code, 
          userId: userData?.uid,
          bookingDetails: {
            paymentType: paymentSelection,
            totalAmount: finalPrice,
            paidAmount: amountToPay,
            pendingAmount: finalPrice - amountToPay
          }
        }), 
      }).then((t) => t.json());

      if (data.error) {
        setPaymentStatus("idle");
        return setError(`Server Error: ${data.error}`);
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: data.amount,
        currency: data.currency,
        name: "Quick Trip Now",
        description: `Booking for ${packageData?.title}`,
        order_id: data.id,
        handler: function () {
          triggerSuccess();
        },
        prefill: {
          name: travelers[0].fullName,
          email: travelers[0].email,
          contact: travelers[0].phone,
        },
        theme: {
          color: "#29B4C4",
        },
        modal: {
          ondismiss: function() {
            setPaymentStatus("idle");
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err) {
      setPaymentStatus("idle");
      setError("Failed to initialize payment gateway.");
    }
  };

  const handleNext = () => {
    setError("");
    
    if (currentStep === 0) {
      if (!selectedVehicle) {
        return setError("Please select a vehicle to proceed.");
      }
    }
    
    if (currentStep === 1) {
      // Validate all travelers
      for (let i = 0; i < travelers.length; i++) {
        const t = travelers[i];
        const label = t.type === 'adult' ? `Adult ${i + 1}` : `Child ${i - (adultsCount || 1) + 1}`;
        if (t.fullName.trim().length < 3) return setError(`${label}: Please enter a valid full name.`);
        
        if (t.type === 'adult') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(t.email)) return setError(`${label}: Please enter a valid email address.`);
          const phoneRegex = /^\d{10}$/;
          if (!phoneRegex.test(t.phone.replace(/\D/g, ''))) return setError(`${label}: Please enter a valid 10-digit phone number.`);
        } else {
          const ageNum = Number(t.age);
          const maxAge = maxChildAge || 12;
          if (!t.age || isNaN(ageNum) || ageNum < 1) {
            return setError(`${label}: Please enter a valid age.`);
          }
          if (ageNum > maxAge) {
            return setError(`${label}: Age exceeds max child age of ${maxAge}. Please book them as an adult.`);
          }
        }
      }
    }
    
    if (currentStep === STEPS.length - 1) {
      if (!userData) {
        sessionStorage.setItem("booking_wizard_state", JSON.stringify({
          travelers,
          specialRequests,
          selectedVehicle
        }));
        localStorage.setItem("redirect_after_login", window.location.href);
        window.location.href = "/auth";
        return;
      }
      handlePayment();
      return;
    }
    
    if (currentStep < STEPS.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const updateTraveler = (index: number, field: string, value: string) => {
    const newTravelers = [...travelers];
    newTravelers[index] = { ...newTravelers[index], [field]: value };
    setTravelers(newTravelers);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-background rounded-3xl shadow-2xl border border-border overflow-hidden">
      <div className="bg-muted/30 p-6 md:p-8 border-b border-border">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border rounded-full z-0" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500" 
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} 
          />
          
          {STEPS.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors duration-500 ${
                  idx < currentStep ? "bg-primary text-primary-foreground" : 
                  idx === currentStep ? "bg-background border-2 border-primary text-primary" : 
                  "bg-background border-2 border-border text-muted-foreground"
                }`}
              >
                {idx < currentStep ? <Check className="w-5 h-5" /> : idx + 1}
              </div>
              <span className={`text-xs md:text-sm font-medium ${idx <= currentStep ? "text-foreground" : "text-muted-foreground"}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 md:p-10 min-h-[400px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col"
          >
            {currentStep === 0 && (() => {
              const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
              const filteredVehicles = availableVehicles.filter(v => 
                !v.unavailableDates || !v.unavailableDates.includes(formattedDate)
              );

              return (
                <div className="space-y-6 flex-1">
                  <h3 className="text-2xl font-heading font-bold">Select Vehicle for Your Tour</h3>
                  <p className="text-muted-foreground">Select a vehicle that accommodates your party. The vehicle you choose determines the price of your package.</p>
                  
                  {filteredVehicles.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-xl border-border">
                      <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-bold text-lg">No Vehicles Available</h3>
                      <p className="text-muted-foreground mt-2">There are currently no vehicles available for your selected date.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredVehicles.map(v => {
                        const calculateCars = () => {
                          let cars = 0;
                          let a = safeAdults;
                          let c = safeChildren;
                          let i = safeInfants;
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
                        
                        return (
                        <div 
                          key={v.id} 
                          onClick={() => setSelectedVehicle({ ...v, qtyRequired })}
                          className={`p-4 border rounded-2xl cursor-pointer transition-all ${selectedVehicle?.id === v.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border bg-background hover:border-primary/50'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                              {v.image ? (
                                <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 relative">
                                  <Image src={v.image} alt={v.name} fill className="object-cover" />
                                </div>
                              ) : (
                                <div className="w-16 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                  <Car className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <h4 className="font-bold text-lg">{v.name}</h4>
                                <span className="text-sm text-muted-foreground">{v.type}</span>
                                {qtyRequired > 1 && (
                                  <div className="mt-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded font-semibold w-fit">
                                    Requires {qtyRequired} Vehicles
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" /> 
                              {v.seats} Seats/veh
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">₹{v.price || v.pricePerDay}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  )}
                </div>
              );
            })()}

            {currentStep === 1 && (
              <div className="space-y-8 flex-1">
                {travelers.map((traveler, idx) => {
                  const isAdult = traveler.type === 'adult';
                  const label = isAdult ? `Adult ${idx + 1}` : `Child ${idx - (adultsCount || 1) + 1}`;
                  return (
                    <div key={idx} className="bg-muted/10 border border-border rounded-2xl p-6 relative">
                      <div className="absolute -top-3 -left-3 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                        {idx + 1}
                      </div>
                      <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-primary" />
                        {label} {idx === 0 && <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded-md ml-2">Lead Traveler</span>}
                      </h3>
                      <div className={`grid grid-cols-1 ${isAdult ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Full Name</label>
                          <input type="text" placeholder="John Doe" value={traveler.fullName} onChange={(e) => updateTraveler(idx, "fullName", e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                        </div>
                        {isAdult ? (
                          <>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">Email Address</label>
                              <input type="email" placeholder="john@example.com" value={traveler.email} onChange={(e) => updateTraveler(idx, "email", e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">Phone Number</label>
                              <input type="tel" placeholder="7047399677" value={traveler.phone} onChange={(e) => updateTraveler(idx, "phone", e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                            </div>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Age (Max {maxChildAge || 12})</label>
                            <input type="number" min="1" max="17" placeholder="e.g. 8" value={traveler.age} onChange={(e) => updateTraveler(idx, "age", e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                <div className="bg-muted/10 border border-border rounded-2xl p-6">
                  <h3 className="text-xl font-heading font-bold mb-4">Additional Details</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Special Requests (Optional)</label>
                    <textarea 
                      placeholder="Any dietary requirements, accessibility needs, or special occasions?" 
                      value={specialRequests} 
                      onChange={(e) => setSpecialRequests(e.target.value)} 
                      className="w-full bg-background border border-input rounded-xl px-4 py-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" 
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && paymentStatus === "idle" && (
              <div className="space-y-6 flex-1 flex flex-col items-center justify-center py-4">
                <h3 className="text-3xl font-heading font-bold text-center">Secure Payment</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Review your booking details. We use secure processing for all payments.
                </p>
                
                <div className="bg-muted/30 border border-border rounded-xl p-6 w-full max-w-md mt-2 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-border/50">
                    <span className="text-muted-foreground">Booking</span>
                    <span className="font-semibold text-right">{packageData?.title}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-border/50">
                    <span className="text-muted-foreground">Vehicle</span>
                    <span className="font-semibold text-right">{selectedVehicle?.name} <span className="text-primary">(x{selectedVehicle?.qtyRequired})</span></span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-border/50">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-semibold">{selectedDate ? format(selectedDate, "PPP") : "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-border/50">
                    <span className="text-muted-foreground">Travelers</span>
                    <span className="font-semibold text-right">
                      {safeAdults} Adult{safeAdults > 1 ? 's' : ''}
                      {safeChildren > 0 && `, ${safeChildren} Child${safeChildren > 1 ? 'ren' : ''}`}
                      {safeInfants > 0 && `, ${safeInfants} Infant${safeInfants > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  
                  {hasDiscount && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 pb-4 border-b border-border/50">
                      <span>Agent Discount ({discountPercent}%)</span>
                      <span>-₹{Math.round(totalBasePrice * (discountPercent / 100)).toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pb-4 border-b border-border/50">
                    <span className="text-muted-foreground">Base Price</span>
                    <span className="font-semibold text-right">₹{Math.round(discountedBasePrice).toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between items-center pb-4 border-b border-border/50">
                    <span className="text-muted-foreground">GST ({gstPercent}%)</span>
                    <span className="font-semibold text-right">₹{Math.round(gstAmount).toLocaleString("en-IN")}</span>
                  </div>

                  {userData && (
                    <div className="py-4 border-b border-border/50">
                      {!appliedCoupon ? (
                        <div className="space-y-2">
                          <span className="text-sm font-semibold text-muted-foreground block">Have a coupon code?</span>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder="Enter code"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm uppercase outline-none focus:border-primary"
                            />
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={applyCoupon}
                              disabled={validatingCoupon || !couponCode}
                            >
                              {validatingCoupon ? "Checking..." : "Apply"}
                            </Button>
                          </div>
                          {couponError && <p className="text-xs text-destructive mt-1">{couponError}</p>}
                        </div>
                      ) : (
                        <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                              <Ticket className="w-4 h-4" /> Coupon Applied
                            </span>
                            <span className="text-xs text-emerald-600/80 font-mono">{appliedCoupon.code}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">-{appliedCoupon.discount}%</span>
                            <button 
                              onClick={() => {
                                setAppliedCoupon(null);
                                setCouponCode("");
                              }}
                              className="text-xs text-muted-foreground hover:text-destructive underline mt-1"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-foreground font-bold text-lg">Total Amount</span>
                    <span className="text-3xl font-bold font-heading text-primary">₹{finalPrice.toLocaleString("en-IN")}</span>
                  </div>

                  {packageData?.partPaymentEnabled && (
                    <div className="pt-4 border-t border-border/50">
                      <span className="text-sm font-semibold text-muted-foreground block mb-2">Payment Option</span>
                      <div className="flex flex-col gap-2">
                        <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${paymentSelection === "full" ? "bg-primary/5 border-primary text-primary" : "bg-background border-border"}`}>
                          <input type="radio" name="paymentOption" checked={paymentSelection === "full"} onChange={() => setPaymentSelection("full")} className="w-4 h-4 text-primary" />
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">Pay Full Amount</span>
                            <span className="text-xs text-muted-foreground">₹{finalPrice.toLocaleString("en-IN")}</span>
                          </div>
                        </label>
                        <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${paymentSelection === "part" ? "bg-primary/5 border-primary text-primary" : "bg-background border-border"}`}>
                          <input type="radio" name="paymentOption" checked={paymentSelection === "part"} onChange={() => setPaymentSelection("part")} className="w-4 h-4 text-primary" />
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">Pay Part Amount ({packageData.partPaymentPercentage}%)</span>
                            <span className="text-xs text-muted-foreground">₹{Math.round((finalPrice * (packageData.partPaymentPercentage || 50)) / 100).toLocaleString("en-IN")}</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 items-center justify-center opacity-70">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">100% Secure Checkout</span>
                </div>
              </div>
            )}

            {currentStep === 2 && paymentStatus === "verifying" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 flex-1 flex flex-col items-center justify-center py-8 text-center">
                 <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                 <h3 className="text-3xl font-heading font-bold text-primary">Processing Payment...</h3>
                 <p className="text-muted-foreground max-w-md">Please do not close this window.</p>
              </motion.div>
            )}
            
            {currentStep === 2 && paymentStatus === "success" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 flex-1 flex flex-col items-center justify-center py-8 text-center">
                 <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                   <Check className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                 </div>
                 <h3 className="text-4xl font-heading font-bold text-emerald-600 dark:text-emerald-400">Booking Confirmed!</h3>
                 <p className="text-lg text-muted-foreground max-w-md">Your payment was successful and your trip is secured.</p>
                 <div className="mt-8 flex gap-4">
                   <Link href="/user">
                     <Button variant="outline" className="rounded-xl px-6">View My Bookings</Button>
                   </Link>
                 </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="bg-muted/10 p-6 md:p-8 border-t border-border flex items-center justify-between relative">
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[120%] bg-destructive/10 text-destructive px-4 py-2 rounded-xl text-sm font-medium border border-destructive/20 shadow-sm">
            {error}
          </motion.div>
        )}
        <Button 
          variant="outline" 
          onClick={handleBack} 
          disabled={currentStep === 0 || paymentStatus !== "idle"}
          className="rounded-xl px-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={paymentStatus !== "idle"}
          className="rounded-xl px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
        >
          {paymentStatus === "verifying" ? "Processing..." : (currentStep === STEPS.length - 1 ? (!userData ? "Login to Pay" : `Pay ₹${amountToPay.toLocaleString("en-IN")}`) : "Continue")} 
          {paymentStatus === "idle" && currentStep !== STEPS.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
