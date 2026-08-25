import { notFound } from "next/navigation";
import { BookingWizard } from "@/components/shared/BookingWizard";
import { VehicleBookingWizard } from "@/components/shared/VehicleBookingWizard";
import { adminDb } from "@/lib/firebase-admin";
import { getApplicablePrice } from "@/lib/price-utils";
import { getGlobalSettings } from "@/lib/settings-server";

export const dynamic = "force-dynamic";

export default async function BookPage({ searchParams }: { searchParams: Promise<{ type?: string, package?: string, date?: string, adults?: string, children?: string, infants?: string, route?: string, vehicleId?: string, vehiclesRequired?: string }> }) {
  const { type, package: packageSlug, date, adults, children, infants, route, vehicleId, vehiclesRequired } = await searchParams;
  const isVehicle = type === "cabs";

  let packageData: any = null;
  let cabRouteData: any = null;
  let availableVehicles: any[] = [];
  let basePrice = 0;
  let childPrice = 0;
  let maxChildAge = 12;
  const adultsCount = parseInt(adults || "2", 10) || 2;
  const childrenCount = parseInt(children || "0", 10) || 0;
  const infantsCount = parseInt(infants || "0", 10) || 0;
  const reqVehicles = parseInt(vehiclesRequired || "1", 10) || 1;
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
      let allVehicles = vehiclesSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      
      if (packageData.allowedVehicles && packageData.allowedVehicles.length > 0) {
        allVehicles = allVehicles.filter((v: any) => packageData.allowedVehicles.includes(v.id));
      }
      
      if (packageData.vehiclePrices || packageData.vehicleSeasonalPrices) {
        allVehicles = allVehicles.map((v: any) => {
          const updatedV = { ...v };
          if (packageData.vehiclePrices && packageData.vehiclePrices[v.id] !== undefined) {
            updatedV.price = packageData.vehiclePrices[v.id];
          }
          if (packageData.vehicleSeasonalPrices && packageData.vehicleSeasonalPrices[v.id]) {
            updatedV.seasonalPrices = packageData.vehicleSeasonalPrices[v.id];
          }
          return updatedV;
        });
      }
      
      availableVehicles = allVehicles;
    } catch (error) {
      console.error("Error fetching package data:", error);
    }

    if (!packageData) return notFound();

    maxChildAge = packageData.maxChildAge || globalMaxChildAge;
  } else {
    if (!route) return notFound();

    try {
      const routeSnap = await adminDb.collection("cab_routes").doc(route).get();
      if (routeSnap.exists) {
        cabRouteData = { id: routeSnap.id, ...routeSnap.data() };
      }
      
      const vehiclesSnap = await adminDb.collection("vehicles").get();
      let allVehicles = vehiclesSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));

      if (cabRouteData && cabRouteData.packageId) {
        const pkgSnap = await adminDb.collection("transfer_packages").doc(cabRouteData.packageId).get();
        if (pkgSnap.exists) {
          packageData = { id: pkgSnap.id, ...pkgSnap.data() };
        }
      }

      if (cabRouteData && cabRouteData.allowedVehicles && cabRouteData.allowedVehicles.length > 0) {
        allVehicles = allVehicles.filter((v: any) => cabRouteData.allowedVehicles.includes(v.id));
      }

      if (cabRouteData && (cabRouteData.vehiclePrices || cabRouteData.vehicleSeasonalPrices)) {
        allVehicles = allVehicles.map((v: any) => {
          const updatedV = { ...v };
          if (cabRouteData.vehiclePrices && cabRouteData.vehiclePrices[v.id] !== undefined) {
            updatedV.price = cabRouteData.vehiclePrices[v.id];
          }
          if (cabRouteData.vehicleSeasonalPrices && cabRouteData.vehicleSeasonalPrices[v.id]) {
            updatedV.seasonalPrices = cabRouteData.vehicleSeasonalPrices[v.id];
          }
          return updatedV;
        });
      }

      availableVehicles = allVehicles;
    } catch (error) {
      console.error("Error fetching cab data:", error);
    }

    if (!cabRouteData) return notFound();
    maxChildAge = globalMaxChildAge;
  }

  // Apply seasonal pricing overrides based on selectedDate
  if (parsedDate && availableVehicles.length > 0) {
    const selectedTime = parsedDate.getTime();
    availableVehicles = availableVehicles.map(v => {
      if (v.seasonalPrices && v.seasonalPrices.length > 0) {
        const activeSeason = v.seasonalPrices.find((sp: any) => {
          // Normalize dates to ignore time of day for exact matching
          const start = new Date(sp.startDate).setHours(0,0,0,0);
          const end = new Date(sp.endDate).setHours(23,59,59,999);
          const current = new Date(parsedDate).setHours(12,0,0,0); // Use middle of day to avoid timezone edge cases
          return current >= start && current <= end;
        });
        if (activeSeason) {
          return { ...v, price: activeSeason.price, pricePerDay: activeSeason.price };
        }
      }
      return v;
    });
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
            packageData={packageData}
            availableVehicles={availableVehicles}
            selectedDate={parsedDate}
            adultsCount={adultsCount}
            childrenCount={childrenCount}
            infantsCount={infantsCount}
            maxChildAge={maxChildAge}
          />
        ) : (
          <BookingWizard 
            packageData={packageData} 
            availableVehicles={availableVehicles}
            selectedDate={parsedDate} 
            adultsCount={adultsCount} 
            childrenCount={childrenCount}
            infantsCount={infantsCount}
            maxChildAge={maxChildAge}
            selectedVehicleId={vehicleId}
            vehiclesRequired={reqVehicles}
          />
        )}
      </div>
    </div>
  );
}
