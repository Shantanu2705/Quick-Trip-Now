"use client";

import { useState, useEffect } from "react";
import { Search, RefreshCw, Eye, CalendarDays, Receipt, Users, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { BookingInvoice } from "@/components/admin/BookingInvoice";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function AdminBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      const htmlToImage = await import("html-to-image");
      const jsPDF = (await import("jspdf")).default;
      
      const element = document.getElementById("booking-invoice-pdf");
      if (!element) return;
      
      // Calculate CSS pixels per PDF page
      const marginMm = 10;
      const contentWidthMm = 210 - (marginMm * 2); // 190mm
      const contentHeightMm = 297 - (marginMm * 2); // 277mm
      const pxPerMm = 794 / contentWidthMm;
      const pxPerPage = contentHeightMm * pxPerMm;
      
      // Reset height to let it grow naturally
      element.style.minHeight = '1123px';
      element.style.height = 'auto';
      
      const footer = document.getElementById("invoice-footer");
      let originalMarginTop = "";
      if (footer) {
        originalMarginTop = footer.style.marginTop;
        const footerTop = footer.offsetTop;
        const footerBottom = footerTop + footer.offsetHeight;
        
        const startPage = Math.floor(footerTop / pxPerPage);
        const endPage = Math.floor(footerBottom / pxPerPage);
        
        if (startPage !== endPage) {
          // Footer crosses a page boundary. Push it down safely.
          const currentMt = parseInt(window.getComputedStyle(footer).marginTop || "0");
          const targetTop = endPage * pxPerPage;
          const extraPush = targetTop - footerTop + (marginMm * pxPerMm);
          footer.style.marginTop = `${currentMt + extraPush}px`;
        }
      }
      
      const imgData = await htmlToImage.toPng(element, { pixelRatio: 2 });

      const img = new window.Image();
      img.src = imgData;
      await new Promise((resolve) => { img.onload = resolve; });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // 10mm margin for border
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;
      
      const pdfHeight = (img.height * contentWidth) / img.width;
      
      let heightLeft = pdfHeight;
      let position = margin;
      
      // Load watermark image
      const watermarkImg = new window.Image();
      watermarkImg.src = "/images/logo_transparent.png";
      await new Promise((resolve) => { watermarkImg.onload = resolve; });
      const wmWidth = 80;
      const wmHeight = (watermarkImg.height * wmWidth) / watermarkImg.width;
      const wmX = (pdfWidth - wmWidth) / 2;
      const wmY = (pageHeight - wmHeight) / 2;
      
      const drawPageExtras = () => {
        // Draw white masks over all 4 margins to hide any overflowing unclipped image
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfWidth, margin, "F"); // Top mask
        pdf.rect(0, pageHeight - margin, pdfWidth, margin, "F"); // Bottom mask
        pdf.rect(0, 0, margin, pageHeight, "F"); // Left mask
        pdf.rect(pdfWidth - margin, 0, margin, pageHeight, "F"); // Right mask

        // Draw watermark with opacity if possible
        try {
          pdf.setGState(new (pdf as any).GState({opacity: 0.08}));
          pdf.addImage(watermarkImg, "PNG", wmX, wmY, wmWidth, wmHeight);
          pdf.setGState(new (pdf as any).GState({opacity: 1.0}));
        } catch (e) {
          // fallback without opacity
        }
        
        // Draw border
        pdf.setDrawColor(203, 213, 225); // slate-300
        pdf.setLineWidth(1);
        pdf.rect(margin, margin, contentWidth, contentHeight);
      };

      pdf.addImage(imgData, "PNG", margin, position, contentWidth, pdfHeight);
      drawPageExtras();
      heightLeft -= contentHeight;
      
      while (heightLeft > 0) {
        position = position - contentHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, position, contentWidth, pdfHeight);
        drawPageExtras();
        heightLeft -= contentHeight;
      }
      
      pdf.save(`Booking_${selectedBooking.id}.pdf`);
      
      // Reset element styles after generation
      element.style.minHeight = '1123px';
      element.style.height = 'auto';
      if (footer) {
        footer.style.marginTop = originalMarginTop;
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      
      const res = await fetch("/api/admin/bookings", {
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
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  // Search by Unique ID (Firestore Document ID) or Customer Name
  const filteredBookings = bookings.filter((b) => 
    b.id?.toLowerCase().includes(search.toLowerCase()) || 
    b.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    b.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Bookings</h1>
          <p className="text-muted-foreground">Search and manage all customer and agent bookings using their Unique ID.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchBookings} className="p-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-all shadow-sm">
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            All Bookings
          </CardTitle>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by Unique Booking ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-y border-border/50">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Booking ID</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Lead Traveler</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Package / Vehicle</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Amount</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{booking.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{booking.customerName || booking.fullName || "N/A"}</div>
                      <div className="text-muted-foreground text-xs">{booking.email}</div>
                      {booking.travelers && booking.travelers.length > 1 && (
                        <div className="text-xs text-primary mt-1">+{booking.travelers.length - 1} more</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">{booking.packageType || booking.packageName || booking.vehicleName || "Custom Booking"}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {booking.date || booking.travelDate || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold">₹{booking.amount?.toLocaleString("en-IN") || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {booking.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedBooking(booking)}
                        className="p-2 hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition-colors" 
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Receipt className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-lg font-medium">No bookings found</p>
                        <p className="text-sm">Try adjusting your search or wait for new bookings.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <p>Loading bookings...</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
                  id="pdf-download-btn"
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
                      <div className="font-medium">{selectedBooking.date || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Amount</div>
                      <div className="font-bold text-primary">₹{selectedBooking.amount?.toLocaleString("en-IN") || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${
                        selectedBooking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {selectedBooking.status}
                      </span>
                    </div>
                  </div>
                  {selectedBooking.vehicleName && (
                    <div className="mt-4 bg-primary/5 p-4 rounded-xl border border-primary/20">
                      <div className="text-xs text-primary uppercase tracking-wider mb-1 font-bold">Allocated Vehicle</div>
                      <div className="font-medium text-foreground">{selectedBooking.vehicleName} <span className="text-muted-foreground text-sm">(x{selectedBooking.vehicleQty || 1})</span></div>
                    </div>
                  )}
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
                      // Fallback for older bookings without travelers array
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
                    Total Party Size: <span className="font-semibold text-foreground">{selectedBooking.travelers?.length || 1} Person(s)</span>
                  </div>
                </div>

                {/* Special Requests */}
                {selectedBooking.specialRequests && (
                  <div>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Special Requests</h3>
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 p-4 rounded-xl text-sm">
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
        <BookingInvoice booking={selectedBooking} id="booking-invoice-pdf" />
      )}
    </div>
  );
}
