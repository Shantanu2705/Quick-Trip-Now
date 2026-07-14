"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Clock, Users, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getPackages, Package } from "@/lib/firestore-utils";
import { getApplicablePrice } from "@/lib/price-utils";

export function FeaturedTours() {
  const { userData } = useAuth();
  const discountPercent = userData?.role === "agent" || userData?.role === "admin" 
    ? (userData.discountPercentage ?? 20) 
    : 0;
  const hasDiscount = discountPercent > 0;
  const discountMultiplier = hasDiscount ? (100 - discountPercent) / 100 : 1;
  const [tours, setTours] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTours() {
      try {
        const data = await getPackages();
        // Filter out only featured packages, then take top 3
        const featured = data.filter(pkg => pkg.isFeatured);
        setTours(featured.slice(0, 3));
      } catch (error) {
        console.error("Error fetching tours:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTours();
  }, []);

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
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : tours.length === 0 ? (
            <div className="col-span-full flex justify-center py-12 text-muted-foreground">
              No featured packages found. Please select up to 3 featured packages in the admin portal.
            </div>
          ) : (
            tours.map((tour, index) => {
              const currentPrice = getApplicablePrice(tour.seasonalPrices);
              return (
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
                      fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                        {hasDiscount ? (
                          <div className="flex flex-col">
                            <span className="text-sm line-through text-muted-foreground">₹{currentPrice}</span>
                            <span className="text-2xl font-bold text-primary font-heading">₹{Math.round(currentPrice * discountMultiplier)}</span>
                          </div>
                        ) : (
                          <span className="text-2xl font-bold text-primary font-heading">₹{currentPrice}</span>
                        )}
                      </div>
                      <Link href={`/package/${tour.slug}`}>
                        <Button className="rounded-xl font-medium px-6">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
