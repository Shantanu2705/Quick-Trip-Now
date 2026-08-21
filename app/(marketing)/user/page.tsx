"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, CreditCard, ChevronRight, CheckCircle2, Navigation, Package, User, Ticket, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { format } from "date-fns";

export default function UserDashboard() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [popupCoupon, setPopupCoupon] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth");
      return;
    }

    const fetchBookings = async () => {
      try {
        const q = query(
          collection(db, "bookings"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedBookings = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by createdAt descending
        fetchedBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setBookings(fetchedBookings);

        const cQ = query(
          collection(db, "coupons"),
          where("targetUserId", "==", user.uid)
        );
        const cSnap = await getDocs(cQ);
        const fetchedCoupons = cSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const eligibleCoupon = fetchedCoupons.find(c => 
          c.isActive && 
          fetchedBookings.length >= (c.minBookingsRequired || 2) && 
          !(userData?.usedCoupons || []).includes(c.code)
        );
        
        if (eligibleCoupon) setPopupCoupon(eligibleCoupon);

      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-muted/20 pt-32 pb-24 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-muted/20 min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
            My Bookings
          </h1>
          <p className="text-lg text-muted-foreground flex items-center gap-2">
            <User className="w-5 h-5" />
            Welcome back, {userData?.fullName || user?.email}
          </p>
        </div>

        {bookings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background rounded-3xl p-12 text-center border border-border shadow-sm flex flex-col items-center justify-center"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold font-heading mb-3">No Bookings Yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              You haven't made any bookings yet. Start exploring our beautiful destinations and packages!
            </p>
            <button 
              onClick={() => router.push("/packages")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-primary/30"
            >
              Explore Packages
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking, idx) => {
              const isVehicle = booking.type === 'vehicle';
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-background rounded-3xl p-6 md:p-8 border border-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {booking.status || 'Confirmed'}
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        {isVehicle ? (
                          <Navigation className="w-5 h-5 text-primary" />
                        ) : (
                          <Package className="w-5 h-5 text-primary" />
                        )}
                        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          {isVehicle ? 'Cab Transfer' : 'Tour Package'}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold font-heading">
                        {isVehicle ? `${booking.pickup} to ${booking.dropoff}` : booking.packageType}
                      </h3>
                      
                      <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium text-foreground">
                            {booking.date ? format(new Date(booking.date), "PPP") : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span className="font-medium text-foreground">
                            {booking.adultsCount || 1} Adult{booking.adultsCount !== 1 ? 's' : ''}
                            {booking.childrenCount > 0 && `, ${booking.childrenCount} Child`}
                            {booking.infantsCount > 0 && `, ${booking.infantsCount} Infant`}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border/50 mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Booking ID</p>
                          <p className="font-mono text-sm">{booking.id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Booked On</p>
                          <p className="text-sm">{format(new Date(booking.createdAt), "PPP")}</p>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-64 bg-muted/30 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                      <CreditCard className="w-6 h-6 text-primary mb-3" />
                      <p className="text-sm text-muted-foreground font-medium mb-1">Total Paid</p>
                      <p className="text-3xl font-bold font-heading text-foreground mb-4">
                        ₹{booking.amount?.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {popupCoupon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-background rounded-3xl p-8 max-w-md w-full border border-border shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setPopupCoupon(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
              
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Ticket className="w-10 h-10 text-primary" />
              </div>
              
              <h2 className="text-3xl font-bold font-heading mb-3 text-center text-primary">Congratulations!</h2>
              <p className="text-muted-foreground mb-6 text-center">
                You've unlocked a special reward for completing {popupCoupon.minBookingsRequired} bookings with us!
              </p>
              
              <div className="bg-muted p-4 rounded-xl text-center mb-6 border border-border border-dashed">
                <p className="text-sm font-semibold uppercase tracking-wider mb-2">Your Coupon Code</p>
                <p className="text-3xl font-mono font-bold text-foreground">{popupCoupon.code}</p>
                <p className="text-emerald-600 font-bold mt-2">{popupCoupon.discountPercentage}% OFF your next booking</p>
              </div>
              
              <button 
                onClick={() => setPopupCoupon(null)} 
                className="w-full bg-primary text-primary-foreground font-semibold rounded-xl py-4 text-lg hover:bg-primary/90 transition-colors"
              >
                Awesome, thanks!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
