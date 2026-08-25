"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDays, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LogoutButton } from "@/components/shared/LogoutButton";
import { Logo } from "@/components/shared/Logo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const LINKS = [
    { label: "My Bookings", href: "/dashboard/bookings", icon: CalendarDays },
    { label: "My Profile", href: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="flex min-h-screen bg-muted/20 pt-20">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-border hidden md:flex flex-col fixed h-[calc(100vh-80px)]">
        <div className="p-6">
          <h2 className="text-xl font-heading font-bold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground capitalize">Welcome, {userData?.fullName || 'User'}</p>
        </div>
        
        <nav className="flex-1 py-4 px-4 flex flex-col gap-2">
          {LINKS.map((link) => {
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
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-[calc(100vh-80px)] md:ml-64 p-6 lg:p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
