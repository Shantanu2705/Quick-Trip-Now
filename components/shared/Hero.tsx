"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BookingSearchCard } from "./BookingSearchCard";

export function Hero({ globalMaxChildAge = 12 }: { globalMaxChildAge?: number }) {
  return (
    <section className="relative w-full h-[100svh] min-h-[700px] flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero_bg.png"
          alt="Majestic Himalayan Landscape"
          fill sizes="100vw"
          priority
          className="object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-background" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-8 h-full flex flex-col items-center justify-center">
        {/* Hero Text */}
        <div className="text-center mb-12 max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-tight mb-6"
          >
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Majestic</span> Sikkim
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-white/90 font-medium max-w-2xl mx-auto"
          >
            Experience the world&apos;s most breathtaking landscapes with curated luxury travel packages and premium services.
          </motion.p>
        </div>

        {/* Floating Booking Card */}
        <BookingSearchCard globalMaxChildAge={globalMaxChildAge} />
      </div>
    </section>
  );
}
