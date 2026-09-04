import React from 'react';
import { Logo } from '@/components/shared/Logo';
import { format } from 'date-fns';

export function BookingInvoice({ booking, id }: { booking: any, id?: string }) {
  if (!booking) return null;

  return (
    <div 
      id={id} 
      className="bg-white text-slate-800 font-sans relative w-full" 
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 0; /* setting margin to 0 forces the browser to hide URL/Date headers and footers! */
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
          }
          
          /* Native repeating borders on all pages */
          .print-border {
            position: fixed;
            top: 12mm;
            bottom: 12mm;
            left: 12mm;
            right: 12mm;
            border: 2px solid #cbd5e1; /* slate-300 */
            border-radius: 8px;
            z-index: -10;
            pointer-events: none;
          }
          
          /* Native repeating watermark on all pages */
          .print-watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.05;
            z-index: -20;
            pointer-events: none;
          }
          
          .avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}} />

      {/* Repeating Fixed Background Elements */}
      <div className="print-border"></div>
      <div className="print-watermark">
        <Logo variant="bare" className="w-[400px] grayscale" />
      </div>

      {/* 
        Using a table with thead/tfoot is the only way to natively repeat top/bottom 
        margins on every printed page when @page margin is 0 
      */}
      <table className="w-full border-collapse border-0 m-0 p-0">
        <thead>
          <tr><td><div style={{ height: '18mm' }}></div></td></tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div style={{ paddingLeft: '20mm', paddingRight: '20mm' }} className="relative z-10 space-y-10">
                {/* Header */}
                <div className="flex justify-between items-start border-b-4 border-primary/20 pb-8 avoid-break">
                  <div>
                    <Logo variant="bare" className="h-14 w-56 mb-4 origin-left" />
                    <div className="text-slate-500 text-sm mt-4 leading-relaxed">
                      <p className="font-bold text-slate-700">Quick Trip Now</p>
                      <p>Bagdogra, Bhujiyapani, Darjeeling,</p>
                      <p>West Bengal, India, Pin: 734017.</p>
                      <p className="text-primary font-medium mt-1">quicktripnow1@gmail.com | +91 7047399677</p>
                      <p className="text-xs mt-1 font-bold text-slate-600">GSTIN: 19DHGPR6231C1ZB</p>
                      <p className="text-xs mt-0.5 font-bold text-slate-600">Place of Supply: 19-WEST BENGAL</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h1 className="text-5xl font-black text-primary tracking-tight uppercase">Invoice</h1>
                    <h2 className="text-xl text-slate-500 font-bold tracking-widest mt-2 uppercase">Booking Receipt</h2>
                    
                    <div className="mt-8 space-y-3 text-sm bg-primary/5 p-4 rounded-xl border border-primary/10 inline-block text-left ml-auto min-w-[280px] shadow-sm">
                      <div className="flex justify-between items-center gap-6">
                        <span className="text-primary/70 font-bold uppercase tracking-wider text-xs">Booking ID:</span>
                        <span className="font-mono font-black text-primary text-base">{booking.id}</span>
                      </div>
                      <div className="flex justify-between items-center gap-6 pt-3 border-t border-primary/10">
                        <span className="text-primary/70 font-bold uppercase tracking-wider text-xs">Date Issued:</span>
                        <span className="font-bold text-slate-700">{format(new Date(), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 relative overflow-hidden avoid-break">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Billed To</h3>
                  <div className="text-sm space-y-1">
                    <p className="font-bold text-lg text-slate-800">{booking.customerName || booking.fullName || booking.travelers?.[0]?.fullName || "Valued Customer"}</p>
                    <p className="text-slate-600">{booking.email || booking.travelers?.[0]?.email || "N/A"}</p>
                    <p className="text-slate-600">{booking.phone || booking.travelers?.[0]?.phone || "N/A"}</p>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="avoid-break">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Trip Summary</h3>
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-800 text-slate-800">
                        <th className="py-3 px-4 font-bold">Description</th>
                        <th className="py-3 px-4 font-bold">Travel Date</th>
                        <th className="py-3 px-4 font-bold">Travelers</th>
                        <th className="py-3 px-4 font-bold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="py-4 px-4 font-medium text-slate-800">
                          {booking.type === 'tour' || booking.type === 'package' ? (
                            <>
                              <span className="block">{booking.packageName || booking.packageType || "Custom Travel Package"}</span>
                              {booking.vehicleName && <span className="block text-xs text-slate-500 mt-1 font-normal">Vehicle: {booking.vehicleName} (x{booking.vehicleQty || 1})</span>}
                            </>
                          ) : booking.type === 'vehicle' || booking.type === 'cab' ? (
                            <>
                              <span className="block">Private Transfer: {booking.pickup || "Route"} to {booking.dropoff || "Destination"}</span>
                              {booking.vehicleName && <span className="block text-xs text-slate-500 mt-1 font-normal">Vehicle: {booking.vehicleName} (x{booking.vehicleQty || 1})</span>}
                            </>
                          ) : (
                            <>
                              <span className="block">{booking.vehicleName || booking.packageType || booking.packageName || "Custom Travel Package"}</span>
                              {booking.vehicleName && <span className="block text-xs text-slate-500 mt-1 font-normal">Vehicle Booking (x{booking.vehicleQty || 1})</span>}
                            </>
                          )}
                          <span className="block text-xs text-slate-500 mt-1 font-normal">SAC: 998552</span>
                        </td>
                        <td className="py-4 px-4 text-slate-600">{booking.date || booking.travelDate || "N/A"}</td>
                        <td className="py-4 px-4 text-slate-600">{booking.travelers?.length || 1} Person(s)</td>
                        <td className="py-4 px-4 text-right font-bold text-slate-800">₹{booking.amount?.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) || 0}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Summary & Totals */}
                <div className="flex justify-end avoid-break">
                  <div className="w-2/3 bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-3">
                    {(() => {
                      const baseFare = (booking.baseAmount || ((booking.amount || 0) - (booking.gstAmount || 0)));
                      const gstPercent = booking.gstPercentage || 0;
                      
                      // For past bookings where gstAmount was rounded to 0, display the calculated amount
                      // so the UI doesn't just show ₹0
                      const displayGst = booking.gstAmount || (baseFare * gstPercent) / 100;

                      return (
                        <>
                          <div className="flex justify-between text-sm text-slate-600">
                            <span>Base Fare</span>
                            <span>₹{baseFare.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                          </div>
                          {gstPercent > 0 ? (
                            <>
                              <div className="flex justify-between text-sm text-slate-600">
                                <span>CGST ({gstPercent / 2}%)</span>
                                <span>₹{(displayGst / 2).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                              </div>
                              <div className="flex justify-between text-sm text-slate-600">
                                <span>SGST ({gstPercent / 2}%)</span>
                                <span>₹{(displayGst / 2).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-between text-sm text-slate-600">
                              <span>Tax / Fees</span>
                              <span>₹0</span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                    <div className="border-t border-slate-200 pt-3 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 uppercase tracking-wider">Total Amount</span>
                        <span className="text-xl font-bold text-emerald-600">₹{booking.amount?.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) || 0}</span>
                      </div>
                      {booking.paymentType === 'part' && (
                        <>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-600 uppercase tracking-wider">Amount Paid</span>
                            <span className="font-bold text-emerald-600">₹{booking.paidAmount?.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) || 0}</span>
                          </div>
                          {booking.pendingAmount > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-bold text-slate-600 uppercase tracking-wider">Pending Balance</span>
                              <span className="font-bold text-red-600">₹{booking.pendingAmount?.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) || 0}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="pt-2 flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider">Payment Status</span>
                      <span className={`px-2 py-1 rounded font-bold uppercase tracking-wider ${
                        booking.status === 'confirmed' || booking.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status || 'pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Terms & Inclusions */}
                {(booking.terms || (booking.inclusions && booking.inclusions.length > 0)) && (
                  <div className="relative z-10 flex-1 text-xs pt-8 border-t border-slate-200">
                    {booking.inclusions && booking.inclusions.length > 0 && (
                      <div className="grid grid-cols-2 gap-8 mb-6 avoid-break">
                        {booking.inclusions.some((i: any) => String(i.included) === "true") && (
                          <div>
                            <h4 className="font-bold text-emerald-700 uppercase tracking-wider mb-3">Inclusions</h4>
                            <ul className="list-disc pl-4 text-slate-600 space-y-1.5 leading-relaxed">
                              {Array.from(new Set(booking.inclusions.filter((i: any) => String(i.included) === "true").map((item: any) => item.text))).map((text: any, idx: number) => {
                                if (text.includes('•')) {
                                  return text.split('•').map((p: string) => p.trim()).filter(Boolean).map((p: string, i: number) => (
                                    <li key={`${idx}-${i}`}>{p}</li>
                                  ));
                                }
                                return <li key={idx}>{text}</li>;
                              })}
                            </ul>
                          </div>
                        )}
                        {booking.inclusions.some((i: any) => String(i.included) === "false") && (
                          <div>
                            <h4 className="font-bold text-red-700 uppercase tracking-wider mb-3">Exclusions</h4>
                            <ul className="list-disc pl-4 text-slate-600 space-y-1.5 leading-relaxed">
                              {Array.from(new Set(booking.inclusions.filter((i: any) => String(i.included) === "false").map((item: any) => item.text))).map((text: any, idx: number) => {
                                if (text.includes('•')) {
                                  return text.split('•').map((p: string) => p.trim()).filter(Boolean).map((p: string, i: number) => (
                                    <li key={`${idx}-${i}`}>{p}</li>
                                  ));
                                }
                                return <li key={idx}>{text}</li>;
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    {booking.terms && (
                      <div className="mt-8 text-slate-600 whitespace-pre-wrap leading-relaxed text-[11px]">
                        <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-3 text-xs avoid-break">Specific Terms & Conditions</h4>
                        {booking.terms}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer / Signature Block */}
                <div className="relative z-10 pt-8 border-t-2 border-slate-200 flex justify-between items-end bg-white mt-12 avoid-break">
                  <div className="text-xs text-slate-500 space-y-1 w-1/3">
                    <p className="font-bold text-slate-700">Terms & Conditions:</p>
                    <p>1. Please retain this invoice for your records.</p>
                    <p>2. Subject to standard cancellation policies.</p>
                    <p>3. This is a computer generated invoice and does not require a physical signature.</p>
                  </div>
                  <div className="text-center w-1/3 space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Powered and Managed By:</p>
                    <img src="/images/swastik-logo.png" alt="Swastik Tripline" className="h-12 mx-auto grayscale opacity-80" />
                  </div>
                  <div className="text-center w-1/3 space-y-4">
                    <div className="h-16 border-b border-slate-400 flex items-center justify-center relative">
                      <div className="absolute opacity-20 rotate-[-15deg] font-heading font-black text-4xl text-emerald-600 border-4 border-emerald-600 p-2 rounded inline-block">
                        APPROVED
                      </div>
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Authorized Signature & Stamp
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr><td><div style={{ height: '18mm' }}></div></td></tr>
        </tfoot>
      </table>
    </div>
  );
}
