import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DestinationsPage() {
  let destinations: any[] = [];
  try {
    if (adminDb) {
      const snapshot = await adminDb.collection("destinations").get();
      destinations = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    }
  } catch (error) {
    console.error("Error fetching destinations:", error);
  }

  return (
    <div className="bg-background min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mb-16">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6">
            Discover Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Destinations</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            From the snow-capped peaks of North Sikkim to the vibrant streets of Gangtok, explore the most breathtaking locations carefully curated for your next adventure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest) => (
            <Link key={dest.id} href={`/destinations/${dest.slug}`} className="group block">
              <div className="relative h-[400px] rounded-3xl overflow-hidden mb-6 shadow-sm hover:shadow-xl transition-all duration-500">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold text-primary flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {dest.toursCount || 0} Tours
                </div>
                <div className="absolute bottom-0 left-0 p-6 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-2xl font-heading font-bold text-white mb-2">{dest.name}</h3>
                  <p className="text-white/80 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 line-clamp-2">
                    {dest.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
          {destinations.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No destinations found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
