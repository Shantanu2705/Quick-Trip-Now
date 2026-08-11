"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Clock, Users, Star, Calendar as CalendarIcon, Plus, Minus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export function PackagesGrid({ tours, globalMaxChildAge = 12 }: { tours: any[], globalMaxChildAge?: number }) {
  const searchParams = useSearchParams();
  const initialDateParam = searchParams?.get("date");
  const initialAdultsParam = searchParams?.get("adults");
  const initialChildrenParam = searchParams?.get("children");
  const initialInfantsParam = searchParams?.get("infants");

  const [date, setDate] = useState<Date | undefined>(initialDateParam ? new Date(initialDateParam) : undefined);
  const [adults, setAdults] = useState<number>(initialAdultsParam ? parseInt(initialAdultsParam, 10) || 2 : 2);
  const [children, setChildren] = useState<number>(initialChildrenParam ? parseInt(initialChildrenParam, 10) || 0 : 0);
  const [infants, setInfants] = useState<number>(initialInfantsParam ? parseInt(initialInfantsParam, 10) || 0 : 0);
  
  const totalTravelers = adults + children + infants;

  return (
    <div className="w-full">
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tours.map((tour) => {
          return (
            <div
              key={tour.id}
              className="group bg-background rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-border/50 transition-all duration-300 flex flex-col"
            >
              <Link href={`/package/${tour.slug}`} className="relative h-64 overflow-hidden block">
                <Image
                  src={tour.image || "https://images.unsplash.com/photo-1626079973809-541dd441b83d?q=80&w=800&auto=format&fit=crop"}
                  alt={tour.title}
                  fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-primary">
                  {tour.category || "Tour"}
                </div>
              </Link>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold text-sm">{tour.rating || "5.0"}</span>
                    <span className="text-muted-foreground text-xs ml-1">({tour.reviews || 0})</span>
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
                    <span>{tour.duration || `${tour.days}D / ${tour.nights}N`}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>Shared/Private</span>
                  </div>
                </div>
                
                <div className="h-px w-full bg-border/50 mb-4" />
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-primary uppercase font-bold tracking-wider">Dynamic Pricing</span>
                    <span className="text-sm text-muted-foreground font-medium">Based on Vehicle</span>
                  </div>
                  <Link href={`/package/${tour.slug}`}>
                    <Button className="rounded-xl font-medium px-6">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        
        {tours.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No packages found. Check back later!
          </div>
        )}
      </div>
    </div>
  );
}
