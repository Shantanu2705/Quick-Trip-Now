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
    <div id={id} className="bg-white w-[794px] p-[20mm] flex flex-col gap-10 relative" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* PREMIUM HEADER BORDER */}
      <div className="absolute top-0 left-0 w-full h-4 bg-primary z-20"></div>
      <div className="absolute top-4 left-0 w-full h-1 bg-[#28B9CE] z-20"></div>

      {/* BACKGROUND WATERMARK */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.04] grayscale mt-40">
        <img src="/images/logo_transparent.png" alt="watermark" className="w-[500px] h-auto object-contain" />
      </div>

      {/* INVOICE SUMMARY SECTION */}
      <div className="relative z-10 flex flex-col pt-6">
        {/* Header */}
        <div className="flex justify-between items-start pb-8 shrink-0">
          <div>
            <div className="h-20 w-36 mb-3 origin-left">
              <img src="/images/logo_transparent.png" alt="Quick Trip Now Logo" className="object-contain w-full h-full drop-shadow-sm" />
            </div>
            <div className="text-slate-600 text-sm mt-2 leading-relaxed border-l-4 border-primary pl-3 bg-slate-50 py-2 pr-4 rounded-r-lg">
              <p className="font-black text-slate-800 text-base">Quick Trip Now</p>
              <p className="mt-1">Bagdogra, Bhujiyapani, Darjeeling,</p>
              <p>West Bengal, India, Pin: 734017.</p>
              <p className="text-primary font-bold mt-1">quicktripnow1@gmail.com | +91 7047399677</p>
              <p className="text-xs mt-1 font-bold text-slate-500">GSTIN: <span className="text-slate-700">19DHGPR6231C1ZB</span></p>
              <p className="text-xs mt-0.5 font-bold text-slate-500">Place of Supply: <span className="text-slate-700">19-WEST BENGAL</span></p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-5xl font-black text-[#1e293b] tracking-tight uppercase" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
              <span className="text-primary">In</span>voice
            </h1>
            <h2 className="text-lg text-slate-400 font-bold tracking-widest mt-1 uppercase">Booking Receipt</h2>
            
            <div className="mt-6 text-sm bg-white p-5 rounded-2xl border-2 border-[rgba(245,130,32,0.3)] inline-block text-left ml-auto min-w-[340px] shadow-lg shadow-[rgba(245,130,32,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[rgba(245,130,32,0.05)] rounded-bl-full"></div>
              <div className="flex justify-between items-center gap-6 relative z-10">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Booking ID:</span>
                <span className="font-black text-primary text-xl bg-[rgba(245,130,32,0.1)] px-3 py-1 rounded-md">{booking.id}</span>
              </div>
              <div className="flex justify-between items-center gap-6 pt-4 mt-4 border-t border-slate-100 relative z-10">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Date Issued:</span>
                <span className="font-bold text-slate-800 text-base">{format(new Date(), 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className="w-full flex items-center justify-center my-4 opacity-70 shrink-0">
          <div className="h-0.5 w-full bg-[rgba(245,130,32,0.2)]"></div>
        </div>

        <div className="space-y-12 mt-6">
          {/* Customer Info */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative overflow-hidden break-inside-avoid shadow-sm w-full flex justify-between items-center">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#1e293b]"></div>
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Billed To Customer</h3>
              <div className="space-y-1.5">
                <p className="font-black text-2xl text-[#1e293b]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                  {booking.customerName || booking.fullName || booking.travelers?.[0]?.fullName || "Valued Customer"}
                </p>
                <div className="flex gap-4 text-[15px] font-medium text-slate-600 mt-2">
                  <p className="flex items-center gap-1.5"><span className="text-primary">✉</span> {booking.email || booking.travelers?.[0]?.email || "N/A"}</p>
                  <p className="flex items-center gap-1.5"><span className="text-primary">☎</span> {booking.phone || booking.travelers?.[0]?.phone || "N/A"}</p>
                </div>
              </div>
            </div>
            {booking.status && (
              <div className="text-right">
                <div className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm shadow-sm border ${
                  booking.status === 'confirmed' || booking.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                  booking.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                  Status: {booking.status}
                </div>
              </div>
            )}
          </div>

          {/* Trip Details (Summary Table) */}
          <div className="break-inside-avoid bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-[#1e293b] px-6 py-4 border-b border-slate-700">
              <h3 className="text-sm font-black text-white uppercase tracking-widest" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>Trip Summary</h3>
            </div>
            <table className="w-full text-left text-[15px] border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-4 px-6 font-bold w-1/2 uppercase text-xs tracking-wider">Description</th>
                  <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Travel Date</th>
                  <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Travelers</th>
                  <th className="py-4 px-6 font-bold text-right uppercase text-xs tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="align-top">
                  <td className="py-6 px-6 font-medium text-slate-800">
                    {booking.type === 'tour' || booking.type === 'package' ? (
                      <>
                        <span className="block font-black text-lg text-primary mb-1">{booking.packageName || booking.packageType || "Custom Travel Package"}</span>
                        {booking.vehicleName && <span className="inline-block bg-slate-100 px-2 py-1 rounded text-xs text-slate-600 font-bold mt-2 border border-slate-200">Vehicle: {booking.vehicleName} (x{booking.vehicleQty || 1})</span>}
                      </>
                    ) : booking.type === 'vehicle' || booking.type === 'cab' ? (
                      <>
                        <span className="block font-black text-lg text-primary mb-1">Private Transfer</span>
                        <span className="block text-sm text-slate-600 font-bold mb-1">{booking.pickup || "Origin"} ➔ {booking.dropoff || "Destination"}</span>
                        {booking.vehicleName && <span className="inline-block bg-slate-100 px-2 py-1 rounded text-xs text-slate-600 font-bold mt-2 border border-slate-200">Vehicle: {booking.vehicleName} (x{booking.vehicleQty || 1})</span>}
                      </>
                    ) : (
                      <>
                        <span className="block font-black text-lg text-primary mb-1">{booking.vehicleName || booking.packageType || booking.packageName || "Custom Travel Package"}</span>
                        {booking.vehicleName && <span className="inline-block bg-slate-100 px-2 py-1 rounded text-xs text-slate-600 font-bold mt-2 border border-slate-200">Vehicle Booking (x{booking.vehicleQty || 1})</span>}
                      </>
                    )}
                  </td>
                  <td className="py-6 px-6 text-slate-700 font-bold">{booking.date || booking.travelDate || "N/A"}</td>
                  <td className="py-6 px-6 text-slate-700 font-bold">
                    {[ 
                      booking.adultsCount ? `${booking.adultsCount} Adult(s)` : null, 
                      booking.childrenCount ? `${booking.childrenCount} Child(ren)` : null, 
                      booking.infantsCount ? `${booking.infantsCount} Infant(s)` : null 
                    ].filter(Boolean).join(', ') || (booking.travelers?.length ? `${booking.travelers.length} Person(s)` : "1 Person(s)")}
                  </td>
                  <td className="py-6 px-6 text-slate-800 font-black text-right text-lg">
                    ₹{booking.amount?.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) || 0}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mt-8 break-inside-avoid">
            <div className="w-[50%] p-6 rounded-2xl border-2 border-primary shadow-lg space-y-4 relative overflow-hidden bg-white">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
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

