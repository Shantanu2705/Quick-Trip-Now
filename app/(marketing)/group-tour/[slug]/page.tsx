import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, Users, Star, Check, X, ShieldCheck, ArrowLeft } from "lucide-react";
import { GroupTourBookingClient } from "@/components/shared/GroupTourBookingClient";
import { getGlobalSettings } from "@/lib/settings-server";
import { adminDb } from "@/lib/firebase-admin";
import { GroupTour } from "@/lib/firestore-utils";
import { DEFAULT_GROUP_TOURS } from "@/app/api/group-tours/route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GroupTourDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let tourData: GroupTour | null = null;

  try {
    if (adminDb) {
      // 1. Try slug match
      const slugSnapshot = await adminDb.collection("group_tours").where("slug", "==", slug).limit(1).get();
      if (!slugSnapshot.empty) {
        tourData = { id: slugSnapshot.docs[0].id, ...slugSnapshot.docs[0].data() } as GroupTour;
      } else {
        // 2. Try doc ID match
        const docSnapshot = await adminDb.collection("group_tours").doc(slug).get();
        if (docSnapshot.exists) {
          tourData = { id: docSnapshot.id, ...docSnapshot.data() } as GroupTour;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching group tour from Firestore:", error);
  }

  // Fallback to default group tours if not found in db
  if (!tourData) {
    const defaultMatch = DEFAULT_GROUP_TOURS.find(
      t => t.slug === slug || t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug
    );
    if (defaultMatch) {
      tourData = { id: defaultMatch.slug, ...defaultMatch } as GroupTour;
    }
  }

  if (!tourData) {
    return notFound();
  }

  const {
    title,
    description,
    days,
    nights,
    rating,
    reviews,
    destination,
    image,
    highlights = [],
    itinerary = [],
    inclusions = [],
    termsAndConditions,
    terms
  } = tourData;

  const settings = await getGlobalSettings();
  const heroImage = image || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="bg-background min-h-screen pt-20">
      {/* Hero Header */}
      <div className="w-full h-[45vh] md:h-[55vh] relative overflow-hidden">
        <Image src={heroImage} alt={title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-black/60" />

        <div className="absolute top-6 left-6 z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full text-xs font-semibold border border-white/20 transition-all hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 backdrop-blur-md text-primary-foreground border border-primary/30 text-xs font-bold uppercase tracking-widest mb-3">
            <Users className="w-3.5 h-3.5" /> Curated Group Tour
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-white max-w-4xl drop-shadow-xl">
            {title}
          </h1>
        </div>
      </div>

      {/* Main Tour Booking Client */}
      <GroupTourBookingClient
        tour={tourData}
        globalMaxChildAge={settings?.globalMaxChildAge || 12}
        tourDetailsContent={
          <div className="space-y-10">
            {/* Badges / Meta Info */}
            <div className="flex flex-wrap items-center gap-4 border-b border-border pb-6">
              <div className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/10 px-3.5 py-1.5 rounded-full">
                <MapPin className="w-4 h-4" />
                {destination}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground font-semibold text-sm bg-muted px-3.5 py-1.5 rounded-full">
                <Clock className="w-4 h-4" />
                <span>{days || 0} Days / {nights || 0} Nights</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-500 font-semibold text-sm bg-amber-500/10 px-3.5 py-1.5 rounded-full">
                <Star className="w-4 h-4 fill-current" />
                <span>{rating || 5.0} ({reviews || 0} reviews)</span>
              </div>
            </div>

            {/* Overview */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-heading text-foreground">About This Group Tour</h2>
              <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-line">
                {description}
              </p>
            </div>

            {/* Highlights */}
            {highlights && highlights.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold font-heading text-foreground">Tour Highlights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 bg-muted/30 border border-border/80 rounded-2xl p-4">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day-by-Day Itinerary */}
            {itinerary && itinerary.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold font-heading text-foreground">Day-by-Day Itinerary</h2>
                <div className="space-y-4">
                  {itinerary.map((item: any, i: number) => (
                    <div key={i} className="bg-background border border-border rounded-2xl p-6 shadow-sm space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider">
                        Day {item.day || i + 1}
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inclusions & Exclusions */}
            {inclusions && inclusions.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold font-heading text-foreground">What&apos;s Included & Excluded</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inclusions.map((inc: any, i: number) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 rounded-2xl p-4 border ${
                        inc.included
                          ? "bg-emerald-500/5 border-emerald-500/20 text-foreground"
                          : "bg-red-500/5 border-red-500/20 text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          inc.included ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {inc.included ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-sm font-medium">{inc.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terms & Conditions */}
            {(termsAndConditions || terms) && (
              <div className="space-y-4 bg-muted/20 border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" /> Terms & Travel Guidelines
                </h2>
                <div className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                  {termsAndConditions || terms}
                </div>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
