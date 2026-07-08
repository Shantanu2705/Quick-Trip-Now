"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = ["Travel Details", "Personal Info", "Payment"];

export function BookingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    upiId: ""
  });
  const [formData, setFormData] = useState({
    date: "",
    packageType: "North Sikkim 3 Days",
    adults: 2,
    children: 0,
    fullName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  const processPayment = () => {
    setIsProcessing(true);
    const delay = paymentMethod === "upi" ? 6000 : 2000; // UPI takes longer to simulate user opening app
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        const message = `*New Tour Booking Request*\n\n*Package:* ${formData.packageType}\n*Date:* ${formData.date}\n*Guests:* ${formData.adults} Adults, ${formData.children} Children\n\n*Customer Details*\n*Name:* ${formData.fullName}\n*Email:* ${formData.email}\n*Phone:* ${formData.phone}\n*Special Requests:* ${formData.specialRequests || 'None'}\n\n*Status:* Payment Confirmed on Website`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/919429694567?text=${encodedMessage}`, '_blank');
      }, 1500);
    }, delay);
  };

  const handleNext = () => {
    setError("");
    if (currentStep === 0) {
      if (!formData.date) return setError("Date of Journey is required.");
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selectedDate < today) return setError("Date of Journey cannot be in the past.");
      if (formData.adults < 1) return setError("At least 1 adult is required.");
    }
    if (currentStep === 1) {
      if (formData.fullName.trim().length < 3) return setError("Please enter a valid full name.");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) return setError("Please enter a valid email address.");
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) return setError("Please enter a valid 10-digit phone number.");
    }
    
    if (currentStep === STEPS.length - 1) {
      setError("");
      
      // Payment Validation
      if (paymentMethod === "card") {
        const cardNum = paymentData.cardNumber.replace(/\s/g, "");
        if (!/^\d{16}$/.test(cardNum)) return setError("Please enter a valid 16-digit card number.");
        
        // Luhn Algorithm to check if card actually mathematically exists
        let sum = 0;
        let isEven = false;
        for (let i = cardNum.length - 1; i >= 0; i--) {
          let digit = parseInt(cardNum.charAt(i), 10);
          if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
          }
          sum += digit;
          isEven = !isEven;
        }
        if (sum % 10 !== 0) return setError("This card number does not exist. Please check the digits.");
        
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentData.expiry)) return setError("Please enter a valid expiry date (MM/YY).");
        
        const [month, year] = paymentData.expiry.split("/");
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        if (expiryDate < new Date()) return setError("Card has expired.");
        
        if (!/^\d{3,4}$/.test(paymentData.cvv)) return setError("Please enter a valid CVV (3 or 4 digits).");
        
        processPayment();
      } else {
        if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(paymentData.upiId)) {
          return setError("Please enter a valid UPI ID (e.g. name@bank).");
        }
        
        // Simulate checking UPI ID existence with Bank API
        setIsProcessing(true);
        setTimeout(() => {
          if (paymentData.upiId.toLowerCase().includes('fail') || paymentData.upiId.toLowerCase().includes('invalid')) {
            setIsProcessing(false);
            return setError("This UPI ID does not exist or is inactive.");
          }
          processPayment();
        }, 1200);
      }
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
                <h3 className="text-2xl font-heading font-bold">Travel Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Date of Journey</label>
                    <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-muted/50 border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Package Type</label>
                    <select value={formData.packageType} onChange={(e) => setFormData({...formData, packageType: e.target.value})} className="w-full bg-muted/50 border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none">
                      <option>North Sikkim 3 Days</option>
                      <option>Nathula 1 Day</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Adults</label>
                    <input type="number" min="1" value={formData.adults} onChange={(e) => setFormData({...formData, adults: parseInt(e.target.value) || 0})} className="w-full bg-muted/50 border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Children (Below 5)</label>
                    <input type="number" min="0" value={formData.children} onChange={(e) => setFormData({...formData, children: parseInt(e.target.value) || 0})} className="w-full bg-muted/50 border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
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
                    <label className="text-sm font-medium text-foreground">Special Requests</label>
                    <input type="text" placeholder="Optional" value={formData.specialRequests} onChange={(e) => setFormData({...formData, specialRequests: e.target.value})} className="w-full bg-muted/50 border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && !paymentSuccess && !isProcessing && (
              <div className="space-y-6 flex-1 flex flex-col items-center justify-center py-4">
                <h3 className="text-3xl font-heading font-bold text-center">Payment Details</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Complete your booking securely via our payment gateway.
                </p>
                
                <div className="w-full max-w-md bg-muted/30 border border-border rounded-xl p-6 space-y-4">
                   <div className="flex bg-background rounded-lg p-1 border border-border">
                     <button onClick={() => setPaymentMethod("card")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${paymentMethod === "card" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Card</button>
                     <button onClick={() => setPaymentMethod("upi")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${paymentMethod === "upi" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>UPI</button>
                   </div>
                   
                   {paymentMethod === "card" ? (
                     <>
                       <div className="space-y-2">
                         <label className="text-sm font-medium">Card Number</label>
                         <input type="text" placeholder="0000 0000 0000 0000" maxLength={19} value={paymentData.cardNumber} onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})} className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                       </div>
                       <div className="flex gap-4">
                         <div className="space-y-2 flex-1">
                           <label className="text-sm font-medium">Expiry</label>
                           <input type="text" placeholder="MM/YY" maxLength={5} value={paymentData.expiry} onChange={(e) => setPaymentData({...paymentData, expiry: e.target.value})} className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                         </div>
                         <div className="space-y-2 flex-1">
                           <label className="text-sm font-medium">CVV</label>
                           <input type="password" placeholder="123" maxLength={4} value={paymentData.cvv} onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})} className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                         </div>
                       </div>
                     </>
                   ) : (
                     <div className="space-y-2">
                       <label className="text-sm font-medium">UPI ID / VPA</label>
                       <input type="text" placeholder="yourname@upi" value={paymentData.upiId} onChange={(e) => setPaymentData({...paymentData, upiId: e.target.value})} className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                     </div>
                   )}
                </div>

                <div className="bg-muted/30 border border-border rounded-xl p-4 w-full max-w-md mt-2 flex justify-between items-center">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="text-xl font-bold font-heading">₹8,000</span>
                </div>
              </div>
            )}

            {currentStep === 2 && isProcessing && !paymentSuccess && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 flex-1 flex flex-col items-center justify-center py-8 text-center">
                 <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                 
                 {paymentMethod === "upi" ? (
                   <>
                     <h3 className="text-3xl font-heading font-bold text-primary">Approve Payment</h3>
                     <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl max-w-md">
                       <p className="text-foreground font-medium mb-2">
                         A payment request of <strong className="text-lg">₹8,000</strong> has been sent to your UPI App.
                       </p>
                       <p className="text-sm text-muted-foreground">
                         ID: <span className="font-semibold text-foreground">{paymentData.upiId}</span>
                       </p>
                     </div>
                     <p className="text-sm font-medium animate-pulse text-muted-foreground mt-4">Waiting for you to authorize the payment...</p>
                   </>
                 ) : (
                   <>
                     <h3 className="text-3xl font-heading font-bold text-primary">Processing Payment</h3>
                     <p className="text-muted-foreground max-w-md">Please do not close or refresh this window.</p>
                   </>
                 )}
              </motion.div>
            )}
            
            {currentStep === 2 && paymentSuccess && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 flex-1 flex flex-col items-center justify-center py-8 text-center">
                 <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                   <Check className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                 </div>
                 <h3 className="text-4xl font-heading font-bold text-emerald-600 dark:text-emerald-400">Payment Successful!</h3>
                 <p className="text-lg text-muted-foreground max-w-md">Your booking has been secured.</p>
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
          disabled={currentStep === 0 || isProcessing || paymentSuccess}
          className="rounded-xl px-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={isProcessing || paymentSuccess}
          className="rounded-xl px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
        >
          {isProcessing ? "Processing..." : (currentStep === STEPS.length - 1 ? "Proceed to Pay" : "Continue")} 
          {!isProcessing && <ChevronRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
