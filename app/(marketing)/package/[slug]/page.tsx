import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Users, Star, Check, X, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dummy data for scaffolding
const PACKAGE_DATA = {
  title: "North Sikkim 3 Days 2 Nights",
  description: "Experience the mesmerizing beauty of North Sikkim. This curated journey takes you through the stunning valleys of Lachung and Yumthang, offering breathtaking views of snow-capped peaks and pristine landscapes. A perfect blend of adventure and tranquility designed for those who seek the extraordinary.",
  pricePerAdult: 4000,
  pricePerChild: 2000,
  days: 3,
  nights: 2,
  rating: 4.8,
  reviews: 124,
  destination: "North Sikkim",
  images: [
    "https://images.unsplash.com/photo-1626079973809-541dd441b83d?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1579730537243-d85f818ecad2?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1616421041180-2a7924dcc65b?q=80&w=1200&auto=format&fit=crop"
  ],
  highlights: [
    "Visit the famous Yumthang Valley (Valley of Flowers)",
    "Experience the snow at Zero Point (optional)",
    "Enjoy local Sikkimese hospitality at Lachung",
    "Scenic drive through Seven Sisters Waterfall"
  ],
  itinerary: [
    { day: 1, title: "Gangtok to Lachung", desc: "Start from Gangtok in the morning. En route visit Naga Waterfall, Confluence of Lachen Chu and Lachung Chu at Chungthang. Overnight stay at Lachung." },
    { day: 2, title: "Lachung to Yumthang Valley", desc: "Early morning drive to Yumthang Valley, known as the Valley of Flowers. Optional tour to Zero Point. Return to Lachung for lunch and then drive back to Gangtok." },
    { day: 3, title: "Departure", desc: "After breakfast, transfer to Bagdogra Airport / NJP Railway Station for your onward journey." }
  ],
  inclusions: [
    { text: "Accommodation in premium hotels", included: true },
    { text: "Breakfast and Dinner", included: true },
    { text: "Exclusive vehicle for transfers & sightseeing", included: true },
    { text: "All permit fees and taxes", included: true },
    { text: "Lunch and personal expenses", included: false },
    { text: "Zero Point Entry Fee", included: false }
  ]
};

export default async function PackageDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return (
    <div className="bg-background min-h-screen pt-20">
      {/* Editorial Gallery Header */}
      <div className="w-full h-[60vh] md:h-[70vh] flex gap-2 p-2">
        <div className="relative w-2/3 h-full rounded-2xl overflow-hidden group">
          <Image src={PACKAGE_DATA.images[0]} alt="Main" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
        </div>
        <div className="w-1/3 flex flex-col gap-2 h-full">
          <div className="relative w-full h-1/2 rounded-2xl overflow-hidden group">
            <Image src={PACKAGE_DATA.images[1]} alt="Secondary 1" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="relative w-full h-1/2 rounded-2xl overflow-hidden group">
            <Image src={PACKAGE_DATA.images[2]} alt="Secondary 2" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors">
              <span className="text-white font-medium">View All Photos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 flex flex-col lg:flex-row gap-12 relative">
        {/* Main Content */}
        <div className="w-full lg:w-2/3">
          <div className="flex items-center gap-2 text-primary font-medium mb-4 uppercase tracking-wider text-sm">
            <MapPin className="w-4 h-4" />
            {PACKAGE_DATA.destination}
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">{PACKAGE_DATA.title}</h1>
          
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{PACKAGE_DATA.days} Days / {PACKAGE_DATA.nights} Nights</span>
            </div>
            <div className="flex items-center gap-2 text-amber-500">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-medium text-foreground">{PACKAGE_DATA.rating}</span>
              <span>({PACKAGE_DATA.reviews} reviews)</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-foreground/80 leading-relaxed text-lg">{PACKAGE_DATA.description}</p>
          </div>

          {/* Highlights */}
          <div className="mb-12">
            <h3 className="text-2xl font-heading font-bold mb-6">Highlights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PACKAGE_DATA.highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="bg-primary/10 p-1.5 rounded-full mt-1">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground/80 font-medium">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Itinerary */}
          <div className="mb-12">
            <h3 className="text-2xl font-heading font-bold mb-6">Itinerary</h3>
            <div className="flex flex-col gap-8 border-l border-border/50 ml-4 pl-8 relative">
              {PACKAGE_DATA.itinerary.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[45px] top-0 bg-background border-2 border-primary w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
                    {item.day}
                  </div>
                  <h4 className="text-xl font-heading font-bold mb-2">{item.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Inclusions & Exclusions */}
          <div className="mb-12">
            <h3 className="text-2xl font-heading font-bold mb-6">What's Included</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-8 rounded-3xl">
              {PACKAGE_DATA.inclusions.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  {item.included ? (
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <X className="w-5 h-5 text-destructive shrink-0" />
                  )}
                  <span className={item.included ? "text-foreground/80" : "text-muted-foreground line-through"}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Booking Sidebar */}
        <div className="w-full lg:w-1/3 relative">
          <div className="sticky top-32 bg-background border border-border shadow-xl rounded-3xl p-6 lg:p-8">
            <div className="mb-6">
              <span className="text-muted-foreground text-sm uppercase tracking-wider font-semibold">Starting From</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-heading font-bold text-primary">₹{PACKAGE_DATA.pricePerAdult}</span>
                <span className="text-muted-foreground">/ adult</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-muted/30 rounded-xl p-4 border border-border/50 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-semibold uppercase">Dates</span>
                    <span className="font-medium text-sm">Select travel dates</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-xl p-4 border border-border/50 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-semibold uppercase">Travelers</span>
                    <span className="font-medium text-sm">2 Adults</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-medium mb-6">
              <span className="text-muted-foreground">Total</span>
              <span className="text-xl font-bold">₹{PACKAGE_DATA.pricePerAdult * 2}</span>
            </div>

            <Link href={`/book?package=${slug}`}>
              <Button className="w-full py-6 mt-6 text-lg rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Book Now
              </Button>
            </Link>
            
            <p className="text-center text-xs text-muted-foreground mt-4">
              You won't be charged yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
