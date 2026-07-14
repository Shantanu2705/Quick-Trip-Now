"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User as UserIcon, Headset, ShieldCheck, LogOut, LayoutDashboard } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Destinations", href: "/destinations" },
  { label: "About Us", href: "/about" },
  { label: "Cancel Trip", href: "/cancel" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, userData, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomePage = pathname === "/";
  const isSolid = !isHomePage || isScrolled;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isSolid
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          <Logo className={isSolid ? "text-foreground" : "text-white"} />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <nav className="flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "text-sm font-semibold tracking-wide transition-colors hover:text-primary",
                    isSolid ? "text-foreground/90" : "text-white"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Actions - Support & Auth */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Headset 
                strokeWidth={1.5}
                className={cn("w-9 h-9", isSolid ? "text-foreground" : "text-white")} 
              />
              <div className={cn("flex flex-col", isSolid ? "text-foreground" : "text-white")}>
                <span className="font-bold text-sm leading-tight tracking-wide">24x7 Support</span>
                <span className="text-xs opacity-90 leading-tight">We're here to help!</span>
              </div>
            </div>
            
            {user ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border/50">
                <div className="flex flex-col text-right">
                  <span className={cn("text-xs font-semibold uppercase tracking-wider opacity-70", isSolid ? "text-foreground" : "text-white")}>
                    {userData?.role || 'Welcome'}
                  </span>
                  <span className={cn("text-sm font-bold", isSolid ? "text-foreground" : "text-white")}>
                    {userData?.fullName || user.email}
                  </span>
                </div>
                {userData?.role === 'admin' && (
                  <Link href="/admin" className="p-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-full transition-colors" title="Dashboard">
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                )}
                <button onClick={signOut} className="p-2.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-full transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/agent-auth"
                  className="bg-transparent border border-primary text-primary hover:bg-primary/10 px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-colors shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Agent Login
                </Link>
                <Link
                  href="/auth"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-colors shadow-md"
                >
                  <UserIcon className="w-4 h-4" />
                  Sign in / Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={cn(
              "lg:hidden p-2 -mr-2 transition-colors",
              isSolid ? "text-foreground" : "text-white"
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-background border-b shadow-xl lg:hidden max-h-[calc(100vh-80px)] overflow-y-auto"
          >
            <div className="flex flex-col p-4 gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground/80 hover:text-primary font-medium text-lg px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="h-px bg-border my-2" />
              
              <div className="flex items-center gap-4 px-4 pb-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <Headset className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-foreground">24x7 Support</span>
                  <span className="text-sm text-muted-foreground">We're here to help!</span>
                </div>
              </div>

              {user ? (
                <div className="flex flex-col gap-2 mt-2 px-4 pb-4">
                  <div className="bg-muted p-4 rounded-xl flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">{userData?.role || 'Welcome'}</span>
                      <span className="font-bold text-foreground">{userData?.fullName || user.email}</span>
                    </div>
                  </div>
                  {userData?.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-3 rounded-lg font-medium text-base flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                    className="bg-destructive/10 text-destructive hover:bg-destructive/20 px-4 py-3 rounded-lg font-medium text-base flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/agent-auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="bg-transparent border border-primary text-primary hover:bg-primary/10 px-4 py-3 rounded-lg font-medium text-base flex items-center justify-center gap-2 mt-2"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    Agent Login
                  </Link>
                  <Link
                    href="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-lg font-medium text-base flex items-center justify-center gap-2 mt-2"
                  >
                    <UserIcon className="w-5 h-5" />
                    Sign in / Sign up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
