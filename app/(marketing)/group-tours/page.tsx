import Image from "next/image";
import Link from "next/link";
import { Star, Clock, MapPin, Users, ArrowRight, Sparkles } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";
import { DEFAULT_GROUP_TOURS } from "@/app/api/group-tours/route";
import { GroupTour } from "@/lib/firestore-utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GroupToursCatalogPage() {
  let tours: GroupTour[] = [];

  try {
    if (adminDb) {
      const snapshot = await adminDb.collection("group_tours").get();
      if (!snapshot.empty) {
        tours = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as GroupTour[];
      }
    }
  } catch (error) {
    console.error("Error fetching group tours:", error);
  }

  if (tours.length === 0) {
    tours = DEFAULT_GROUP_TOURS.map((t, idx) => ({ id: `default-${idx}`, ...t })) as GroupTour[];
  }

  return (
    <div className="bg-background min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider mb-4">
            <Users className="w-3.5 h-3.5" /> Shared Departures
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6">
            Curated <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Group Tours</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Experience the Himalayas with like-minded travelers. All group tours feature clear per-person pricing, verified stays, shared mountain coaches, and dedicated tour coordinators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <div
              key={tour.id}
              className="group bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1"
            >
              <div className="h-60 relative overflow-hidden">
                <Image
                  src={tour.image || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"}
                  alt={tour.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>{tour.destination}</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-semibold">
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{tour.duration || `${tour.days}D / ${tour.nights}N`}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{tour.rating || 5.0}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-bold font-heading text-foreground group-hover:text-primary transition-colors">
                    {tour.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                    {tour.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">Starting from</span>
                    <span className="text-2xl font-bold font-heading text-primary">
                      ₹{tour.price?.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-muted-foreground"> / person</span>
                  </div>

                  <Link
                    href={`/group-tour/${tour.slug || tour.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 transition-all hover:gap-3"
                  >
                    <span>View & Book</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
