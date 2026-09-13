import React from 'react';
import { Logo } from '@/components/shared/Logo';
import { format } from 'date-fns';

const SignatureBlock = () => (
  <div className="relative z-10 pt-8 border-t-2 border-slate-200 flex justify-between items-end bg-white mt-12 break-inside-avoid">
    <div className="text-xs text-slate-500 space-y-1 w-1/3">
      <p className="font-bold text-slate-700">Terms & Conditions:</p>
      <p>1. Please retain this invoice for your records.</p>
      <p>2. Subject to standard cancellation policies.</p>
      <p>3. This is a computer generated invoice and does not require a physical signature.</p>
    </div>
    <div className="text-center w-1/3 space-y-2 translate-y-6">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Powered and Managed By:</p>
      <img src="/images/swastik-logo.png" alt="Swastik Tripline" className="h-12 mx-auto grayscale opacity-80" />
    </div>
    <div className="text-center w-1/3 space-y-3">
      <div className="h-20 border-b-2 border-slate-400 flex items-end justify-center relative pb-1">
        <img 
          src="/images/sign.png" 
          alt="Authorized Signature" 
          className="h-16 object-contain mix-blend-multiply opacity-90 drop-shadow-sm pointer-events-none" 
        />
      </div>
      <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
        Authorized Signature & Stamp
      </div>
    </div>
  </div>
);

export function BookingInvoice({ booking, id }: { booking: any, id?: string }) {
  if (!booking) return null;

  const hasInclusions = booking.inclusions && booking.inclusions.length > 0;
  const allTerms = booking.terms ? booking.terms.split('\n').filter((t: string) => t.trim().length > 0) : [];
  const hasTerms = allTerms.length > 0;
  const hasItinerary = booking.itinerary && booking.itinerary.length > 0;

  return (
    <div id={id} className="bg-white w-[794px] p-[20mm] flex flex-col gap-10" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      
      {/* BACKGROUND WATERMARK */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.03] grayscale mt-32">
        <img src="/images/logo_transparent.png" alt="watermark" className="w-[600px] h-auto object-contain" />
      </div>

      {/* INVOICE SUMMARY SECTION */}
      <div className="relative z-10 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start pb-6 shrink-0">
          <div>
            <div className="h-20 w-32 mb-2 origin-left">
              <img src="/images/logo_transparent.png" alt="Quick Trip Now Logo" className="object-contain w-full h-full drop-shadow-sm" />
            </div>
            <div className="text-slate-500 text-sm mt-2 leading-relaxed">
              <p className="font-bold text-slate-700">Quick Trip Now</p>
              <p>Bagdogra, Bhujiyapani, Darjeeling,</p>
              <p>West Bengal, India, Pin: 734017.</p>
              <p className="text-primary font-medium mt-1">quicktripnow1@gmail.com | +91 7047399677</p>
              <p className="text-xs mt-1 font-bold text-slate-600">GSTIN: 19DHGPR6231C1ZB</p>
              <p className="text-xs mt-0.5 font-bold text-slate-600">Place of Supply: 19-WEST BENGAL</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-5xl font-black text-primary tracking-tight uppercase" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>Invoice</h1>
            <h2 className="text-xl text-slate-500 font-bold tracking-widest mt-2 uppercase" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>Booking Receipt</h2>
            
            <div className="mt-8 space-y-3 text-sm bg-[rgba(245,130,32,0.03)] p-5 rounded-xl border border-[rgba(245,130,32,0.15)] inline-block text-left ml-auto min-w-[320px] shadow-sm">
              <div className="flex justify-between items-center gap-6">
                <span className="text-[rgba(245,130,32,0.9)] font-bold uppercase tracking-wider text-xs">Booking ID:</span>
                <span className="font-black text-primary text-lg">{booking.id}</span>
              </div>
              <div className="flex justify-between items-center gap-6 pt-3 border-t border-[rgba(245,130,32,0.15)]">
                <span className="text-[rgba(245,130,32,0.9)] font-bold uppercase tracking-wider text-xs">Date Issued:</span>
                <span className="font-bold text-slate-700">{format(new Date(), 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className="w-full border-b-2 border-[rgba(245,130,32,0.2)] my-2 shrink-0"></div>

        <div className="space-y-10 mt-8">
          {/* Customer Info */}
          <div className="bg-[rgba(245,130,32,0.03)] p-6 rounded-xl border border-[rgba(245,130,32,0.15)] relative overflow-hidden break-inside-avoid shadow-sm w-full">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
            <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>Billed To</h3>
            <div className="text-sm space-y-1.5">
              <p className="font-bold text-xl text-slate-800">{booking.customerName || booking.fullName || booking.travelers?.[0]?.fullName || "Valued Customer"}</p>
              <p className="text-slate-600 text-[15px]">{booking.email || booking.travelers?.[0]?.email || "N/A"}</p>
              <p className="text-slate-600 text-[15px]">{booking.phone || booking.travelers?.[0]?.phone || "N/A"}</p>
            </div>
          </div>

          {/* Trip Details (Summary Table) */}
          <div className="break-inside-avoid">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>Trip Summary</h3>
            <table className="w-full text-left text-[15px] border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100 text-slate-700">
                  <th className="py-4 px-4 font-bold w-1/2">Description</th>
                  <th className="py-4 px-4 font-bold">Travel Date</th>
                  <th className="py-4 px-4 font-bold">Travelers</th>
                  <th className="py-4 px-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="align-top">
                  <td className="py-6 px-4 font-medium text-slate-800">
                    {booking.type === 'tour' || booking.type === 'package' ? (
                      <>
                        <span className="block font-bold text-lg text-slate-800 mb-1">{booking.packageName || booking.packageType || "Custom Travel Package"}</span>
                        {booking.vehicleName && <span className="block text-sm text-slate-500 font-normal">Vehicle Included: {booking.vehicleName} (x{booking.vehicleQty || 1})</span>}
                      </>
                    ) : booking.type === 'vehicle' || booking.type === 'cab' ? (
                      <>
                        <span className="block font-bold text-lg text-slate-800 mb-1">Private Transfer</span>
                        <span className="block text-sm text-slate-600 mb-1">Route: {booking.pickup || "Origin"} to {booking.dropoff || "Destination"}</span>
                        {booking.vehicleName && <span className="block text-sm text-slate-500 font-normal">Vehicle: {booking.vehicleName} (x{booking.vehicleQty || 1})</span>}
                      </>
                    ) : (
                      <>
                        <span className="block font-bold text-lg text-slate-800 mb-1">{booking.vehicleName || booking.packageType || booking.packageName || "Custom Travel Package"}</span>
                        {booking.vehicleName && <span className="block text-sm text-slate-500 font-normal">Vehicle Booking (x{booking.vehicleQty || 1})</span>}
                      </>
                    )}
                  </td>
                  <td className="py-6 px-4 text-slate-700 font-bold">{booking.date || booking.travelDate || "N/A"}</td>
                  <td className="py-6 px-4 text-slate-700 font-bold">
                    {[ 
                      booking.adultsCount ? `${booking.adultsCount} Adult(s)` : null, 
                      booking.childrenCount ? `${booking.childrenCount} Child(ren)` : null, 
                      booking.infantsCount ? `${booking.infantsCount} Infant(s)` : null 
                    ].filter(Boolean).join(', ') || (booking.travelers?.length ? `${booking.travelers.length} Person(s)` : "1 Person(s)")}
                  </td>
                  <td className="py-6 px-4 text-slate-700 font-bold text-right">
                    ₹{booking.amount?.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) || 0}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mt-12 break-inside-avoid">
            <div className="w-[45%] p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative overflow-hidden bg-white">
              {(() => {
                const baseFare = (booking.baseAmount || ((booking.amount || 0) - (booking.gstAmount || 0)));
                const gstPercent = booking.gstPercentage || 0;
                const displayGst = booking.gstAmount || (baseFare * gstPercent) / 100;
                const subTotal = baseFare + displayGst;
                const discountAmount = booking.couponCode ? (subTotal - (booking.amount || 0)) : 0;

                return (
                  <>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span className="font-medium">Base Fare</span>
                      <span className="font-semibold">₹{baseFare.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    </div>
                    {gstPercent > 0 ? (
                      <>
                        <div className="flex justify-between text-sm text-slate-600">
                          <span className="font-medium">CGST ({gstPercent / 2}%)</span>
                          <span className="font-semibold">₹{(displayGst / 2).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                          <span className="font-medium">SGST ({gstPercent / 2}%)</span>
                          <span className="font-semibold">₹{(displayGst / 2).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-sm text-slate-600">
                        <span className="font-medium">Tax / Fees</span>
                        <span className="font-semibold">₹0</span>
                      </div>
                    )}
                    
                    {booking.couponCode && discountAmount > 0.01 && (
                      <>
                        <div className="flex justify-between text-sm font-semibold text-slate-700 mt-3 pt-3 border-t border-slate-200 border-dashed">
                          <span>Sub Total</span>
                          <span>₹{subTotal.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-emerald-600 mt-1">
                          <span>Coupon Applied ({booking.couponCode})</span>
                          <span>-₹{discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
              <div className="border-t-2 border-slate-200 pt-4 mt-2 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="font-black text-slate-800 uppercase tracking-wider">Total Amount</span>
                  <span className="text-2xl font-black text-emerald-600">₹{booking.amount?.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) || 0}</span>
                </div>
                {booking.paymentType === 'part' && (
                  <>
                    <div className="flex justify-between items-center text-sm bg-emerald-50 p-2 rounded-lg">
                      <span className="font-bold text-emerald-800 uppercase tracking-wider">Amount Paid</span>
                      <span className="font-black text-emerald-700">₹{booking.paidAmount?.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) || 0}</span>
                    </div>
                    {booking.pendingAmount > 0 && (
                      <div className="flex justify-between items-center text-sm bg-red-50 p-2 rounded-lg">
                        <span className="font-bold text-red-800 uppercase tracking-wider">Pending Balance</span>
                        <span className="font-black text-red-700">₹{booking.pendingAmount?.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) || 0}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="pt-4 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Payment Status</span>
                <span className={`px-3 py-1.5 rounded-md font-black uppercase tracking-widest shadow-sm ${
                  booking.status === 'confirmed' || booking.status === 'paid' ? 'bg-emerald-500 text-white' : 
                  booking.status === 'pending' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {booking.status || 'pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TRIP DETAILS & ITINERARY */}
      {(booking.description || hasItinerary) && (
        <div className="mt-8">
          <h3 className="text-2xl font-heading font-black text-primary uppercase tracking-widest mb-6 border-b-4 border-[rgba(245,130,32,0.2)] pb-4">Trip Itinerary & Details</h3>
          
          {booking.description && (
            <div className="mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100 break-inside-avoid">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3">Overview</h4>
              <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                {booking.description}
              </p>
            </div>
          )}

          {hasItinerary && (
            <div className="space-y-6">
              {booking.itinerary.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-start break-inside-avoid">
                  {item.day && (
                    <div className="shrink-0 bg-[rgba(245,130,32,0.1)] text-primary w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border border-[rgba(245,130,32,0.2)]">
                      D{item.day}
                    </div>
                  )}
                  <div className="pt-1">
                    {item.title ? (
                      <h4 className="font-bold text-slate-800 text-base">{item.title}</h4>
                    ) : (
                      <h4 className="font-bold text-slate-800 text-base">{item.location}</h4>
                    )}
                    {item.desc && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TERMS & INCLUSIONS */}
      {(hasInclusions || hasTerms) && (
        <div className="mt-8">
          <h3 className="text-2xl font-heading font-black text-slate-800 uppercase tracking-widest mb-8 border-b-4 border-[rgba(245,130,32,0.2)] pb-4">Terms & Inclusions</h3>
        
          <div className="flex-1">
            {hasInclusions && (
              <div className="grid grid-cols-2 gap-8 mb-10 break-inside-avoid">
                {booking.inclusions.some((i: any) => String(i.included) === "true") && (
                  <div className="bg-[rgba(236,253,245,0.5)] p-6 rounded-2xl border border-emerald-100">
                    <h4 className="font-black text-emerald-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Inclusions
                    </h4>
                    <ul className="list-none text-slate-700 space-y-2.5 text-sm font-medium">
                      {Array.from(new Set(booking.inclusions.filter((i: any) => String(i.included) === "true").map((item: any) => item.text))).map((text: any, idx: number) => {
                        if (text.includes('•')) {
                          return text.split('•').map((p: string) => p.trim()).filter(Boolean).map((p: string, i: number) => (
                            <li key={`${idx}-${i}`} className="flex items-start gap-2"><span className="text-emerald-500 mt-1">✓</span> {p}</li>
                          ));
                        }
                        return <li key={idx} className="flex items-start gap-2"><span className="text-emerald-500 mt-1">✓</span> {text}</li>;
                      })}
                    </ul>
                  </div>
                )}
                {booking.inclusions.some((i: any) => String(i.included) === "false") && (
                  <div className="bg-[rgba(254,242,242,0.5)] p-6 rounded-2xl border border-red-100">
                    <h4 className="font-black text-red-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span> Exclusions
                    </h4>
                    <ul className="list-none text-slate-700 space-y-2.5 text-sm font-medium">
                      {Array.from(new Set(booking.inclusions.filter((i: any) => String(i.included) === "false").map((item: any) => item.text))).map((text: any, idx: number) => {
                        if (text.includes('•')) {
                          return text.split('•').map((p: string) => p.trim()).filter(Boolean).map((p: string, i: number) => (
                            <li key={`${idx}-${i}`} className="flex items-start gap-2"><span className="text-red-400 mt-1">✗</span> {p}</li>
                          ));
                        }
                        return <li key={idx} className="flex items-start gap-2"><span className="text-red-400 mt-1">✗</span> {text}</li>;
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {hasTerms && (
              <div className="text-slate-600 leading-relaxed text-xs space-y-2.5 mt-4">
                <h4 className="font-black text-slate-800 uppercase tracking-wider mb-4 text-sm border-l-4 border-primary pl-3 break-inside-avoid">Specific Terms & Conditions</h4>
                {allTerms.map((term: string, idx: number) => (
                  <p key={idx} className="flex gap-2 break-inside-avoid">
                    <span className="text-slate-400 shrink-0">{idx + 1}.</span> 
                    <span>{term}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AT THE VERY BOTTOM */}
      <SignatureBlock />
    </div>
  );
}

