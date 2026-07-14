import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, Users, Star, Check, X, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PackageBookingSidebar } from "@/components/shared/PackageBookingSidebar";
import { getGlobalSettings } from "@/lib/settings-server";
import { adminDb } from "@/lib/firebase-admin";
import { getApplicablePrice } from "@/lib/price-utils";
import { PackageVehicleDisplay } from "@/components/shared/PackageVehicleDisplay";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PackageDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let pkgData: any = null;
  
  try {
    const snapshot = await adminDb.collection("packages").where("slug", "==", slug).limit(1).get();
    if (!snapshot.empty) {
      pkgData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
  } catch (error) {
    console.error("Error fetching package:", error);
  }

  let vehiclesData: any[] = [];
  try {
    const vSnapshot = await adminDb.collection("vehicles").get();
    vehiclesData = vSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching vehicles:", error);
  }

  if (!pkgData) {
    return notFound();
  }

  const {
    title, description, days, nights, rating, reviews, destination, image,
    highlights = [], itinerary = [], inclusions = [], seasonalPrices = [], childPrice, maxChildAge
  } = pkgData;

  const settings = await getGlobalSettings();
  const globalMaxChildAge = settings?.globalMaxChildAge || 12;
  const applicableMaxChildAge = maxChildAge || globalMaxChildAge;

  const activePrice = getApplicablePrice(seasonalPrices);

  // Use a fallback image if missing
  const heroImage = image || "https://images.unsplash.com/photo-1626079973809-541dd441b83d?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="bg-background min-h-screen pt-20">
      {/* Hero Header */}
      <div className="w-full h-[50vh] md:h-[60vh] relative">
        <Image src={heroImage} alt={title} fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white text-center px-4 drop-shadow-lg">{title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 flex flex-col lg:flex-row gap-12 relative">
        {/* Main Content */}
        <div className="w-full lg:w-2/3">
          <div className="flex items-center gap-2 text-primary font-medium mb-4 uppercase tracking-wider text-sm">
            <MapPin className="w-4 h-4" />
            {destination || "Unknown Destination"}
          </div>
          
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{days || 0} Days / {nights || 0} Nights</span>
            </div>
            <div className="flex items-center gap-2 text-amber-500">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-medium text-foreground">{rating || "5.0"}</span>
              <span>({reviews || 0} reviews)</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-foreground/80 leading-relaxed text-lg">{description || "No description provided."}</p>
          </div>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-heading font-bold mb-6">Highlights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {highlights.map((highlight: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="bg-primary/10 p-1.5 rounded-full mt-1">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground/80 font-medium">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Itinerary */}
          {itinerary.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-heading font-bold mb-6">Itinerary</h3>
              <div className="flex flex-col gap-8 border-l border-border/50 ml-4 pl-8 relative">
                {itinerary.map((item: any, idx: number) => (
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
          )}

          {/* Vehicles Display */}
          {vehiclesData.length > 0 && (
            <PackageVehicleDisplay vehicles={vehiclesData} />
          )}

          {/* Inclusions & Exclusions */}
          {inclusions.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-heading font-bold mb-6">What's Included</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-8 rounded-3xl">
                {inclusions.map((item: any, idx: number) => (
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
          )}
        </div>

        {/* Sticky Booking Sidebar */}
        <div className="w-full lg:w-1/3 relative">
          <PackageBookingSidebar packageSlug={slug} seasonalPrices={seasonalPrices} childPrice={childPrice} maxChildAge={applicableMaxChildAge} />
        </div>
      </div>
    </div>
  );
}
