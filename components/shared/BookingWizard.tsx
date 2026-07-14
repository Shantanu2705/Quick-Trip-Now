"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ArrowLeft, Lock, User as UserIcon, Car, Users } from "lucide-react";
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
  basePrice,
  childPrice,
  maxChildAge
}: {
  packageData?: any;
  availableVehicles?: any[];
  selectedDate?: Date;
  adultsCount?: number;
  childrenCount?: number;
  basePrice?: number;
  childPrice?: number;
  maxChildAge?: number;
}) {
  const { userData, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "verifying" | "success">("idle");
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  // Initialize dynamic travelers array
  const [travelers, setTravelers] = useState(() => {
    const adults = Array.from({ length: adultsCount || 1 }, () => ({
      type: "adult" as const,
      fullName: "",
      email: "",
      phone: "",
      age: ""
    }));
    const children = Array.from({ length: childrenCount || 0 }, () => ({
      type: "child" as const,
      fullName: "",
      email: "",
      phone: "",
      age: ""
    }));
    return [...adults, ...children];
  });
  const [specialRequests, setSpecialRequests] = useState("");

  const discountPercent = userData?.role === "agent" || userData?.role === "admin" 
    ? (userData.discountPercentage ?? 20) 
    : 0;
  const hasDiscount = discountPercent > 0;
  const discountMultiplier = hasDiscount ? (100 - discountPercent) / 100 : 1;

  const safeBasePrice = basePrice || 0;
  const safeChildPrice = childPrice ?? safeBasePrice;
  const safeAdults = adultsCount || 1;
  const safeChildren = childrenCount || 0;
  const totalBasePrice = (safeBasePrice * safeAdults) + (safeChildPrice * safeChildren);
  const finalPrice = hasDiscount ? totalBasePrice * discountMultiplier : totalBasePrice;

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

  if (!userData) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-background rounded-3xl shadow-2xl border border-border overflow-hidden p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <Lock className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-heading font-bold mb-4">Authentication Required</h2>
        <p className="text-muted-foreground mb-8">You must be logged in as a customer or agent to complete a booking.</p>
        <div className="flex justify-center gap-4">
          <Link href="/auth">
            <Button className="rounded-xl px-8">Sign In / Register</Button>
          </Link>
        </div>
      </div>
    );
  }

  const triggerSuccess = async () => {
    setPaymentStatus("success");
    
    // Save to Firestore
    try {
      await fetch("/api/confirm-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.uid,
          customerName: travelers[0].fullName,
          email: travelers[0].email,
          phone: travelers[0].phone,
          packageId: packageData?.id,
          packageType: packageData?.title,
          date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
          adultsCount: safeAdults,
          childrenCount: safeChildren,
          travelers: travelers,
          specialRequests: specialRequests,
          amount: finalPrice,
          baseAmount: totalBasePrice,
          discountApplied: hasDiscount,
          discountPercentage: discountPercent,
          type: 'tour',
          vehicleName: selectedVehicle?.name,
          vehicleQty: selectedVehicle?.qtyRequired
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
        body: JSON.stringify({ amount: finalPrice }), 
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
                  <p className="text-muted-foreground">Select a vehicle that accommodates your party. (No extra charges for vehicles on this tour package).</p>
                  
                  {filteredVehicles.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-xl border-border">
                      <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-bold text-lg">No Vehicles Available</h3>
                      <p className="text-muted-foreground mt-2">There are currently no vehicles available for your selected date.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredVehicles.map(v => {
                        const capacityPerVehicle = v.seats || 4;
                        const qtyRequired = Math.max(1, Math.ceil((safeAdults + safeChildren) / capacityPerVehicle));
                        
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
                              <Check className="w-4 h-4 text-emerald-500" /> 
                              {v.ac ? "AC" : "Non-AC"}
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
                              <input type="tel" placeholder="9876543210" value={traveler.phone} onChange={(e) => updateTraveler(idx, "phone", e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
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
                    </span>
                  </div>
                  
                  {hasDiscount && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Agent Discount ({discountPercent}%)</span>
                      <span>-₹{Math.round(totalBasePrice * (discountPercent / 100)).toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-foreground font-bold text-lg">Total Amount</span>
                    <span className="text-3xl font-bold font-heading text-primary">₹{finalPrice.toLocaleString("en-IN")}</span>
                  </div>
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
          {paymentStatus === "verifying" ? "Processing..." : (currentStep === STEPS.length - 1 ? `Pay ₹${finalPrice.toLocaleString("en-IN")}` : "Continue")} 
          {paymentStatus === "idle" && currentStep !== STEPS.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
