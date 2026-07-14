import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, Compass, Sun, MapPin, CheckCircle2 } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DestinationDetailsPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  let destination = null;
  
  try {
    if (adminDb) {
      // Find destination
      const destSnapshot = await adminDb.collection("destinations").where("slug", "==", params.slug).limit(1).get();
      if (destSnapshot.empty) {
        return notFound();
      }
      destination = { id: destSnapshot.docs[0].id, ...destSnapshot.docs[0].data() };

    }
  } catch (error) {
    console.error("Error fetching destination details:", error);
  }

  if (!destination) {
    return notFound();
  }

  return (
    <div className="bg-background min-h-[150vh] pb-24">
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh] w-full pt-24">
        <Image
          src={destination.image}
          alt={destination.name}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto px-4 md:px-8 pb-16">
            <Link href="/destinations" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors font-medium">
              <ArrowLeft className="w-5 h-5" /> Back to all destinations
            </Link>
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-4 shadow-sm">
              {destination.name}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl font-medium leading-relaxed drop-shadow-md">
              {destination.description}
            </p>
          </div>
        </div>
      </div>

      {/* Rich Content Section */}
      <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Main Left Content */}
          <div className="w-full lg:w-2/3 space-y-12">
            
            {/* History Section */}
            {destination.history && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary/10 p-2.5 rounded-xl">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-3xl font-heading font-bold text-foreground">History & Overview</h2>
                </div>
                <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
                  <p>{destination.history}</p>
                </div>
              </section>
            )}

            {/* Tourist Places Section */}
            {destination.touristPlaces && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary/10 p-2.5 rounded-xl">
                    <Compass className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-3xl font-heading font-bold text-foreground">Tourist Places & Geography</h2>
                </div>
                <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
                  <p>{destination.touristPlaces}</p>
                </div>
              </section>
            )}

            {/* Main Attractions Grid */}
            {destination.mainAttractions && destination.mainAttractions.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary/10 p-2.5 rounded-xl">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-3xl font-heading font-bold text-foreground">Main Attractions</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {destination.mainAttractions.map((attraction: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 bg-muted/30 p-4 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="font-medium text-foreground/90">{attraction}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-28">
              {destination.bestTimeToVisit && (
                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Sun className="w-6 h-6 text-amber-500" />
                    <h3 className="text-xl font-heading font-bold text-foreground">Best Time to Visit</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg font-medium">
                    {destination.bestTimeToVisit}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
