"use client";

import { useState, useRef } from "react";
import { Eye, Download, Receipt, Users, CalendarDays } from "lucide-react";
import { BookingInvoice } from "@/components/admin/BookingInvoice";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import html2pdf from 'html2pdf.js';
import { useRouter } from "next/navigation";

export function DashboardBookingsList({ bookings }: { bookings: any[] }) {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [updating, setUpdating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleDownloadPdf = async () => {
    if (!printRef.current || !selectedBooking) return;
    setGeneratingPdf(true);
    try {
      const element = printRef.current;
      if (!element) return;
      
      const opt = {
        margin:       0,
        filename:     `Booking_${selectedBooking.id}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err: any) {
      console.error("PDF generation error:", err);
      alert(`Failed to generate PDF: ${err?.message || err}. Please try again.`);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const getTravelersCount = (b: any) => {
    return b.travelers?.length > 1 
      ? b.travelers.length 
      : ((b.adultsCount || 0) + (b.childrenCount || 0) + (b.infantsCount || 0)) || 1;
  };

  const handleMarkAsPaid = async (bookingId: string, totalAmount: number) => {
    if (!confirm("Are you sure you want to mark the pending balance for this booking as paid?")) return;
    setUpdating(true);
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const res = await fetch(`/api/admin/bookings?id=${bookingId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ pendingAmount: 0, paidAmount: totalAmount, status: 'confirmed' })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedBooking((prev: any) => ({ ...prev, pendingAmount: 0, paidAmount: totalAmount, status: 'confirmed' }));
        router.refresh();
      } else {
        alert("Failed to update booking.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {bookings.length > 0 ? bookings.map((booking) => (
        <div key={booking.id} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
          <div>
            <p className="font-medium">{booking.itemTitle || booking.packageType || booking.packageName || booking.vehicleName || "Booking"}</p>
            <p className="text-sm text-muted-foreground">
              Booked by {booking.customerName || booking.fullName || "Customer"} 
              {booking.date && ` • ${new Date(booking.date).toLocaleDateString()}`}
            </p>
          </div>
          <div className="text-right flex items-center gap-3">
            <div>
              <p className="font-bold">₹{(booking.amount || 0).toLocaleString("en-IN")}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                booking.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                'bg-red-100 text-red-800'
              }`}>
                {booking.status || "Confirmed"}
              </span>
            </div>
            <button 
              onClick={() => setSelectedBooking(booking)}
              className="p-2 hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition-colors" 
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      )) : (
        <p className="text-muted-foreground text-sm">No bookings found.</p>
      )}

      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="max-w-4xl sm:max-w-4xl md:max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl p-0 border-none">
          {selectedBooking && (
            <div className="bg-background" id="booking-details-pdf">
              <div className="bg-primary/5 border-b border-border p-6 md:p-8 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-2xl font-heading font-bold">Booking Details</DialogTitle>
                  <DialogDescription>
                    ID: <span className="font-mono">{selectedBooking.id}</span>
                  </DialogDescription>
                </DialogHeader>
                <button 
                  onClick={handleDownloadPdf} 
                  disabled={generatingPdf}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-sm disabled:opacity-70"
                >
                  <Download className="w-4 h-4" />
                  {generatingPdf ? "Generating..." : "Download PDF"}
                </button>
              </div>
              
              <div className="p-6 md:p-8 space-y-8">
                {/* Package Info */}
                <div>
                  <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-primary" />
                    Trip Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        {selectedBooking.vehicleName ? "Vehicle / Route" : "Package"}
                      </div>
                      <div className="font-medium">
                        {selectedBooking.vehicleName || selectedBooking.packageType || selectedBooking.packageName || "Custom Booking"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Date</div>
                      <div className="font-medium">{selectedBooking.date || selectedBooking.travelDate || "N/A"}</div>
                    </div>
                    {selectedBooking.paymentType === 'part' ? (
                      <>
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Amount</div>
                          <div className="font-bold">₹{selectedBooking.amount?.toLocaleString("en-IN") || 0}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Paid</div>
                          <div className="font-bold text-emerald-600">₹{selectedBooking.paidAmount?.toLocaleString("en-IN") || 0}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Pending</div>
                          <div className="font-bold text-destructive">₹{selectedBooking.pendingAmount?.toLocaleString("en-IN") || 0}</div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Amount</div>
                        <div className="font-bold text-primary">₹{selectedBooking.amount?.toLocaleString("en-IN") || 0}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${
                        selectedBooking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {selectedBooking.status}
                      </span>
                      {selectedBooking.paymentType === 'part' && selectedBooking.pendingAmount > 0 && (
                        <button
                          onClick={() => handleMarkAsPaid(selectedBooking.id, selectedBooking.amount)}
                          disabled={updating}
                          className="mt-2 block w-full text-center bg-primary text-primary-foreground text-xs font-bold py-1.5 px-2 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          {updating ? "Updating..." : "Mark as Paid"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lead Traveler Details */}
                <div>
                  <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Lead Traveler
                  </h3>
                  <div className="space-y-3">
                    {selectedBooking.travelers && selectedBooking.travelers.length > 0 ? (
                      <div className="bg-background border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            1
                          </div>
                          <div>
                            <div className="font-bold text-sm">
                              {selectedBooking.travelers[0].fullName}
                              <span className="ml-2 text-[10px] uppercase tracking-wider bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Lead</span>
                            </div>
                            <div className="text-xs text-muted-foreground">{selectedBooking.travelers[0].email}</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-muted-foreground md:text-right">
                          {selectedBooking.travelers[0].phone}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-background border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            1
                          </div>
                          <div>
                            <div className="font-bold text-sm">
                              {selectedBooking.customerName || selectedBooking.fullName}
                              <span className="ml-2 text-[10px] uppercase tracking-wider bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Lead</span>
                            </div>
                            <div className="text-xs text-muted-foreground">{selectedBooking.email}</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-muted-foreground md:text-right">
                          {selectedBooking.phone}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 px-1">
                    Total Party Size: <span className="font-semibold text-foreground">{getTravelersCount(selectedBooking)} Person(s)</span>
                  </div>
                </div>

                {/* Special Requests */}
                {selectedBooking.specialRequests && (
                  <div>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Special Requests</h3>
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-900 p-4 rounded-xl text-sm">
                      {selectedBooking.specialRequests}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Hidden Invoice Template for PDF Generation */}
      {selectedBooking && (
        <div style={{ position: 'absolute', top: 0, left: 0, zIndex: -9999, pointerEvents: 'none' }}>
          <div ref={printRef} style={{ width: '800px', backgroundColor: 'white' }}>
            <BookingInvoice booking={selectedBooking} id="dashboard-booking-invoice-pdf" />
          </div>
        </div>
      )}
    </div>
  );
}
