"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Users, Calendar as CalendarIcon, Check, ShieldCheck, Clock, MapPin, Star, AlertCircle, Sparkles, Receipt, CheckCircle2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { GroupTour } from "@/lib/firestore-utils";
import { useAuth } from "@/hooks/useAuth";

export function GroupTourBookingClient({
  tour,
  globalMaxChildAge = 12,
  tourDetailsContent
}: {
  tour: GroupTour;
  globalMaxChildAge?: number;
  tourDetailsContent: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const initialAdults = parseInt(searchParams?.get("adults") || "2", 10) || 2;
  const initialChildren = parseInt(searchParams?.get("children") || "0", 10) || 0;
  const initialInfants = parseInt(searchParams?.get("infants") || "0", 10) || 0;
  const initialDateStr = searchParams?.get("date");
  const initialDate = initialDateStr ? new Date(initialDateStr) : undefined;

  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [adults, setAdults] = useState<number>(initialAdults);
  const [children, setChildren] = useState<number>(initialChildren);
  const [infants, setInfants] = useState<number>(initialInfants);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Lead Traveler Info
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [validationError, setValidationError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Price resolution based on selected date (Seasonal or Base)
  const pricing = useMemo(() => {
    let adultPrice = tour.price || 0;
    let childPrice = tour.childPrice || 0;
    let isSeasonal = false;

    if (date && tour.seasonalPrices && tour.seasonalPrices.length > 0) {
      const dateStr = format(date, "yyyy-MM-dd");
      const activeSeason = tour.seasonalPrices.find(
        sp => dateStr >= sp.startDate && dateStr <= sp.endDate
      );
      if (activeSeason) {
        adultPrice = activeSeason.price;
        if (activeSeason.childPrice !== undefined) {
          childPrice = activeSeason.childPrice;
        }
        isSeasonal = true;
      }
    }

    const adultsTotal = adults * adultPrice;
    const childrenTotal = children * childPrice;
    const subtotal = adultsTotal + childrenTotal;
    const gstRate = tour.gstPercentage || 0;
    const gstAmount = Math.round((subtotal * gstRate) / 100);
    const grandTotal = subtotal + gstAmount;

    // Part payment calculation
    const partPaymentEnabled = tour.partPayment?.enabled || false;
    const partPercentage = tour.partPayment?.percentage || 50;
    const advancePayable = partPaymentEnabled
      ? Math.round((grandTotal * partPercentage) / 100)
      : grandTotal;
    const balancePayable = grandTotal - advancePayable;

    return {
      adultPrice,
      childPrice,
      isSeasonal,
      adultsTotal,
      childrenTotal,
      subtotal,
      gstRate,
      gstAmount,
      grandTotal,
      partPaymentEnabled,
      partPercentage,
      advancePayable,
      balancePayable
    };
  }, [date, adults, children, tour]);

  const handleBooking = async () => {
    setValidationError("");

    if (!date) {
      setValidationError("Please select your date of journey.");
      return;
    }
    if (adults < 1) {
      setValidationError("At least 1 adult traveler is required.");
      return;
    }
    if (!fullName.trim()) {
      setValidationError("Please enter lead traveler's full name.");
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      setValidationError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setValidationError("Please enter a valid email address.");
      return;
    }
    if (!termsAccepted) {
      setValidationError("Please accept the terms & conditions to proceed.");
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        bookingType: "group-tour",
        tourId: tour.id,
        package: tour.title,
        packageName: tour.title,
        destination: tour.destination,
        duration: tour.duration || `${tour.days} Days / ${tour.nights} Nights`,
        date: date.toISOString(),
        tripDate: date.toISOString(),
        adults,
        children,
        infants,
        totalTravelers: adults + children + infants,
        leadTraveler: {
          fullName,
          phone,
          email,
          specialRequests
        },
        customerName: fullName,
        customerPhone: phone,
        customerEmail: email,
        specialRequests,
        pricingModel: "per-person",
        adultPrice: pricing.adultPrice,
        childPrice: pricing.childPrice,
        subtotal: pricing.subtotal,
        gstPercentage: pricing.gstRate,
        gstAmount: pricing.gstAmount,
        totalAmount: pricing.grandTotal,
        amount: pricing.advancePayable,
        paidAmount: pricing.advancePayable,
        balanceAmount: pricing.balancePayable,
        partPayment: pricing.partPaymentEnabled ? {
          enabled: true,
          percentage: pricing.partPercentage,
          advancePaid: pricing.advancePayable,
          balanceDue: pricing.balancePayable
        } : undefined,
        terms: tour.termsAndConditions || tour.terms || "",
        inclusions: tour.inclusions || [],
        itinerary: tour.itinerary || [],
        userId: user?.uid || "guest"
      };

      const res = await fetch("/api/confirm-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });

      const data = await res.json();
      if (data.success) {
        setConfirmedBooking({
          ...bookingData,
          id: data.bookingId
        });
      } else {
        setValidationError(data.error || "Failed to confirm booking. Please try again.");
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      setValidationError("An error occurred while confirming booking: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Tour Details */}
        <div className="lg:col-span-7 xl:col-span-8">
          {tourDetailsContent}
        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-28">
          <div className="bg-background rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-border space-y-6">
            {/* Price Header */}
            <div className="border-b border-border pb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold font-heading text-primary">
                  ₹{pricing.adultPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-muted-foreground text-sm font-medium">/ person (Adult)</span>
              </div>
              {pricing.childPrice > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  ₹{pricing.childPrice.toLocaleString("en-IN")} per child (Ages 2-{globalMaxChildAge})
                </div>
              )}
              {pricing.isSeasonal && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" /> Seasonal Date Pricing Active
                </div>
              )}
            </div>

            {/* Date of Journey */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Date of Journey <span className="text-destructive">*</span>
              </label>
              <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                <PopoverTrigger
                  className="w-full justify-start text-left font-semibold text-sm rounded-2xl h-14 border border-border bg-background hover:bg-accent px-4 flex items-center transition-colors"
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                  {date ? format(date, "PPP") : <span className="text-muted-foreground">Select journey date</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      setDate(d);
                      setIsDateOpen(false);
                      setValidationError("");
                    }}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Travelers Count */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Travellers
              </label>
              <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-4">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm block">Adults</span>
                    <span className="text-xs text-muted-foreground">Ages 13 and above</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      disabled={adults <= 1}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary transition-colors disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold">{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults(adults + 1)}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="h-px bg-border/50" />

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm block">Children</span>
                    <span className="text-xs text-muted-foreground">Ages 2 to {globalMaxChildAge}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      disabled={children <= 0}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary transition-colors disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold">{children}</span>
                    <button
                      type="button"
                      onClick={() => setChildren(children + 1)}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="h-px bg-border/50" />

                {/* Infants */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm block">Infants</span>
                    <span className="text-xs text-muted-foreground">Under 2 years (Free)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setInfants(Math.max(0, infants - 1))}
                      disabled={infants <= 0}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary transition-colors disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold">{infants}</span>
                    <button
                      type="button"
                      onClick={() => setInfants(infants + 1)}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Traveler Details */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Lead Traveler Details
              </label>
              <div className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-muted/20 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp / Phone Number (10 digits) *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-muted/20 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-muted/20 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
                <textarea
                  placeholder="Special requests, pickup point, dietary needs (Optional)"
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full bg-muted/20 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Live Pricing Breakdown */}
            <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{adults} × Adult{adults > 1 ? "s" : ""}</span>
                <span className="font-semibold text-foreground">₹{pricing.adultsTotal.toLocaleString("en-IN")}</span>
              </div>
              {children > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>{children} × Child{children > 1 ? "ren" : ""}</span>
                  <span className="font-semibold text-foreground">₹{pricing.childrenTotal.toLocaleString("en-IN")}</span>
                </div>
              )}
              {pricing.gstRate > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>GST ({pricing.gstRate}%)</span>
                  <span className="font-semibold text-foreground">₹{pricing.gstAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-bold text-base text-foreground">
                <span>Total Tour Price</span>
                <span className="text-primary font-heading text-lg">₹{pricing.grandTotal.toLocaleString("en-IN")}</span>
              </div>

              {pricing.partPaymentEnabled && (
                <div className="bg-primary/10 rounded-xl p-3 border border-primary/20 space-y-1 mt-2 text-xs">
                  <div className="flex justify-between font-bold text-primary">
                    <span>Pay Now ({pricing.partPercentage}% Advance):</span>
                    <span>₹{pricing.advancePayable.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Payable on Arrival:</span>
                    <span>₹{pricing.balancePayable.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border accent-primary cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
                I agree to the <span className="text-foreground font-semibold">Terms & Conditions</span>, cancellation policy, and government permit guidelines for this group tour.
              </label>
            </div>

            {/* Error Message */}
            {validationError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Book Now Button */}
            <Button
              onClick={handleBooking}
              disabled={isSubmitting}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg rounded-2xl shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {isSubmitting ? "Confirming Booking..." : pricing.partPaymentEnabled ? `Pay ₹${pricing.advancePayable.toLocaleString("en-IN")} & Book` : `Book Group Tour (₹${pricing.grandTotal.toLocaleString("en-IN")})`}
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background border border-border rounded-3xl p-6 md:p-8 max-w-lg w-full text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-heading text-foreground">Booking Confirmed!</h3>
              <p className="text-muted-foreground text-sm">
                Your group tour booking has been placed successfully. A confirmation message and booking invoice have been sent to your WhatsApp number.
              </p>
            </div>

            <div className="bg-muted/40 border border-border rounded-2xl p-4 text-left text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking ID:</span>
                <span className="font-bold text-foreground font-mono">{confirmedBooking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tour:</span>
                <span className="font-semibold text-foreground truncate max-w-[200px]">{confirmedBooking.package}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Departure Date:</span>
                <span className="font-semibold text-foreground">{format(new Date(confirmedBooking.date), "PPP")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Travelers:</span>
                <span className="font-semibold text-foreground">{confirmedBooking.totalTravelers} Pax</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-bold">
                <span>Amount Confirmed:</span>
                <span className="text-primary font-heading">₹{confirmedBooking.paidAmount?.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <Button
              onClick={() => router.push("/")}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold"
            >
              Back to Home
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
