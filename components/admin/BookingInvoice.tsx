import React from 'react';
import { Logo } from '@/components/shared/Logo';
import { format } from 'date-fns';

const SignatureBlock = () => (
  <div className="relative z-10 pt-8 border-t-2 border-slate-200 flex justify-between items-end bg-white mt-12">
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
);

const BackgroundElements = () => (
  <>
    <div className="absolute inset-[12mm] border-2 border-slate-300 rounded-lg pointer-events-none z-0"></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none z-0">
      <Logo variant="bare" className="w-[400px] grayscale" />
    </div>
  </>
);

export function BookingInvoice({ booking, id }: { booking: any, id?: string }) {
  if (!booking) return null;

  const hasInclusions = booking.inclusions && booking.inclusions.length > 0;
  const allTerms = booking.terms ? booking.terms.split('\n').filter((t: string) => t.trim().length > 0) : [];
  const hasTerms = allTerms.length > 0;
  const hasItinerary = booking.itinerary && booking.itinerary.length > 0;
  
  // Chunk itinerary: 3 days per page to avoid overflow
  const itineraryChunks = [];
  if (hasItinerary) {
    for (let i = 0; i < booking.itinerary.length; i += 3) {
      itineraryChunks.push(booking.itinerary.slice(i, i + 3));
    }
  }

  // Chunk terms: much smaller limits to guarantee we don't overflow and squash text.
  // Inclusions can be long, so if they exist, 0 terms on page 1. Otherwise, 10 terms.
  const termsPage1Limit = hasInclusions ? 0 : 10; 
  const termsPage1 = allTerms.slice(0, termsPage1Limit);
  const remainingTerms = allTerms.slice(termsPage1Limit);
  const termsChunks = [];
  for (let i = 0; i < remainingTerms.length; i += 12) {
    termsChunks.push(remainingTerms.slice(i, i + 12));
  }

  return (
    <div id={id} className="bg-slate-100 flex flex-col gap-8 w-max pb-8" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      
      {/* PAGE 1: INVOICE SUMMARY */}
      <div className="pdf-page bg-white relative w-[794px] min-h-[1123px] h-max p-[20mm] shrink-0 overflow-hidden shadow-lg">
        <BackgroundElements />
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start border-b-4 border-primary/20 pb-8 shrink-0">
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

          <div className="flex-1 space-y-10 mt-10">
            {/* Customer Info */}
            <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
              <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Billed To</h3>
              <div className="text-sm space-y-1">
                <p className="font-bold text-lg text-slate-800">{booking.customerName || booking.fullName || booking.travelers?.[0]?.fullName || "Valued Customer"}</p>
                <p className="text-slate-600">{booking.email || booking.travelers?.[0]?.email || "N/A"}</p>
                <p className="text-slate-600">{booking.phone || booking.travelers?.[0]?.phone || "N/A"}</p>
              </div>
            </div>

            {/* Trip Details (Summary Table Only) */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Trip Summary</h3>
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-800 text-slate-800">
                    <th className="py-3 px-4 font-bold w-1/2">Description</th>
                    <th className="py-3 px-4 font-bold">Travel Date</th>
                    <th className="py-3 px-4 font-bold">Travelers</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200 align-top">
                    <td className="py-4 px-4 font-medium text-slate-800">
                      {booking.type === 'tour' || booking.type === 'package' ? (
                        <>
                          <span className="block font-bold text-base text-primary">{booking.packageName || booking.packageType || "Custom Travel Package"}</span>
                          {booking.vehicleName && <span className="block text-xs text-slate-500 mt-1 font-normal">Vehicle Included: {booking.vehicleName} (x{booking.vehicleQty || 1})</span>}
                        </>
                      ) : booking.type === 'vehicle' || booking.type === 'cab' ? (
                        <>
                          <span className="block font-bold text-base text-primary">Private Transfer</span>
                          <span className="block text-sm text-slate-600 mt-1">Route: {booking.pickup || "Origin"} to {booking.dropoff || "Destination"}</span>
                          {booking.vehicleName && <span className="block text-xs text-slate-500 mt-1 font-normal">Vehicle: {booking.vehicleName} (x{booking.vehicleQty || 1})</span>}
                        </>
                      ) : (
                        <>
                          <span className="block font-bold text-base text-primary">{booking.vehicleName || booking.packageType || booking.packageName || "Custom Travel Package"}</span>
                          {booking.vehicleName && <span className="block text-xs text-slate-500 mt-1 font-normal">Vehicle Booking (x{booking.vehicleQty || 1})</span>}
                        </>
                      )}
                      <span className="block text-xs text-slate-400 mt-3 font-normal">SAC: 998552</span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-semibold">{booking.date || booking.travelDate || "N/A"}</td>
                    <td className="py-4 px-4 text-slate-600">
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

            {/* Summary & Totals */}
            <div className="flex justify-end mt-12">
              <div className="w-2/3 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
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

          <SignatureBlock />
        </div>
      </div>

      {/* PAGE(S) 2+: ITINERARY & DESCRIPTION (IF APPLICABLE) */}
      {(booking.description || hasItinerary) && (
        <div className="pdf-page bg-white relative w-[794px] min-h-[1123px] h-max p-[20mm] shrink-0 overflow-hidden shadow-lg">
          <BackgroundElements />
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="text-2xl font-heading font-black text-primary uppercase tracking-widest mb-6 border-b-4 border-primary/20 pb-4">Trip Itinerary & Details</h3>
            
            {booking.description && (
              <div className="mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3">Overview</h4>
                <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                  {booking.description}
                </p>
              </div>
            )}

            {hasItinerary && (
              <div className="space-y-6">
                {itineraryChunks[0].map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4 items-start">
                    {item.day && (
                      <div className="shrink-0 bg-primary/10 text-primary w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border border-primary/20">
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
        </div>
      )}

      {/* ADDITIONAL ITINERARY PAGES (IF OVER 6 DAYS) */}
      {hasItinerary && itineraryChunks.slice(1).map((chunk, pageIdx) => (
        <div key={`itinerary-${pageIdx}`} className="pdf-page bg-white relative w-[794px] min-h-[1123px] h-max p-[20mm] shrink-0 overflow-hidden shadow-lg">
          <BackgroundElements />
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="text-2xl font-heading font-black text-primary uppercase tracking-widest mb-6 border-b-4 border-primary/20 pb-4">Trip Itinerary (Cont.)</h3>
            <div className="space-y-6 mt-4">
              {chunk.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-start">
                  {item.day && (
                    <div className="shrink-0 bg-primary/10 text-primary w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border border-primary/20">
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
          </div>
        </div>
      ))}

      {/* TERMS & INCLUSIONS PAGES */}
      {(hasInclusions || termsPage1.length > 0) && (
        <div className="pdf-page bg-white relative w-[794px] min-h-[1123px] h-max p-[20mm] shrink-0 overflow-hidden shadow-lg">
          <BackgroundElements />
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="text-2xl font-heading font-black text-slate-800 uppercase tracking-widest mb-8 border-b-4 border-primary/20 pb-4">Terms & Inclusions</h3>
          
            <div className="flex-1">
              {hasInclusions && (
                <div className="grid grid-cols-2 gap-8 mb-10">
                  {booking.inclusions.some((i: any) => String(i.included) === "true") && (
                    <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
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
                    <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
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

              {termsPage1.length > 0 && (
                <div className="text-slate-600 leading-relaxed text-xs space-y-2.5 mt-4">
                  <h4 className="font-black text-slate-800 uppercase tracking-wider mb-4 text-sm border-l-4 border-primary pl-3">Specific Terms & Conditions</h4>
                  {termsPage1.map((term: string, idx: number) => (
                    <p key={idx} className="flex gap-2">
                      <span className="text-slate-400 shrink-0">{idx + 1}.</span> 
                      <span>{term}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADDITIONAL TERMS PAGES */}
      {termsChunks.map((pageTerms, pageIdx) => (
        <div key={`terms-${pageIdx}`} className="pdf-page bg-white relative w-[794px] min-h-[1123px] h-max p-[20mm] shrink-0 overflow-hidden shadow-lg">
          <BackgroundElements />
          <div className="relative z-10 flex flex-col h-full">
            <h4 className="font-black text-slate-800 uppercase tracking-wider mb-8 text-sm border-l-4 border-primary pl-3">Terms & Conditions (Cont.)</h4>
            <div className="flex-1 text-xs text-slate-600 leading-relaxed space-y-2.5">
              {pageTerms.map((term: string, idx: number) => (
                <p key={idx} className="flex gap-2">
                  <span className="text-slate-400 shrink-0">{termsPage1.length + (pageIdx * 30) + idx + 1}.</span> 
                  <span>{term}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

