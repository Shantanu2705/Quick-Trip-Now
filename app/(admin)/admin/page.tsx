import { Users, TrendingUp, CalendarDays, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
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
            <div className="text-2xl font-bold font-heading">₹4,52,310</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="w-3 h-3 mr-1" /> +20.1% from last month
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
            <div className="text-2xl font-bold font-heading">+350</div>
            <p className="text-xs text-muted-foreground mt-1">
              42 arriving this week
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
            <div className="text-2xl font-bold font-heading">1,204</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="w-3 h-3 mr-1" /> +15.5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-border/50 shadow-sm h-full">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">North Sikkim 3 Days Package</p>
                      <p className="text-sm text-muted-foreground">Booked by Rahul Sharma</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹12,000</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Confirmed
                      </span>
                    </div>
                  </div>
                ))}
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
              <button className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all text-sm">
                Add New Package
              </button>
              <button className="w-full bg-secondary text-secondary-foreground py-3 rounded-xl font-medium border border-border hover:bg-secondary/80 transition-all text-sm">
                Generate Report
              </button>
              <button className="w-full bg-secondary text-secondary-foreground py-3 rounded-xl font-medium border border-border hover:bg-secondary/80 transition-all text-sm">
                Manage Fleet
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
