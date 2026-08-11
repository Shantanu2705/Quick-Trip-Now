import { Users, TrendingUp, CalendarDays, IndianRupee, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminDb } from "@/lib/firebase-admin";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string }>;
}) {
  const { filter } = (await searchParams) || {};
  
  let totalBookings = 0;
  let onTripCount = 0;
  let futureCount = 0;
  let recentBookings: any[] = [];

  try {
    if (adminDb) {
      const [bookingsSnap, packagesSnap] = await Promise.all([
        adminDb.collection("bookings").where("status", "==", "confirmed").get(),
        adminDb.collection("packages").get()
      ]);
      
      const packagesData = packagesSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      const bookingsList = bookingsSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      
      totalBookings = bookingsList.length;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTime = today.getTime();
      
      bookingsList.forEach((b: any) => {
        if (!b.date) return;
        
        const startDate = new Date(b.date);
        startDate.setHours(0, 0, 0, 0);
        const startTime = startDate.getTime();
        
        let days = 1;
        if (b.type === 'tour') {
          const pkg = packagesData.find((p: any) => p.id === b.packageId);
          if (pkg && pkg.days) {
            days = pkg.days;
          }
        }
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + (days - 1));
        endDate.setHours(0, 0, 0, 0);
        const endTime = endDate.getTime();
        
        if (startTime <= todayTime && todayTime <= endTime) {
          onTripCount++;
        }
        
        if (startTime > todayTime) {
          futureCount++;
        }
      });
      
      let filteredBookings = bookingsList;
      if (filter === 'ontrip') {
        filteredBookings = bookingsList.filter((b: any) => {
          if (!b.date) return false;
          const startDate = new Date(b.date);
          startDate.setHours(0, 0, 0, 0);
          
          let days = 1;
          if (b.type === 'tour') {
            const pkg = packagesData.find((p: any) => p.id === b.packageId);
            if (pkg && pkg.days) days = pkg.days;
          }
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + (days - 1));
          endDate.setHours(0, 0, 0, 0);
          
          return startDate.getTime() <= todayTime && todayTime <= endDate.getTime();
        });
      } else if (filter === 'future') {
        filteredBookings = bookingsList.filter((b: any) => {
          if (!b.date) return false;
          const startDate = new Date(b.date);
          startDate.setHours(0, 0, 0, 0);
          return startDate.getTime() > todayTime;
        });
      }
      
      recentBookings = filteredBookings
        .sort((a: any, b: any) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 10);
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor your platform's performance and recent activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin?filter=ontrip" className="block group">
          <Card className={`rounded-2xl shadow-sm h-full transition-all duration-300 ${filter === 'ontrip' ? 'border-sky-500 ring-1 ring-sky-500 bg-sky-500/5' : 'border-border/50 group-hover:bg-muted/30'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">On Trip</CardTitle>
              <div className="w-8 h-8 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading">{onTripCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently ongoing trips</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin?filter=future" className="block group">
          <Card className={`rounded-2xl shadow-sm h-full transition-all duration-300 ${filter === 'future' ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-500/5' : 'border-border/50 group-hover:bg-muted/30'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Future Bookings</CardTitle>
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading">{futureCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Trips starting tomorrow or later</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin?filter=all" className="block group">
          <Card className={`rounded-2xl shadow-sm h-full transition-all duration-300 ${!filter || filter === 'all' ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-500/5' : 'border-border/50 group-hover:bg-muted/30'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Total Bookings</CardTitle>
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading">{totalBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">All confirmed bookings</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-border/50 shadow-sm h-full">
            <CardHeader>
              <CardTitle>
                {filter === 'ontrip' ? "On Trip Bookings" : filter === 'future' ? "Future Bookings" : "Recent Bookings"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentBookings.length > 0 ? recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{booking.itemTitle || "Booking"}</p>
                      <p className="text-sm text-muted-foreground">
                        Booked by {booking.customerName || "Customer"} 
                        {booking.date && ` • ${new Date(booking.date).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{(booking.amount || 0).toLocaleString("en-IN")}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {booking.status || "Confirmed"}
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-sm">No recent bookings found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="rounded-2xl border-border/50 shadow-sm h-full">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Link href="/admin/packages" className="w-full text-center block bg-primary text-primary-foreground py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all text-sm">
                Add New Package
              </Link>
              <Link href="/admin/bookings" className="w-full text-center block bg-secondary text-secondary-foreground py-3 rounded-xl font-medium border border-border hover:bg-secondary/80 transition-all text-sm">
                Generate Report
              </Link>
              <Link href="/admin/vehicles" className="w-full text-center block bg-secondary text-secondary-foreground py-3 rounded-xl font-medium border border-border hover:bg-secondary/80 transition-all text-sm">
                Manage Fleet
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
