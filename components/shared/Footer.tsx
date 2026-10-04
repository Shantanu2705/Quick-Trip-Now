import Link from "next/link";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";

const FOOTER_LINKS = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "How to Use", href: "/how-to-use" },
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

export function Footer({ phone = "+91 7047399677", email = "quicktripnow1@gmail.com" }: FooterProps) {
  return (
    <footer className="bg-secondary text-secondary-foreground pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          {/* Brand & Managed By */}
          <div className="lg:col-span-2 flex flex-col gap-10">
            {/* Powered & Managed by */}
            <div className="flex flex-col gap-4">
              <h4 className="font-heading font-medium text-2xl tracking-wide text-secondary-foreground">Powered & Managed by</h4>
              <a 
                href="https://www.swastiktripline.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-fit bg-white p-2 rounded-sm hover:opacity-90 transition-opacity"
              >
                <img 
                  src="/images/swastik-logo.png" 
                  alt="Swastik Tripline" 
                  className="h-16 md:h-20 w-auto object-contain" 
                />
              </a>
            </div>

            {/* About Us */}
            <div className="flex flex-col gap-4">
              <h4 className="font-heading font-medium text-2xl tracking-wide text-secondary-foreground">About Us</h4>
              <p className="text-secondary-foreground/90 text-lg leading-relaxed max-w-sm">
                We aim at providing the best travel experience to our customers.
              </p>
              <div className="bg-white p-3 rounded-sm w-fit mt-2">
                <img 
                  src="/images/msme-logo.png" 
                  alt="MSME UDYAM-WB-06-0019827" 
                  className="h-20 md:h-24 w-auto object-contain"
                />
              </div>
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
                <span className="leading-relaxed">Bagdogra, Bhujiyapani, Darjeeling,<br/>West Bengal, India, Pin: 734017</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="h-px bg-secondary-foreground/20 w-full mb-8" />

        {/* Digital Dictionary Agency Banner */}
        <div className="w-full pb-10 mt-6 relative">
          <a 
            href="https://www.digitaldictionarysiliguri.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group block w-full max-w-5xl mx-auto bg-[#111] p-3 md:p-5 shadow-2xl hover:scale-[1.01] transition-transform duration-300"
          >
            {/* Teal Torn Paper Background */}
            <div className="w-full bg-secondary relative">
              {/* Top Teal Torn Edge */}
              <svg viewBox="0 0 100 5" preserveAspectRatio="none" className="w-full h-3 md:h-5 text-secondary fill-current absolute -top-3 md:-top-5 left-0">
                <path d="M0,5 L0,1 L2,4 L5,2 L8,5 L11,1 L15,4 L18,2 L22,5 L26,1 L30,5 L33,2 L36,5 L40,1 L43,4 L47,2 L50,5 L53,2 L57,5 L61,1 L65,5 L68,3 L72,6 L76,2 L80,5 L84,1 L88,5 L91,2 L95,5 L98,3 L100,5 Z" />
              </svg>

              {/* Bottom Teal Torn Edge */}
              <svg viewBox="0 0 100 5" preserveAspectRatio="none" className="w-full h-3 md:h-5 text-secondary fill-current absolute -bottom-3 md:-bottom-5 left-0">
                <path d="M0,0 L0,4 L2,1 L5,3 L8,0 L11,4 L15,1 L18,3 L22,0 L26,4 L30,0 L33,3 L36,0 L40,4 L43,1 L47,3 L50,0 L53,3 L57,0 L61,4 L65,0 L68,2 L72,-1 L76,3 L80,0 L84,4 L88,0 L91,3 L95,0 L98,2 L100,0 Z" />
              </svg>

              {/* White Torn Paper Foreground */}
              <div className="bg-slate-50 relative mx-1 md:mx-3 my-2 md:my-4 px-6 md:px-10 py-8 md:py-12">
                {/* Top White Torn Edge */}
                <svg viewBox="0 0 100 5" preserveAspectRatio="none" className="w-full h-2 md:h-4 text-slate-50 fill-current absolute -top-2 md:-top-4 left-0 drop-shadow-sm">
                  <path d="M0,5 L0,2 L3,4 L6,1 L9,5 L12,2 L16,4 L19,1 L23,5 L27,2 L31,5 L34,2 L37,4 L41,1 L44,4 L48,2 L51,5 L54,2 L58,5 L62,1 L66,5 L69,3 L73,6 L77,2 L81,5 L85,1 L89,5 L92,2 L96,5 L99,3 L100,5 Z" />
                </svg>

                {/* Bottom White Torn Edge */}
                <svg viewBox="0 0 100 5" preserveAspectRatio="none" className="w-full h-2 md:h-4 text-slate-50 fill-current absolute -bottom-2 md:-bottom-4 left-0 drop-shadow-sm">
                  <path d="M0,0 L0,3 L3,1 L6,4 L9,0 L12,3 L16,1 L19,4 L23,0 L27,3 L31,0 L34,3 L37,1 L41,4 L44,1 L48,3 L51,0 L54,3 L58,0 L62,4 L66,0 L69,2 L73,-1 L77,3 L81,0 L85,4 L89,0 L92,3 L96,0 L99,2 L100,0 Z" />
                </svg>

                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                  {/* Left Content */}
                  <div className="flex-1 w-full">
                    <h3 className="text-secondary font-black text-2xl md:text-3xl lg:text-4xl mb-6 uppercase tracking-tight drop-shadow-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
                      Comprehensive Agency Solutions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-slate-800 font-bold text-base md:text-lg lg:text-xl mb-6">
                      <div className="flex items-center gap-2"><span className="text-secondary text-2xl leading-none">•</span> Website Development</div>
                      <div className="flex items-center gap-2"><span className="text-secondary text-2xl leading-none">•</span> Digital Marketing</div>
                      <div className="flex items-center gap-2"><span className="text-secondary text-2xl leading-none">•</span> Performance Marketing</div>
                      <div className="flex items-center gap-2"><span className="text-secondary text-2xl leading-none">•</span> Google Ads</div>
                      <div className="flex items-center gap-2"><span className="text-secondary text-2xl leading-none">•</span> Software Development</div>
                      <div className="flex items-center gap-2"><span className="text-secondary text-2xl leading-none">•</span> Mobile App</div>
                      <div className="flex items-center gap-2"><span className="text-secondary text-2xl leading-none">•</span> SEO</div>
                      <div className="flex items-center gap-2"><span className="text-secondary text-2xl leading-none">•</span> ORM</div>
                    </div>
                    <div className="text-slate-800 font-medium text-lg md:text-xl lg:text-2xl mt-4">
                      www.digitaldictionarysiliguri.com
                    </div>
                  </div>

                  {/* Right Logo */}
                  <div className="shrink-0 flex flex-col items-center justify-center">
                    <div className="relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full border-[8px] border-[#D4AF37] bg-white shadow-xl mb-2" style={{ boxShadow: 'inset 0 0 15px rgba(212,175,55,0.5), 0 10px 20px rgba(0,0,0,0.15)' }}>
                      <div className="absolute inset-0 rounded-full border-[2px] border-[#FFDF73] m-1"></div>
                      <div className="absolute inset-0 rounded-full border-[1px] border-[#AA7C11] m-2"></div>
                      <span className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#FFDF73] via-[#D4AF37] to-[#AA7C11] drop-shadow-md" style={{ fontFamily: "Georgia, serif" }}>D</span>
                    </div>
                    <div className="text-center mt-2">
                      <span className="block text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFDF73] via-[#D4AF37] to-[#AA7C11]" style={{ fontFamily: "Georgia, serif" }}>Digital Dictionary</span>
                      <span className="block text-base md:text-lg font-black tracking-[0.25em] text-[#AA7C11] mt-0.5 uppercase drop-shadow-sm">Siliguri</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-secondary-foreground/60 text-sm">
            © {new Date().getFullYear()} Quick Trip Now. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <a href="https://www.facebook.com/share/1X96Y4ikM4/" target="_blank" rel="noopener noreferrer" className="bg-secondary-foreground/10 hover:bg-accent hover:text-accent-foreground text-secondary-foreground p-2.5 rounded-full transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.instagram.com/quick.trip.now/" target="_blank" rel="noopener noreferrer" className="bg-secondary-foreground/10 hover:bg-accent hover:text-accent-foreground text-secondary-foreground p-2.5 rounded-full transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://youtu.be/TnPcV8JIQ4s?si=IlC3r8q1Rvw3LSYf" target="_blank" rel="noopener noreferrer" className="bg-secondary-foreground/10 hover:bg-accent hover:text-accent-foreground text-secondary-foreground p-2.5 rounded-full transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
