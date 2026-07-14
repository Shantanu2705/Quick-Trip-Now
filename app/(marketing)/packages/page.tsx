import Image from "next/image";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { Suspense } from "react";
import { adminDb } from "@/lib/firebase-admin";
import { PackagesGrid } from "@/components/shared/PackagesGrid";
import { getGlobalSettings } from "@/lib/settings-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PackagesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  let tours: any[] = [];
  const settings = await getGlobalSettings();
  const globalMaxChildAge = settings?.globalMaxChildAge || 12;

  try {
    if (adminDb) {
      const snapshot = await adminDb.collection("packages").get();
      tours = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

      const dest = resolvedSearchParams?.destination;
      if (dest && typeof dest === 'string') {
        tours = tours.filter((t: any) => t.destination?.toLowerCase() === dest.toLowerCase());
      }
    }
  } catch (error) {
    console.error("Error fetching packages:", error);
  }

  return (
    <div className="bg-background min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mb-12">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6">
            Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Packages</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Discover the best curated tours and bespoke journeys. Use the filters below to find accurate pricing for your exact travel dates and group size.
          </p>
        </div>

        <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading packages...</div>}>
          <PackagesGrid tours={tours} globalMaxChildAge={globalMaxChildAge} />
        </Suspense>
      </div>
    </div>
  );
}
