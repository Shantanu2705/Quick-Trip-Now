"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ArrowLeft, Lock, User as UserIcon, Users, Ticket, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";
import { BookingInvoice } from "@/components/admin/BookingInvoice";

const STEPS = ["Lead Traveler Details", "Secure Payment"];

export function BookingWizard({
  packageData,
  selectedDate,
  adultsCount = 2,
  childrenCount = 0,
  infantsCount = 0,
  maxChildAge = 12,
}: {
  packageData?: any;
  selectedDate?: Date;
  adultsCount?: number;
  childrenCount?: number;
  infantsCount?: number;
  maxChildAge?: number;
}) {
  const { user, userData, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "verifying" | "success">("idle");
  
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [paymentSelection, setPaymentSelection] = useState<"full" | "part">("full");
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  
  const printRef = useRef<HTMLDivElement>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const safeAdults = Math.max(1, adultsCount || 1);
  const safeChildren = Math.max(0, childrenCount || 0);
  const safeInfants = Math.max(0, infantsCount || 0);

  // Only Lead Traveler details and optional special requests are required
  const [leadTraveler, setLeadTraveler] = useState({
    fullName: "",
    email: "",
    phone: ""
  });
  const [specialRequests, setSpecialRequests] = useState("");

  const handleDownloadPdf = async () => {
    if (!confirmedBooking) return;
    
    setTimeout(async () => {
      const { downloadPdf } = await import("@/lib/downloadPdf");
      await downloadPdf(printRef, `Invoice_${confirmedBooking.id}.pdf`, setGeneratingPdf);
    }, 500);
  };

  // Pricing calculations
  const defaultAdultPrice = Number(packageData?.price) || 0;
  const defaultChildPrice = (packageData?.childPrice !== undefined && Number(packageData.childPrice) > 0)
    ? Number(packageData.childPrice)
    : defaultAdultPrice;

  // Active seasonal price if date matches
  const activeSeason = useMemo(() => {
    if (!selectedDate || !packageData?.seasonalPrices || !Array.isArray(packageData.seasonalPrices)) return null;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return packageData.seasonalPrices.find((sp: any) => 
      sp.startDate && sp.endDate && dateStr >= sp.startDate && dateStr <= sp.endDate
    ) || null;
  }, [selectedDate, packageData?.seasonalPrices]);

  const applicableAdultPrice = activeSeason ? (Number(activeSeason.price) || defaultAdultPrice) : defaultAdultPrice;
  const applicableChildPrice = activeSeason
    ? (activeSeason.childPrice !== undefined && Number(activeSeason.childPrice) > 0 
        ? Number(activeSeason.childPrice) 
        : (Number(activeSeason.price) || defaultChildPrice))
    : defaultChildPrice;

  const totalBasePrice = (safeAdults * applicableAdultPrice) + (safeChildren * applicableChildPrice);

  const discountPercent = userData?.role === "agent" || userData?.role === "admin" 
    ? (userData.discountPercentage ?? 20) 
    : 0;
  const hasDiscount = discountPercent > 0;
  const discountMultiplier = hasDiscount ? (100 - discountPercent) / 100 : 1;
  const discountedBasePrice = hasDiscount ? totalBasePrice * discountMultiplier : totalBasePrice;
  
  const couponDiscountAmount = appliedCoupon ? (discountedBasePrice * appliedCoupon.discount) / 100 : 0;
  const priceAfterCoupon = discountedBasePrice - couponDiscountAmount;
  
  const gstPercent = packageData?.gstPercentage || 0;
  const gstAmount = (priceAfterCoupon * gstPercent) / 100;
  const finalPrice = priceAfterCoupon + gstAmount;
  
  const packagePartPayment = packageData?.partPayment || { enabled: false, percentage: 50 };
  const amountToPay = paymentSelection === "part" && packagePartPayment.enabled
    ? (finalPrice * (packagePartPayment.percentage || 50)) / 100
    : finalPrice;

  // Pre-fill lead traveler from userData
  useEffect(() => {
    if (userData && !leadTraveler.fullName) {
      setLeadTraveler({
        fullName: userData.fullName || "",
        email: userData.email || "",
        phone: userData.phone || ""
      });
    }
  }, [userData]);

  // Restore state if returning from auth login
  useEffect(() => {
    const savedState = sessionStorage.getItem("booking_wizard_state");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.leadTraveler) setLeadTraveler(parsed.leadTraveler);
        if (parsed.specialRequests) setSpecialRequests(parsed.specialRequests);
        setCurrentStep(1);
        sessionStorage.removeItem("booking_wizard_state");
      } catch (e) {}
    }
  }, []);

  if (authLoading) {
    return <div className="py-24 text-center">Loading...</div>;
  }

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

  const triggerSuccess = async () => {
    setPaymentStatus("success");
    
    const bookingData = {
      userId: user?.uid || "guest",
      customerName: leadTraveler.fullName,
      email: leadTraveler.email,
      phone: leadTraveler.phone,
      packageId: packageData?.id,
      packageType: packageData?.title,
      packageName: packageData?.title,
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
      adultsCount: safeAdults,
      childrenCount: safeChildren,
      infantsCount: safeInfants,
      travelers: [
        {
          type: "adult",
          fullName: leadTraveler.fullName,
          email: leadTraveler.email,
          phone: leadTraveler.phone
        }
      ],
      specialRequests: specialRequests,
      amount: finalPrice,
      paidAmount: amountToPay,
      pendingAmount: finalPrice - amountToPay,
      paymentType: paymentSelection,
      baseAmount: totalBasePrice,
      gstPercentage: gstPercent,
      gstAmount: Number(gstAmount.toFixed(2)),
      discountApplied: hasDiscount,
      discountPercentage: discountPercent,
      type: 'tour',
      couponCode: appliedCoupon?.code,
      terms: packageData?.termsAndConditions || packageData?.terms || "",
      inclusions: packageData?.inclusions || [],
      description: packageData?.description,
      itinerary: packageData?.itinerary
    };

    // Save to Firestore
    try {
      const res = await fetch("/api/confirm-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });
      const dbData = await res.json();
      if (dbData.success) {
        setConfirmedBooking({ ...bookingData, id: dbData.bookingId, status: "confirmed" });
      }
    } catch (err) {
      console.error("Failed to save booking to db", err);
    }
  };

  const handlePayment = async () => {
    setError("");
    setPaymentStatus("verifying");
    
    // Check if Razorpay is configured
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      setTimeout(() => {
        triggerSuccess();
      }, 2000);
      return;
    }

    try {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const token = user ? await user.getIdToken() : "";

      const data = await fetch("/api/create-order", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
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

      if (!data.success) {
        setPaymentStatus("idle");
        return setError(`Server Error: ${data.message || data.error || "Failed to create order"}`);
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: data.data.amount,
        currency: data.data.currency,
        name: "Quick Trip Now",
        description: `Booking for ${packageData?.title}`,
        order_id: data.data.id,
        handler: function () {
          triggerSuccess();
        },
        prefill: {
          name: leadTraveler.fullName,
          email: leadTraveler.email,
          contact: leadTraveler.phone,
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
      // Validate only Lead Traveler
      if (!leadTraveler.fullName || leadTraveler.fullName.trim().length < 3) {
        return setError("Please enter a valid full name for the lead traveler.");
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(leadTraveler.email)) {
        return setError("Please enter a valid email address.");
      }
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(leadTraveler.phone.replace(/\D/g, ''))) {
        return setError("Please enter a valid 10-digit mobile number.");
      }

      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    if (currentStep === 1) {
      if (!userData) {
        sessionStorage.setItem("booking_wizard_state", JSON.stringify({
          leadTraveler,
          specialRequests
        }));
        localStorage.setItem("redirect_after_login", window.location.href);
        window.location.href = "/auth";
        return;
      }
      handlePayment();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-background rounded-3xl shadow-2xl border border-border overflow-hidden">
      
      {/* Wizard Step Indicator */}
      <div className="bg-muted/30 p-6 md:p-8 border-b border-border">
        <div className="flex items-center justify-between relative max-w-md mx-auto">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border rounded-full z-0" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500" 
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} 
          />
          
          {STEPS.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 ${
                  idx < currentStep ? "bg-primary text-primary-foreground shadow-sm" : 
                  idx === currentStep ? "bg-background border-2 border-primary text-primary shadow-md" : 
                  "bg-background border-2 border-border text-muted-foreground"
                }`}
              >
                {idx < currentStep ? <Check className="w-5 h-5" /> : idx + 1}
              </div>
              <span className={`text-xs md:text-sm font-semibold ${idx <= currentStep ? "text-foreground" : "text-muted-foreground"}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Body */}
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
            {/* STEP 0: Lead Traveler Details Only */}
            {currentStep === 0 && (
              <div className="space-y-8 flex-1">
                <div>
                  <h3 className="text-2xl font-heading font-bold text-foreground">
                    Lead Traveler Information
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Please provide the lead traveler contact details for your booking of <strong className="text-foreground">{packageData?.title}</strong>.
                  </p>
                </div>

                <div className="bg-muted/10 border border-border rounded-2xl p-6 relative">
                  <div className="flex items-center gap-2 mb-6">
                    <UserIcon className="w-5 h-5 text-primary" />
                    <h4 className="text-lg font-heading font-bold text-foreground">Lead Traveler</h4>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-md ml-2">Primary Contact</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Full Name <span className="text-destructive">*</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. John Doe" 
                        value={leadTraveler.fullName} 
                        onChange={(e) => setLeadTraveler(prev => ({ ...prev, fullName: e.target.value }))} 
                        className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Email Address <span className="text-destructive">*</span>
                      </label>
                      <input 
                        type="email" 
                        placeholder="name@example.com" 
                        value={leadTraveler.email} 
                        onChange={(e) => setLeadTraveler(prev => ({ ...prev, email: e.target.value }))} 
                        className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Phone Number <span className="text-destructive">*</span>
                      </label>
                      <input 
                        type="tel" 
                        placeholder="10-digit mobile number" 
                        value={leadTraveler.phone} 
                        onChange={(e) => setLeadTraveler(prev => ({ ...prev, phone: e.target.value }))} 
                        className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                      />
                    </div>
                  </div>
                </div>
                
                {/* Special Requests (Optional) */}
                <div className="bg-muted/10 border border-border rounded-2xl p-6 space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Special Requests or Instructions (Optional)
                  </label>
                  <textarea 
                    placeholder="Dietary requirements, pickup instructions, or special assistance..." 
                    value={specialRequests} 
                    onChange={(e) => setSpecialRequests(e.target.value)} 
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 min-h-[100px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" 
                  />
                </div>
              </div>
            )}

            {/* STEP 1: Secure Payment */}
            {currentStep === 1 && (paymentStatus === "idle" || paymentStatus === "verifying") && (
              <div className="space-y-6 flex-1 flex flex-col items-center justify-center py-4">
                <h3 className="text-3xl font-heading font-bold text-center">Review & Pay</h3>
                <p className="text-muted-foreground text-center max-w-md text-sm">
                  Review your package booking details. Payments are processed securely.
                </p>
                
                <div className="bg-muted/30 border border-border rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-border/50">
                    <span className="text-muted-foreground text-sm">Package</span>
                    <span className="font-bold text-right text-foreground">{packageData?.title}</span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-border/50 text-sm">
                    <span className="text-muted-foreground">Lead Traveler</span>
                    <span className="font-semibold text-right text-foreground">{leadTraveler.fullName}</span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-border/50 text-sm">
                    <span className="text-muted-foreground">Contact</span>
                    <span className="font-semibold text-right text-foreground">{leadTraveler.phone}</span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-border/50 text-sm">
                    <span className="text-muted-foreground">Travel Date</span>
                    <span className="font-semibold text-foreground">{selectedDate ? format(selectedDate, "PPP") : "N/A"}</span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-border/50 text-sm">
                    <span className="text-muted-foreground">Travelers</span>
                    <span className="font-semibold text-right text-foreground">
                      {safeAdults} Adult{safeAdults > 1 ? 's' : ''}
                      {safeChildren > 0 && `, ${safeChildren} Child${safeChildren > 1 ? 'ren' : ''}`}
                      {safeInfants > 0 && `, ${safeInfants} Infant`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-border/50 text-sm">
                    <span className="text-muted-foreground">Package Rate</span>
                    <span className="font-semibold text-right text-foreground">
                      ₹{applicableAdultPrice.toLocaleString("en-IN")} / person
                    </span>
                  </div>

                  {hasDiscount && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 pb-3 border-b border-border/50 text-sm">
                      <span>Agent Discount ({discountPercent}%)</span>
                      <span>-₹{Math.round(totalBasePrice * (discountPercent / 100)).toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pb-3 border-b border-border/50 text-sm">
                    <span className="text-muted-foreground">Base Package Fare</span>
                    <span className="font-semibold text-right">₹{Math.round(discountedBasePrice).toLocaleString("en-IN")}</span>
                  </div>

                  {gstPercent > 0 && (
                    <div className="flex justify-between items-center pb-3 border-b border-border/50 text-sm">
                      <span className="text-muted-foreground">GST ({gstPercent}%)</span>
                      <span className="font-semibold text-right">₹{Number(gstAmount.toFixed(2)).toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  {userData && (
                    <div className="py-3 border-b border-border/50">
                      {!appliedCoupon ? (
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Have a coupon code?</span>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder="Coupon code"
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
                    <span className="text-3xl font-bold font-heading text-primary">₹{Number(finalPrice.toFixed(2)).toLocaleString("en-IN")}</span>
                  </div>

                  {/* Part Payment Option if Enabled by Admin */}
                  {packagePartPayment.enabled && (
                    <div className="pt-4 border-t border-border/50">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Payment Option</span>
                      <div className="flex flex-col gap-2">
                        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentSelection === "full" ? "bg-primary/5 border-primary text-primary" : "bg-background border-border"}`}>
                          <input type="radio" name="paymentOption" checked={paymentSelection === "full"} onChange={() => setPaymentSelection("full")} className="w-4 h-4 text-primary" />
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">Pay Full Amount</span>
                            <span className="text-xs text-muted-foreground">₹{Number(finalPrice.toFixed(2)).toLocaleString("en-IN")}</span>
                          </div>
                        </label>
                        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentSelection === "part" ? "bg-primary/5 border-primary text-primary" : "bg-background border-border"}`}>
                          <input type="radio" name="paymentOption" checked={paymentSelection === "part"} onChange={() => setPaymentSelection("part")} className="w-4 h-4 text-primary" />
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">Pay Part Amount ({packagePartPayment.percentage}%)</span>
                            <span className="text-xs text-muted-foreground">₹{Number(((finalPrice * (packagePartPayment.percentage || 50)) / 100).toFixed(2)).toLocaleString("en-IN")}</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 items-center justify-center opacity-70">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-primary" /> 100% Secure Checkout
                  </span>
                </div>
              </div>
            )}

            {/* Success State */}
            {currentStep === 1 && paymentStatus === "success" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 flex-1 flex flex-col items-center justify-center py-8 text-center">
                 <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                   <Check className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                 </div>
                 <h3 className="text-4xl font-heading font-bold text-emerald-600 dark:text-emerald-400">Package Booking Confirmed!</h3>
                 <p className="text-lg text-muted-foreground max-w-md">Your tour package booking is secured. We look forward to hosting you!</p>
                 <div className="mt-8 flex gap-4">
                   {confirmedBooking && (
                     <Button onClick={handleDownloadPdf} disabled={generatingPdf} variant="default" className="rounded-xl px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                       <Download className="w-4 h-4 mr-2" /> {generatingPdf ? "Generating..." : "Download Invoice"}
                     </Button>
                   )}
                   <Link href="/user">
                     <Button variant="outline" className="rounded-xl px-6">View My Bookings</Button>
                   </Link>
                 </div>
                 
                 {/* Hidden Invoice for Printing */}
                 {confirmedBooking && (
                   <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                     <div ref={printRef}>
                       <BookingInvoice booking={confirmedBooking} />
                     </div>
                   </div>
                 )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
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
          className="rounded-xl px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all font-bold"
        >
          {paymentStatus === "verifying" ? "Processing..." : (currentStep === STEPS.length - 1 ? (!userData ? "Login to Pay" : `Pay ₹${Number(amountToPay.toFixed(2)).toLocaleString("en-IN")}`) : "Continue to Payment")} 
          {paymentStatus === "idle" && currentStep !== STEPS.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
