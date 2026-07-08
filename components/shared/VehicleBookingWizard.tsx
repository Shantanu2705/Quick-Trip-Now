"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = ["Travel Details", "Personal Info", "Payment"];

export function VehicleBookingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "verifying" | "success">("idle");
  const [formData, setFormData] = useState({
    pickup: "",
    dropoff: "",
    datetime: "",
    vehicleType: "Sedan (4 Seater)",
    fullName: "",
    email: "",
    phone: "",
    vehicleNumber: "",
  });

  const triggerSuccess = () => {
    setPaymentStatus("success");
    setTimeout(() => {
      const message = `*New Vehicle Booking Request*\n\n*Vehicle Type:* ${formData.vehicleType}\n*Pick-up:* ${formData.pickup}\n*Drop-off:* ${formData.dropoff}\n*Date & Time:* ${new Date(formData.datetime).toLocaleString()}\n\n*Customer Details*\n*Name:* ${formData.fullName}\n*Email:* ${formData.email}\n*Phone:* ${formData.phone}\n*Vehicle/Flight No:* ${formData.vehicleNumber || 'N/A'}\n\n*Status:* Payment Confirmed via Razorpay`;
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
    setPaymentStatus("verifying");
    const res = await initializeRazorpay();
    if (!res) {
      setPaymentStatus("idle");
      return setError("Razorpay SDK failed to load. Are you online?");
    }

    try {
      const data = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 3500 }), // Base price for Vehicle Booking
      }).then((t) => t.json());

      if (data.error) {
        setPaymentStatus("idle");
        return setError(`Server Error: ${data.error}`);
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "", 
        amount: data.amount,
        currency: data.currency,
        name: "Quick Trip Now",
        description: `Vehicle Booking: ${formData.vehicleType}`,
        order_id: data.id,
        handler: function (response: any) {
          triggerSuccess();
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
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
      if (!formData.pickup) return setError("Pick-up location is required.");
      if (!formData.dropoff) return setError("Drop-off location is required.");
      if (!formData.datetime) return setError("Date & Time is required.");
      if (new Date(formData.datetime) < new Date()) return setError("Date & Time cannot be in the past.");
    }
    if (currentStep === 1) {
      if (formData.fullName.trim().length < 3) return setError("Please enter a valid full name.");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) return setError("Please enter a valid email address.");
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) return setError("Please enter a valid 10-digit phone number.");
      if (formData.vehicleNumber && formData.vehicleNumber.trim().length < 4) return setError("Please enter a valid Vehicle / Flight Number or leave it blank.");
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
    <div className="w-full max-w-4xl mx-auto bg-background rounded-3xl shadow-2xl border border-border overflow-hidden">
      {/* Progress Header */}
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

      {/* Form Content */}
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
            {currentStep === 0 && (
              <div className="space-y-6 flex-1">
                <h3 className="text-2xl font-heading font-bold">Trip Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Pick-up Location</label>
                    <input type="text" placeholder="Hotel / Airport / Station" value={formData.pickup} onChange={(e) => setFormData({...formData, pickup: e.target.value})} className="w-full bg-muted/50 border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Drop-off Location</label>
                    <input type="text" placeholder="Destination" value={formData.dropoff} onChange={(e) => setFormData({...formData, dropoff: e.target.value})} className="w-full bg-muted/50 border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Pick-up Date & Time</label>
                    <input type="datetime-local" value={formData.datetime} onChange={(e) => setFormData({...formData, datetime: e.target.value})} className="w-full bg-muted/50 border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Vehicle Preference</label>
                    <select value={formData.vehicleType} onChange={(e) => setFormData({...formData, vehicleType: e.target.value})} className="w-full bg-muted/50 border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none">
                      <option>Sedan (4 Seater)</option>
                      <option>SUV (6 Seater)</option>
                      <option>Innova Crysta (6/7 Seater)</option>
                      <option>Tempo Traveller (12+ Seater)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 1 && (
              <div className="space-y-6 flex-1">
                <h3 className="text-2xl font-heading font-bold">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <input type="text" placeholder="John Doe" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full bg-muted/50 border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email Address</label>
                    <input type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-muted/50 border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Phone Number</label>
                    <input type="tel" placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-muted/50 border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Flight / Train Number (Optional)</label>
                    <input type="text" placeholder="e.g. 6E-123" value={formData.vehicleNumber} onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})} className="w-full bg-muted/50 border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  </div>
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
                    <span className="text-muted-foreground">Vehicle Type</span>
                    <span className="font-semibold">{formData.vehicleType}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-border/50">
                    <span className="text-muted-foreground">Route</span>
                    <span className="font-semibold text-right max-w-[200px] truncate">{formData.pickup} to {formData.dropoff}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-foreground font-semibold">Estimated Total</span>
                    <span className="text-3xl font-bold font-heading text-primary">₹3,500</span>
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

      {/* Footer Actions */}
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
          {paymentStatus === "verifying" ? "Processing..." : (currentStep === STEPS.length - 1 ? "Pay with Razorpay" : "Continue")} 
          {paymentStatus === "idle" && <ChevronRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
