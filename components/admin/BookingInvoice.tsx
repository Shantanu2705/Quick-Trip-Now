import React from 'react';
import { Logo } from '@/components/shared/Logo';
import { format } from 'date-fns';

interface BookingInvoiceProps {
  booking: any;
  id?: string;
}

export function BookingInvoice({ booking, id }: BookingInvoiceProps) {
  if (!booking) return null;

  // A4 dimensions at 96 DPI: 794px x 1123px
  return (
    <div 
      id={id}
      className="bg-white text-black p-16 relative flex flex-col justify-between"
      style={{
        width: '794px',
        minHeight: '1123px',
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: -50,
        fontFamily: 'Inter, sans-serif'
      }}
    >

      <div className="relative z-10 space-y-12 flex-1">
        {/* Header */}
        <div className="flex justify-between items-start border-b-4 border-primary/20 pb-8">
          <div>
            <Logo variant="bare" className="h-14 w-56 mb-4 origin-left" />
            <div className="text-slate-500 text-sm mt-4 leading-relaxed">
              <p className="font-bold text-slate-700">QuickTripNow Travel Services</p>
              <p>Bagdogra, Bhujiyapani, Darjeeling,</p>
              <p>West Bengal, India, Pin: 734017.</p>
              <p className="text-primary font-medium mt-1">quicktripnow1@gmail.com | +91 7047399677</p>
              <p className="text-xs mt-1">GSTIN: 22AAAAA0000A1Z5</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-5xl font-black text-primary tracking-tight uppercase">Invoice</h1>
            <h2 className="text-xl text-slate-500 font-bold tracking-widest mt-2 uppercase">Booking Receipt</h2>
            
            <div className="mt-8 space-y-2 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100 inline-block text-left ml-auto min-w-[250px]">
              <div className="flex justify-between items-center gap-6">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Invoice No:</span>
                <span className="font-mono font-bold text-slate-800">INV-{booking.id?.substring(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center gap-6">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Booking ID:</span>
                <span className="font-mono font-bold text-primary">{booking.id}</span>
              </div>
              <div className="flex justify-between items-center gap-6 pt-2 border-t border-slate-200 mt-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Date Issued:</span>
                <span className="font-bold text-slate-700">{format(new Date(), 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>

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

        {/* Trip Details */}
        <div>
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
                  {booking.vehicleName || booking.packageType || booking.packageName || "Custom Travel Package"}
                  {booking.vehicleName && <span className="block text-xs text-slate-500 mt-1 font-normal">Vehicle Booking (x{booking.vehicleQty || 1})</span>}
                </td>
                <td className="py-4 px-4 text-slate-600">{booking.date || booking.travelDate || "N/A"}</td>
                <td className="py-4 px-4 text-slate-600">{booking.travelers?.length || 1} Person(s)</td>
                <td className="py-4 px-4 text-right font-bold text-slate-800">₹{booking.amount?.toLocaleString("en-IN") || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary & Totals */}
        <div className="flex justify-end">
          <div className="w-1/2 bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-3">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Base Fare</span>
              <span>₹{((booking.amount || 0) - (booking.gstAmount || 0)).toLocaleString("en-IN")}</span>
            </div>
            {(booking.gstAmount || 0) > 0 ? (
              <>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>CGST ({(booking.gstPercentage || 0) / 2}%)</span>
                  <span>₹{((booking.gstAmount || 0) / 2).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>SGST ({(booking.gstPercentage || 0) / 2}%)</span>
                  <span>₹{((booking.gstAmount || 0) / 2).toLocaleString("en-IN")}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax / Fees</span>
                <span>₹0</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
              <span className="font-bold text-slate-800 uppercase tracking-wider">Total Amount</span>
              <span className="text-xl font-bold text-emerald-600">₹{booking.amount?.toLocaleString("en-IN") || 0}</span>
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
          <div className="mt-8 pt-8 border-t border-slate-200 text-xs">
            {booking.inclusions && booking.inclusions.length > 0 && (
              <div className="grid grid-cols-2 gap-8 mb-6">
                {booking.inclusions.some((i: any) => String(i.included) === "true") && (
                  <div>
                    <h4 className="font-bold text-emerald-700 uppercase tracking-wider mb-2">Inclusions</h4>
                    <ul className="list-disc pl-4 text-slate-600 space-y-1">
                      {booking.inclusions.filter((i: any) => String(i.included) === "true").map((item: any, idx: number) => {
                        if (item.text.includes('•')) {
                          return item.text.split('•').map((p: string) => p.trim()).filter(Boolean).map((p: string, i: number) => (
                            <li key={`${idx}-${i}`}>{p}</li>
                          ));
                        }
                        return <li key={idx}>{item.text}</li>;
                      })}
                    </ul>
                  </div>
                )}
                {booking.inclusions.some((i: any) => String(i.included) === "false") && (
                  <div>
                    <h4 className="font-bold text-red-700 uppercase tracking-wider mb-2">Exclusions</h4>
                    <ul className="list-disc pl-4 text-slate-600 space-y-1">
                      {booking.inclusions.filter((i: any) => String(i.included) === "false").map((item: any, idx: number) => {
                        if (item.text.includes('•')) {
                          return item.text.split('•').map((p: string) => p.trim()).filter(Boolean).map((p: string, i: number) => (
                            <li key={`${idx}-${i}`}>{p}</li>
                          ));
                        }
                        return <li key={idx}>{item.text}</li>;
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {booking.terms && (
              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-2">Specific Terms & Conditions</h4>
                <div className="text-slate-600 whitespace-pre-wrap">{booking.terms}</div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer / Signature Block */}
      <div className="relative z-10 pt-16 border-t-2 border-slate-200 flex justify-between items-end mt-12">
        <div className="text-xs text-slate-500 space-y-1 w-1/2">
          <p className="font-bold text-slate-700">Terms & Conditions:</p>
          <p>1. Please retain this invoice for your records.</p>
          <p>2. Subject to standard cancellation policies.</p>
          <p>3. This is a computer generated invoice and does not require a physical signature.</p>
        </div>
        <div className="text-center w-64 space-y-4">
          <div className="h-16 border-b border-slate-400 flex items-center justify-center relative">
            {/* Optional Stamp Graphic could go here */}
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
  );
}
