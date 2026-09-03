"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Package, MapPin, Car, FileText, User, Download } from "lucide-react";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";
import { BookingInvoice } from "@/components/admin/BookingInvoice";

export default function UserBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);
  const [printingBooking, setPrintingBooking] = useState<any>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: printingBooking ? `Booking_${printingBooking.id}` : "Booking_Invoice",
    onAfterPrint: () => {
      setGeneratingPdf(false);
      setTimeout(() => setPrintingBooking(null), 100);
    },
    onPrintError: () => {
      setGeneratingPdf(false);
      setTimeout(() => setPrintingBooking(null), 100);
    },
  });

  const handleDownloadPdf = (booking: any) => {
    setPrintingBooking(booking);
    setGeneratingPdf(true);
    setTimeout(() => {
      if (handlePrint) handlePrint();
    }, 150);
  };

  useEffect(() => {
    async function fetchBookings() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/user/bookings", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setBookings(data.data);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchBookings();
  }, [user]);

  const handlePayBalance = async (booking: any) => {
    if (!user) return;
    setPayingBookingId(booking.id);
    try {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const token = await user.getIdToken();
      const data = await fetch("/api/create-order", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          amount: booking.pendingAmount, 
          userId: user.uid,
          bookingDetails: {
            bookingId: booking.id,
            isBalancePayment: true
          }
        }), 
      }).then((t) => t.json());

      if (data.error) {
        setPayingBookingId(null);
        alert(`Server Error: ${data.error}`);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: data.amount,
        currency: data.currency,
        name: "Quick Trip Now",
        description: `Balance payment for ${booking.type === 'package' ? booking.packageName : booking.vehicleName}`,
        order_id: data.id,
        handler: async function () {
          // Confirm payment
          try {
            const token = await user.getIdToken();
            await fetch(`/api/user/bookings?id=${booking.id}`, {
              method: "PUT",
              headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify({ pendingAmount: 0, paidAmount: booking.amount, status: 'confirmed' })
            });
            // Update local state
            setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, pendingAmount: 0, paidAmount: booking.amount, status: 'confirmed' } : b));
          } catch (e) {
            console.error(e);
          }
          setPayingBookingId(null);
        },
        theme: { color: "#29B4C4" },
        modal: { ondismiss: function() { setPayingBookingId(null); } }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      setPayingBookingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold text-foreground">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your upcoming and past bookings.</p>
      </div>

      {bookings.length === 0 ? (
        <Card className="rounded-2xl border-border/50 shadow-sm bg-background/50">
          <CardContent className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <CalendarDays className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground max-w-sm">
              You haven't made any bookings. When you book a tour or a vehicle, it will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="rounded-2xl border-border/50 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="flex flex-col md:flex-row">
                {/* Left/Top Section: Overview */}
                <div className="bg-muted/20 p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-border/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.status || 'Pending'}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">ID: {booking.id.slice(-6).toUpperCase()}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold font-heading mb-1 mt-4">
                      {booking.type === 'package' ? booking.packageName : booking.vehicleName}
                    </h3>
                    
                    {booking.type === 'vehicle' && (
                      <div className="text-sm text-muted-foreground font-medium mb-4 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {booking.pickup} to {booking.dropoff}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Total Amount</div>
                        <div className="text-2xl font-bold text-primary">₹{(booking.amount || 0).toLocaleString('en-IN')}</div>
                      </div>
                      {booking.paymentType === 'part' && booking.pendingAmount > 0 && (
                        <div className="text-right">
                          <div className="text-[10px] text-destructive uppercase font-bold tracking-wider mb-1">Pending Balance</div>
                          <div className="text-lg font-bold text-destructive">₹{booking.pendingAmount.toLocaleString('en-IN')}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Right/Bottom Section: Details */}
                <div className="p-6 md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1.5 mb-2">
                      <CalendarDays className="w-4 h-4" /> Travel Date
                    </div>
                    <div className="font-medium">{booking.date ? format(new Date(booking.date), 'dd MMM yyyy') : 'N/A'}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1.5 mb-2">
                      <FileText className="w-4 h-4" /> Booking Date
                    </div>
                    <div className="font-medium">{booking.createdAt ? format(new Date(booking.createdAt), 'dd MMM yyyy') : 'N/A'}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1.5 mb-2">
                      {booking.type === 'package' ? <Package className="w-4 h-4" /> : <Car className="w-4 h-4" />} 
                      Booking Type
                    </div>
                    <div className="font-medium capitalize">{booking.type || 'N/A'}</div>
                    {booking.type === 'vehicle' && (
                      <div className="text-sm text-muted-foreground">Qty: {booking.vehicleQty || 1}</div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1.5 mb-2">
                      <User className="w-4 h-4" /> Travelers
                    </div>
                    <div className="font-medium">
                      {booking.adultsCount || 0} Adults
                      {booking.childrenCount > 0 ? `, ${booking.childrenCount} Children` : ''}
                      {booking.infantsCount > 0 ? `, ${booking.infantsCount} Infants` : ''}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Section: Actions */}
              <div className={`p-4 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${booking.paymentType === 'part' && booking.pendingAmount > 0 ? 'bg-destructive/5 border-destructive/10' : 'bg-muted/10 border-border/50'}`}>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => handleDownloadPdf(booking)}
                    disabled={generatingPdf && printingBooking?.id === booking.id}
                    className="px-4 py-2 bg-background border border-border text-foreground text-sm font-bold rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {generatingPdf && printingBooking?.id === booking.id ? "Generating..." : "Download Invoice"}
                  </button>
                </div>
                
                {booking.paymentType === 'part' && booking.pendingAmount > 0 && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-semibold text-destructive">Pending Balance: ₹{booking.pendingAmount.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Pay remaining to fully confirm.</p>
                    </div>
                    <button 
                      onClick={() => handlePayBalance(booking)}
                      disabled={payingBookingId === booking.id}
                      className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap disabled:opacity-50 w-full sm:w-auto shadow-sm"
                    >
                      {payingBookingId === booking.id ? "Processing..." : "Pay Balance"}
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Hidden Invoice Template for PDF Generation */}
      {printingBooking && (
        <div className="hidden">
          <div ref={printRef}>
            <BookingInvoice booking={printingBooking} id="booking-invoice-pdf" />
          </div>
        </div>
      )}
    </div>
  );
}
