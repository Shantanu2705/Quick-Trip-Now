import { notFound } from "next/navigation";
import { BookingWizard } from "@/components/shared/BookingWizard";
import { VehicleBookingWizard } from "@/components/shared/VehicleBookingWizard";
import { adminDb } from "@/lib/firebase-admin";
import { getApplicablePrice } from "@/lib/price-utils";
import { getGlobalSettings } from "@/lib/settings-server";

export const dynamic = "force-dynamic";

export default async function BookPage({ searchParams }: { searchParams: Promise<{ type?: string, package?: string, date?: string, adults?: string, children?: string, route?: string }> }) {
  const { type, package: packageSlug, date, adults, children, route } = await searchParams;
  const isVehicle = type === "cabs";

  let packageData = null;
  let cabRouteData = null;
  let availableVehicles: any[] = [];
  let basePrice = 0;
  let childPrice = 0;
  let maxChildAge = 12;
  const adultsCount = parseInt(adults || "2", 10) || 2;
  const childrenCount = parseInt(children || "0", 10) || 0;
  let parsedDate: Date | undefined;

  const settings = await getGlobalSettings();
  const globalMaxChildAge = settings?.globalMaxChildAge || 12;

  if (date) {
    parsedDate = new Date(date);
  }

  if (!isVehicle) {
    if (!packageSlug) return notFound();

    try {
      const snapshot = await adminDb.collection("packages").where("slug", "==", packageSlug).limit(1).get();
      if (!snapshot.empty) {
        packageData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      }
      
      const vehiclesSnap = await adminDb.collection("vehicles").get();
      const allVehicles = vehiclesSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      availableVehicles = allVehicles;
    } catch (error) {
      console.error("Error fetching package data:", error);
    }

    if (!packageData) return notFound();

    basePrice = getApplicablePrice(packageData.seasonalPrices, parsedDate);
    childPrice = packageData.childPrice || basePrice;
    maxChildAge = packageData.maxChildAge || globalMaxChildAge;
  } else {
    if (!route) return notFound();

    try {
      const routeSnap = await adminDb.collection("cab_routes").doc(route).get();
      if (routeSnap.exists) {
        cabRouteData = { id: routeSnap.id, ...routeSnap.data() };
      }
      
      const vehiclesSnap = await adminDb.collection("vehicles").get();
      const allVehicles = vehiclesSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      availableVehicles = allVehicles;
    } catch (error) {
      console.error("Error fetching cab data:", error);
    }

    if (!cabRouteData) return notFound();
    maxChildAge = globalMaxChildAge;
  }

  return (
    <div className="bg-muted/20 min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
            {isVehicle ? "Complete Vehicle Booking" : `Booking: ${packageData?.title}`}
          </h1>
          <p className="text-lg text-muted-foreground">
            {isVehicle ? "Select your vehicle and fill in the details." : "Fill in the details for all travelers to proceed to secure payment."}
          </p>
        </div>
        
        {isVehicle ? (
          <VehicleBookingWizard 
            cabRouteData={cabRouteData} 
            availableVehicles={availableVehicles}
            selectedDate={parsedDate}
            adultsCount={adultsCount}
            childrenCount={childrenCount}
            maxChildAge={maxChildAge}
          />
        ) : (
          <BookingWizard 
            packageData={packageData} 
            availableVehicles={availableVehicles}
            selectedDate={parsedDate} 
            adultsCount={adultsCount} 
            childrenCount={childrenCount}
            basePrice={basePrice} 
            childPrice={childPrice}
            maxChildAge={maxChildAge}
          />
        )}
      </div>
    </div>
  );
}
