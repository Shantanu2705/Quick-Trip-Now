"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Clock, Users, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOURS = [
  {
    id: 1,
    title: "North Sikkim 3 Days 2 Nights",
    slug: "north-sikkim-3-days",
    image: "/images/sikkim_tour_1.png",
    duration: "3 Days / 2 Nights",
    category: "Shared Tour",
    price: 4000,
    rating: 4.8,
    reviews: 124
  },
  {
    id: 2,
    title: "Lachung Luxury Camp Retreat",
    slug: "lachung-luxury-camp",
    image: "/images/sikkim_tour_2.png",
    duration: "2 Days / 1 Night",
    category: "Private Tour",
    price: 8500,
    rating: 4.9,
    reviews: 89
  },
  {
    id: 3,
    title: "Monastery & Culture Tour",
    slug: "monastery-culture-tour",
    image: "/images/sikkim_tour_3.png",
    duration: "1 Day",
    category: "Package",
    price: 2500,
    rating: 5.0,
    reviews: 45
  }
];

export function FeaturedTours() {
  return (
    <section className="py-24 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block"
            >
              Curated Experiences
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-heading font-bold text-foreground"
            >
              Featured Tours & Packages
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/packages" className="flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors group">
              View all packages
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TOURS.map((tour, index) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group bg-background rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-border/50 transition-all duration-300 flex flex-col"
            >
              <Link href={`/package/${tour.slug}`} className="relative h-64 overflow-hidden block">
                <Image
                  src={tour.image}
                  alt={tour.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-primary">
                  {tour.category}
                </div>
              </Link>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold text-sm">{tour.rating}</span>
                    <span className="text-muted-foreground text-xs ml-1">({tour.reviews})</span>
                  </div>
                </div>
                
                <Link href={`/package/${tour.slug}`}>
                  <h3 className="text-xl font-heading font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                    {tour.title}
                  </h3>
                </Link>
                
                <div className="flex items-center gap-4 text-muted-foreground text-sm mb-6 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>Shared/Private</span>
                  </div>
                </div>
                
                <div className="h-px w-full bg-border/50 mb-4" />
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Starting from</span>
                    <span className="text-2xl font-bold text-primary font-heading">₹{tour.price}</span>
                  </div>
                  <Link href={`/book?package=${tour.slug}`}>
                    <Button className="rounded-xl font-medium px-6">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
