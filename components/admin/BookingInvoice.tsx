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
      
      {/* INVOICE SUMMARY SECTION */}
      <div className="relative z-10 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start pb-6 shrink-0">
          <div>
            <Logo variant="bare" className="h-12 w-auto object-contain origin-left" />
            <div className="text-slate-500 text-[11px] mt-4 leading-relaxed">
              <p className="font-bold text-slate-700 text-sm mb-0.5">Quick Trip Now</p>
              <p>Bagdogra, Bhujiyapani, Darjeeling,</p>
              <p>West Bengal, India, Pin: 734017.</p>
              <p className="text-primary font-bold mt-1">quicktripnow1@gmail.com | +91 7047399677</p>
              <p className="font-bold text-slate-600 mt-1">GSTIN: 19DHGPR6231C1ZB <span className="mx-1 font-normal text-slate-300">|</span> Place of Supply: 19-WEST BENGAL</p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <h1 className="text-4xl font-black text-primary tracking-tight uppercase">Invoice</h1>
            <h2 className="text-xs text-slate-400 font-bold tracking-widest mt-1.5 uppercase">Booking Receipt</h2>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-8 mt-4 border-t-2 border-slate-100 pt-6 break-inside-avoid">
          {/* Customer Info */}
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Billed To</h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
              <p className="font-black text-base text-slate-800">{booking.customerName || booking.fullName || booking.travelers?.[0]?.fullName || "Valued Customer"}</p>
              <p className="text-slate-600 text-sm mt-1">{booking.email || booking.travelers?.[0]?.email || "N/A"}</p>
              <p className="text-slate-600 text-sm font-medium">{booking.phone || booking.travelers?.[0]?.phone || "N/A"}</p>
            </div>
          </div>

          {/* Invoice Details */}
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Invoice Details</h3>
            <div className="bg-[rgba(245, 130, 32, 0.05)] p-4 rounded-xl border border-[rgba(245, 130, 32, 0.1)] h-full flex flex-col justify-center">
              <div className="flex justify-between items-center text-sm mb-3">
                <span className="text-[rgba(245, 130, 32, 0.7)] font-bold uppercase tracking-wider text-[10px]">Booking ID:</span>
                <span className="font-mono font-black text-primary text-base">{booking.id}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-3 border-t border-[rgba(245, 130, 32, 0.1)]">
                <span className="text-[rgba(245, 130, 32, 0.7)] font-bold uppercase tracking-wider text-[10px]">Date Issued:</span>
                <span className="font-bold text-slate-700 text-sm">{format(new Date(), 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {/* Trip Details (Summary Table) */}
          <div className="break-inside-avoid">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Trip Summary</h3>
            <div className="border-2 border-slate-100 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 border-b-2 border-slate-100">
                  <tr className="text-slate-500">
                    <th className="py-3 px-5 font-black text-[10px] uppercase tracking-wider w-1/2">Description</th>
                    <th className="py-3 px-5 font-black text-[10px] uppercase tracking-wider">Travel Date</th>
                    <th className="py-3 px-5 font-black text-[10px] uppercase tracking-wider">Travelers</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr className="align-top">
                    <td className="py-4 px-5 font-medium text-slate-800">
                      {booking.type === 'tour' || booking.type === 'package' ? (
                        <>
                          <span className="block font-black text-base text-primary mb-1">{booking.packageName || booking.packageType || "Custom Travel Package"}</span>
                          {booking.vehicleName && <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-600 font-bold">Vehicle: {booking.vehicleName} (x{booking.vehicleQty || 1})</span>}
                        </>
                      ) : booking.type === 'vehicle' || booking.type === 'cab' ? (
                        <>
                          <span className="block font-black text-base text-primary mb-1">Private Transfer</span>
                          <span className="block text-[13px] text-slate-600 font-semibold mb-1">{booking.pickup || "Origin"} ➔ {booking.dropoff || "Destination"}</span>
                          {booking.vehicleName && <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-600 font-bold">Vehicle: {booking.vehicleName} (x{booking.vehicleQty || 1})</span>}
                        </>
                      ) : (
                        <>
                          <span className="block font-black text-base text-primary mb-1">{booking.vehicleName || booking.packageType || booking.packageName || "Custom Travel Package"}</span>
                          {booking.vehicleName && <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-600 font-bold">Vehicle (x{booking.vehicleQty || 1})</span>}
                        </>
                      )}
                      <div className="mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">SAC Code: 998552</div>
                    </td>
                    <td className="py-4 px-5 text-slate-700 font-bold">{booking.date || booking.travelDate || "N/A"}</td>
                    <td className="py-4 px-5 text-slate-700 font-semibold">
                      {[ 
                        booking.adultsCount ? `${booking.adultsCount} Adult(s)` : null, 
                        booking.childrenCount ? `${booking.childrenCount} Child(ren)` : null, 
                        booking.infantsCount ? `${booking.infantsCount} Infant(s)` : null 
                      ].filter(Boolean).join(', ') || (booking.travelers?.length ? `${booking.travelers.length} Person(s)` : "1 Person(s)")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mt-6 break-inside-avoid">
            <div className="w-1/2 bg-slate-50 p-5 rounded-xl border-2 border-slate-100 shadow-sm space-y-2">
              {(() => {
                const baseFare = (booking.baseAmount || ((booking.amount || 0) - (booking.gstAmount || 0)));
                const gstPercent = booking.gstPercentage || 0;
                const displayGst = booking.gstAmount || (baseFare * gstPercent) / 100;
                const subTotal = baseFare + displayGst;
                const discountAmount = booking.couponCode ? (subTotal - (booking.amount || 0)) : 0;

                return (
                  <>
                    <div className="flex justify-between text-[13px] text-slate-600">
                      <span className="font-bold">Base Fare</span>
                      <span className="font-black text-slate-800">₹{baseFare.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    </div>
                    {gstPercent > 0 ? (
                      <>
                        <div className="flex justify-between text-[13px] text-slate-500">
                          <span className="font-medium">CGST ({gstPercent / 2}%)</span>
                          <span className="font-bold">₹{(displayGst / 2).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-[13px] text-slate-500">
                          <span className="font-medium">SGST ({gstPercent / 2}%)</span>
                          <span className="font-bold">₹{(displayGst / 2).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-[13px] text-slate-500">
                        <span className="font-medium">Tax / Fees</span>
                        <span className="font-bold">₹0</span>
                      </div>
                    )}
                    
                    {booking.couponCode && discountAmount > 0.01 && (
                      <>
                        <div className="flex justify-between text-[13px] font-black text-slate-700 mt-2 pt-2 border-t border-slate-200 border-dashed">
                          <span>Sub Total</span>
                          <span>₹{subTotal.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-[12px] font-black text-emerald-600 mt-1">
                          <span>Coupon Applied ({booking.couponCode})</span>
                          <span>-₹{discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
              <div className="border-t-2 border-slate-200 pt-3 mt-2 flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-black text-slate-800 uppercase tracking-wider text-xs">Total Amount</span>
                  <span className="text-xl font-black text-emerald-600">₹{booking.amount?.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) || 0}</span>
                </div>
                {booking.paymentType === 'part' && (
                  <>
                    <div className="flex justify-between items-center text-xs bg-[#ecfdf580] px-3 py-2 rounded-lg border border-emerald-100">
                      <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">Amount Paid</span>
                      <span className="font-black text-emerald-700">₹{booking.paidAmount?.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) || 0}</span>
                    </div>
                    {booking.pendingAmount > 0 && (
                      <div className="flex justify-between items-center text-xs bg-[#fef2f280] px-3 py-2 rounded-lg border border-red-100 mt-1">
                        <span className="font-bold text-red-800 uppercase tracking-wider text-[10px]">Pending Balance</span>
                        <span className="font-black text-red-700">₹{booking.pendingAmount?.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) || 0}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="pt-3 flex justify-between items-center">
                <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Payment Status</span>
                <span className={`px-2.5 py-1 rounded-[6px] text-[10px] font-black uppercase tracking-widest ${
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
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-4 border-b-2 border-slate-200 pb-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Trip Itinerary & Details
          </h3>
          
          {booking.description && (
            <div className="mb-6 bg-slate-50 p-5 rounded-xl border border-slate-200 break-inside-avoid">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Overview</h4>
              <p className="text-[13px] text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                {booking.description}
              </p>
            </div>
          )}

          {hasItinerary && (
            <div className="space-y-4">
              {booking.itinerary.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-start break-inside-avoid">
                  {item.day && (
                    <div className="shrink-0 bg-[rgba(245, 130, 32, 0.1)] text-primary w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm border border-[rgba(245, 130, 32, 0.2)]">
                      D{item.day}
                    </div>
                  )}
                  <div className="pt-0.5">
                    {item.title ? (
                      <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                    ) : (
                      <h4 className="font-bold text-slate-800 text-sm">{item.location}</h4>
                    )}
                    {item.desc && <p className="text-[13px] text-slate-600 mt-1 leading-relaxed">{item.desc}</p>}
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
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-4 border-b-2 border-slate-200 pb-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Terms & Inclusions
          </h3>
        
          <div className="flex-1">
            {hasInclusions && (
              <div className="grid grid-cols-2 gap-6 mb-8 break-inside-avoid">
                {booking.inclusions.some((i: any) => String(i.included) === "true") && (
                  <div className="bg-[#ecfdf580] p-5 rounded-xl border border-emerald-100">
                    <h4 className="font-black text-emerald-700 text-[10px] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Inclusions
                    </h4>
                    <ul className="list-none text-slate-700 space-y-2 text-[13px] font-medium">
                      {Array.from(new Set(booking.inclusions.filter((i: any) => String(i.included) === "true").map((item: any) => item.text))).map((text: any, idx: number) => {
                        if (text.includes('•')) {
                          return text.split('•').map((p: string) => p.trim()).filter(Boolean).map((p: string, i: number) => (
                            <li key={`${idx}-${i}`} className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> {p}</li>
                          ));
                        }
                        return <li key={idx} className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> {text}</li>;
                      })}
                    </ul>
                  </div>
                )}
                {booking.inclusions.some((i: any) => String(i.included) === "false") && (
                  <div className="bg-[#fef2f280] p-5 rounded-xl border border-red-100">
                    <h4 className="font-black text-red-700 text-[10px] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Exclusions
                    </h4>
                    <ul className="list-none text-slate-700 space-y-2 text-[13px] font-medium">
                      {Array.from(new Set(booking.inclusions.filter((i: any) => String(i.included) === "false").map((item: any) => item.text))).map((text: any, idx: number) => {
                        if (text.includes('•')) {
                          return text.split('•').map((p: string) => p.trim()).filter(Boolean).map((p: string, i: number) => (
                            <li key={`${idx}-${i}`} className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span> {p}</li>
                          ));
                        }
                        return <li key={idx} className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span> {text}</li>;
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {hasTerms && (
              <div className="text-slate-600 leading-relaxed text-[12px] space-y-2 mt-2">
                <h4 className="font-black text-slate-700 uppercase tracking-wider mb-2.5 text-[10px] border-l-2 border-primary pl-2 break-inside-avoid">Specific Terms & Conditions</h4>
                {allTerms.map((term: string, idx: number) => (
                  <p key={idx} className="flex gap-2 break-inside-avoid">
                    <span className="text-slate-400 font-bold shrink-0">{idx + 1}.</span> 
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

