import Link from "next/link";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";

const FOOTER_LINKS = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  services: [
    { label: "Packages", href: "/packages" },
    { label: "Shared Tours", href: "/shared-tours" },
    { label: "Private Tours", href: "/private-tours" },
    { label: "Taxi & Cabs", href: "/taxi" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cancellation Policy", href: "/cancellation" },
  ],
};

interface FooterProps {
  phone?: string;
  email?: string;
}

export function Footer({ phone = "+91 98765 43210", email = "support@quicktripnow.com" }: FooterProps) {
  return (
    <footer className="bg-secondary text-secondary-foreground pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Logo className="text-secondary-foreground [&>span>span]:text-accent" />
            <p className="text-secondary-foreground/80 leading-relaxed max-w-sm">
              Experience the breathtaking beauty of Sikkim and beyond. Curated luxury travel experiences designed exclusively for you.
            </p>
            
            <div className="mt-4">
              <h4 className="font-heading font-medium text-lg mb-4">Subscribe to our Newsletter</h4>
              <form className="flex gap-2 max-w-md">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-secondary-foreground/10 border border-secondary-foreground/20 rounded-lg px-4 py-3 flex-1 text-secondary-foreground placeholder:text-secondary-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  required
                />
                <button 
                  type="submit"
                  className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors flex items-center gap-2"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-medium text-lg mb-6">Company</h4>
            <ul className="flex flex-col gap-4">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-secondary-foreground/80 hover:text-accent transition-colors flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-accent" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-medium text-lg mb-6">Services</h4>
            <ul className="flex flex-col gap-4">
              {FOOTER_LINKS.services.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-secondary-foreground/80 hover:text-accent transition-colors flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-accent" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-medium text-lg mb-6">Contact Us</h4>
            <ul className="flex flex-col gap-4">
              <li>
                <a href={`tel:${phone}`} className="text-secondary-foreground/80 hover:text-accent transition-colors flex items-center gap-3">
                  <div className="bg-secondary-foreground/10 p-2 rounded-full"><Phone className="w-4 h-4" /></div>
                  {phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="text-secondary-foreground/80 hover:text-accent transition-colors flex items-center gap-3">
                  <div className="bg-secondary-foreground/10 p-2 rounded-full"><Mail className="w-4 h-4" /></div>
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-secondary-foreground/80 mt-2">
                <div className="bg-secondary-foreground/10 p-2 rounded-full shrink-0"><MapPin className="w-4 h-4" /></div>
                <span className="leading-relaxed">M.G Marg, Gangtok,<br/>Sikkim, 737101, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="h-px bg-secondary-foreground/20 w-full mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-secondary-foreground/60 text-sm">
            © {new Date().getFullYear()} Quick Trip Now. All rights reserved.
          </p>

          <p className="text-secondary-foreground/60 text-sm text-center">
            Designed by <a href="https://digitaldictionary.in/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors font-medium">Digital Dictionary</a>
          </p>
          
          <div className="flex items-center gap-4">
            <a href="#" className="bg-secondary-foreground/10 hover:bg-accent hover:text-accent-foreground text-secondary-foreground p-2.5 rounded-full transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="#" className="bg-secondary-foreground/10 hover:bg-accent hover:text-accent-foreground text-secondary-foreground p-2.5 rounded-full transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="#" className="bg-secondary-foreground/10 hover:bg-accent hover:text-accent-foreground text-secondary-foreground p-2.5 rounded-full transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
