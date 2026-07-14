import { Users, TrendingUp, CalendarDays, IndianRupee, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminDb } from "@/lib/firebase-admin";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  let pendingCount = 0;
  let totalCustomers = 0;
  let activeBookings = 0;
  let totalRevenue = 0;
  let recentBookings: any[] = [];

  try {
    if (adminDb) {
      const [pendingSnap, usersSnap, bookingsSnap] = await Promise.all([
        adminDb.collection("users").where("status", "==", "pending").get(),
        adminDb.collection("users").where("role", "==", "user").get(),
        adminDb.collection("bookings").where("status", "==", "confirmed").get()
      ]);
      
      pendingCount = pendingSnap.size;
      totalCustomers = usersSnap.size;
      activeBookings = bookingsSnap.size;
      
      bookingsSnap.docs.forEach((doc: any) => {
        const data = doc.data();
        if (data.amount) {
          totalRevenue += Number(data.amount);
        }
      });
      
      recentBookings = bookingsSnap.docs
        .map((doc: any) => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">₹{totalRevenue.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="w-3 h-3 mr-1" /> Dynamic Data
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
            <div className="w-8 h-8 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">{activeBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active and confirmed
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
              Registered Accounts
            </p>
          </CardContent>
        </Card>

        <Link href="/admin/users" className="block group">
          <Card className={`rounded-2xl shadow-sm h-full transition-all duration-300 ${pendingCount > 0 ? 'bg-amber-500/10 border-amber-500/30 group-hover:bg-amber-500/20' : 'border-border/50 group-hover:bg-muted/30'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium ${pendingCount > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'}`}>Pending Approvals</CardTitle>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${pendingCount > 0 ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                <ShieldAlert className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold font-heading ${pendingCount > 0 ? 'text-amber-700 dark:text-amber-400' : ''}`}>{pendingCount}</div>
              <p className={`text-xs mt-1 font-medium ${pendingCount > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-muted-foreground'}`}>
                {pendingCount > 0 ? "Agents awaiting verification" : "All caught up!"}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-border/50 shadow-sm h-full">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentBookings.length > 0 ? recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{booking.itemTitle || "Booking"}</p>
                      <p className="text-sm text-muted-foreground">Booked by {booking.customerName || "Customer"}</p>
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
