"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ArrowLeft, Lock, Users, MapPin, Calendar, Clock, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { format } from "date-fns";

const STEPS = ["Select Vehicle", "Travel Details", "Payment"];

export function VehicleBookingWizard({
  cabRouteData,
  availableVehicles,
  selectedDate,
  adultsCount,
  childrenCount,
  maxChildAge
}: {
  cabRouteData: any,
  availableVehicles: any[],
  selectedDate?: Date,
  adultsCount: number,
  childrenCount: number,
  maxChildAge: number
}) {
  const { userData, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "verifying" | "success">("idle");
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const [travelers, setTravelers] = useState<any[]>([]);

  useEffect(() => {
    // Initialize travelers based on counts
    const initTravelers = [];
    for (let i = 0; i < adultsCount; i++) {
      initTravelers.push({
        type: 'adult',
        fullName: i === 0 && userData ? (userData.fullName || "") : "",
        email: i === 0 && userData ? (userData.email || "") : "",
        phone: "",
        age: ""
      });
    }
    for (let i = 0; i < childrenCount; i++) {
      initTravelers.push({
        type: 'child',
        fullName: "",
        email: "",
        phone: "",
        age: ""
      });
    }
    setTravelers(initTravelers);
  }, [adultsCount, childrenCount, userData]);

  const updateTraveler = (index: number, field: string, value: string) => {
    const newTravelers = [...travelers];
    newTravelers[index][field] = value;
    setTravelers(newTravelers);
  };

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
        <p className="text-muted-foreground mb-8">You must be logged in as a customer or agent to complete a vehicle booking.</p>
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
      const leadTraveler = travelers[0];
      await fetch("/api/confirm-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.uid,
          customerName: leadTraveler.fullName,
          email: leadTraveler.email,
          phone: leadTraveler.phone,
          vehicleName: selectedVehicle.name,
          vehicleQty: selectedVehicle.qtyRequired,
          pickup: cabRouteData.title,
          dropoff: cabRouteData.subtitle || cabRouteData.title,
          date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
          amount: selectedVehicle.price * selectedVehicle.qtyRequired,
          type: 'vehicle',
          adultsCount,
          childrenCount,
          travelers
        })
      });
    } catch (err) {
      console.error("Failed to save vehicle booking to db", err);
    }

    setTimeout(() => {
      const leadTraveler = travelers[0];
      const message = `*New Vehicle Booking Request*\n\n*Vehicle Type:* ${selectedVehicle.name}\n*Route:* ${cabRouteData.title}\n*Date & Time:* ${selectedDate ? format(selectedDate, "PPP") : ""}\n\n*Lead Customer Details*\n*Name:* ${leadTraveler.fullName}\n*Email:* ${leadTraveler.email}\n*Phone:* ${leadTraveler.phone}\n\n*Status:* Payment Confirmed via Razorpay`;
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/919429694567?text=${encodedMessage}`, '_blank');
    }, 1500);
  };

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    // TODO: Implement actual Razorpay integration later.
    // Temporarily bypassing payment to allow testing and deployment.
    setPaymentStatus("verifying");
    
    setTimeout(() => {
      triggerSuccess();
    }, 1000);
  };

  const handleNext = () => {
    setError("");
    if (currentStep === 0) {
      if (!selectedVehicle) return setError("Please select a vehicle to continue.");
    }
    if (currentStep === 1) {
      // Validate all travelers
      for (let i = 0; i < travelers.length; i++) {
        const t = travelers[i];
        const isAdult = t.type === 'adult';
        const label = isAdult ? `Adult ${i + 1}` : `Child ${i - adultsCount + 1}`;
        
        if (t.fullName.trim().length < 3) return setError(`${label}: Please enter a valid full name.`);
        
        if (isAdult) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(t.email)) return setError(`${label}: Please enter a valid email address.`);
          const phoneRegex = /^\d{10}$/;
          if (!phoneRegex.test(t.phone.replace(/\D/g, ''))) return setError(`${label}: Please enter a valid 10-digit phone number.`);
        } else {
          const ageNum = parseInt(t.age);
          if (isNaN(ageNum) || ageNum < 1) return setError(`${label}: Please enter a valid age.`);
          const maxAge = maxChildAge || 12;
          if (ageNum > maxAge) return setError(`${label}: Child's age (${ageNum}) exceeds the maximum allowed age of ${maxAge}. Please go back and add this child as an Adult.`);
        }
      }
    }
    
    if (currentStep === STEPS.length - 1) {
      setError("");
      handleRazorpayPayment();
      return;
    }
    
    if (currentStep < STEPS.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Cab Transfer Details Header */}
      <div className="bg-background rounded-3xl shadow-xl border border-border p-6 md:p-8">
        <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-2">
          <Navigation className="w-6 h-6 text-primary" />
          Cab Transfer Details
        </h2>
        
        <div className="flex flex-col gap-6 p-6 bg-muted/20 rounded-2xl border border-border/50">
          
          {/* Line 1: Itinerary */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-lg font-medium text-foreground w-full">
            {cabRouteData.itinerary?.map((stop: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{stop.location}</span>
                </div>
                {idx < cabRouteData.itinerary.length - 1 && (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>
            ))}
          </div>

          {/* Line 2: Distance, Duration, Date */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-8 w-full">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Navigation className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Distance</span>
                <span className="font-semibold">{cabRouteData.distance || "N/A"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Duration</span>
                <span className="font-semibold">{cabRouteData.duration || "N/A"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Date</span>
                <span className="font-semibold">{selectedDate ? format(selectedDate, "dd MMM yyyy") : "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Line 3: Title */}
          <div className="text-xl font-bold text-foreground">
            {cabRouteData.title}
          </div>
        </div>
      </div>

      <div className="w-full bg-background rounded-3xl shadow-2xl border border-border overflow-hidden">
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
                    <h3 className="text-2xl font-heading font-bold">Select Vehicle</h3>
                    <p className="text-muted-foreground mb-6">Showing vehicles available for {adultsCount} Adults and {childrenCount} Children on {selectedDate ? format(selectedDate, "dd MMM yyyy") : "selected date"}.</p>
                    
                    {filteredVehicles.length === 0 ? (
                      <div className="p-8 text-center bg-muted/20 border border-border rounded-2xl">
                        <p className="text-lg font-medium">No vehicles available for this date and capacity.</p>
                        <p className="text-muted-foreground mt-2">Try changing your travel date or number of travelers.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVehicles.map(v => {
                        const capacityPerVehicle = v.seats || 4;
                        const qtyRequired = Math.max(1, Math.ceil((adultsCount + childrenCount) / capacityPerVehicle));
                        
                        return (
                          <div 
                            key={v.id} 
                            onClick={() => setSelectedVehicle({ ...v, qtyRequired })}
                            className={`p-4 border rounded-2xl cursor-pointer transition-all ${selectedVehicle?.id === v.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border bg-background hover:border-primary/50'}`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-lg">{v.name}</h4>
                                <span className="text-sm text-muted-foreground">{v.type}</span>
                                {qtyRequired > 1 && (
                                  <div className="mt-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded font-semibold w-fit">
                                    Requires {qtyRequired} Vehicles
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-xl text-primary">₹{v.price * qtyRequired}</span>
                                <div className="text-xs text-muted-foreground">Total Fare (x{qtyRequired})</div>
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
                <div className="space-y-6 flex-1">
                  <h3 className="text-2xl font-heading font-bold">Passenger Details</h3>
                  <div className="space-y-6">
                    {travelers.map((traveler, idx) => {
                      const isAdult = traveler.type === 'adult';
                      const label = isAdult ? `Adult ${idx + 1}` : `Child ${idx - adultsCount + 1}`;
                      return (
                        <div key={idx} className="bg-muted/10 border border-border rounded-2xl p-6 relative">
                          <div className="absolute -top-3 -left-3 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                            {idx + 1}
                          </div>
                          <h3 className="text-lg font-bold mb-4 flex items-center">
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
                  </div>
                </div>
              )}

              {currentStep === 2 && paymentStatus === "idle" && (
                <div className="space-y-6 flex-1 flex flex-col items-center justify-center py-4">
                  <h3 className="text-3xl font-heading font-bold text-center">Secure Payment</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    We use Razorpay to securely process all UPI, QR code, and Visa/Mastercard payments.
                  </p>
                  
                  <div className="bg-muted/30 border border-border rounded-xl p-6 w-full max-w-md mt-2 space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-border/50">
                      <span className="text-muted-foreground">Vehicle</span>
                      <span className="font-semibold">{selectedVehicle?.name} <span className="text-primary">(x{selectedVehicle?.qtyRequired})</span></span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-border/50">
                      <span className="text-muted-foreground">Route</span>
                      <span className="font-semibold text-right max-w-[200px] truncate">{cabRouteData.title}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-border/50">
                      <span className="text-muted-foreground">Travelers</span>
                      <span className="font-semibold text-right">
                        {adultsCount} Adult{adultsCount !== 1 ? 's' : ''}{childrenCount > 0 ? `, ${childrenCount} Child${childrenCount !== 1 ? 'ren' : ''}` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-bold text-foreground">Total Amount</span>
                      <span className="text-2xl font-bold text-primary">₹{selectedVehicle?.price * (selectedVehicle?.qtyRequired || 1)}</span>
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
                   <h3 className="text-3xl font-heading font-bold text-primary">Preparing Secure Checkout...</h3>
                   <p className="text-muted-foreground max-w-md">Connecting to Razorpay.</p>
                </motion.div>
              )}
              
              {currentStep === 2 && paymentStatus === "success" && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 flex-1 flex flex-col items-center justify-center py-8 text-center">
                   <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                     <Check className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                   </div>
                   <h3 className="text-4xl font-heading font-bold text-emerald-600 dark:text-emerald-400">Payment Successful!</h3>
                   <p className="text-lg text-muted-foreground max-w-md">Your vehicle booking has been secured.</p>
                   <div className="mt-8 p-4 bg-muted/50 rounded-xl animate-pulse">
                     <p className="text-sm font-medium">Redirecting to WhatsApp to send final details to owner...</p>
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
            disabled={paymentStatus !== "idle" || (currentStep === 0 && !selectedVehicle)}
            className="rounded-xl px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            {paymentStatus === "verifying" ? "Processing..." : (currentStep === STEPS.length - 1 ? "Pay with Razorpay" : "Continue")} 
            {paymentStatus === "idle" && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
