import Link from "next/link";
import { LayoutDashboard, Package, CalendarDays, MapPin, Car, Users, Settings, LogOut, MessageSquare } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarDays },
  { label: "Packages", href: "/admin/packages", icon: Package },
  { label: "Destinations", href: "/admin/destinations", icon: MapPin },
  { label: "Vehicles", href: "/admin/vehicles", icon: Car },
  { label: "Customers", href: "/admin/users", icon: Users },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-border hidden lg:flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-border">
          <Logo />
        </div>
        
        <nav className="flex-1 py-6 px-4 flex flex-col gap-2">
          {SIDEBAR_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link 
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all font-medium"
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-destructive hover:bg-destructive/10 transition-all font-medium">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-background border-b border-border flex items-center justify-between px-8 lg:px-12">
          <h2 className="text-xl font-heading font-bold text-foreground">Admin Portal</h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
