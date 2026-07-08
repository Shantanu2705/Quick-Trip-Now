import { BookingWizard } from "@/components/shared/BookingWizard";
import { VehicleBookingWizard } from "@/components/shared/VehicleBookingWizard";

export default async function BookPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const isVehicle = type === "cabs";

  return (
    <div className="bg-muted/20 min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
            {isVehicle ? "Complete Vehicle Booking" : "Complete Your Booking"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {isVehicle ? "Secure your private transfer in just a few steps." : "Just a few simple steps to secure your dream journey."}
          </p>
        </div>
        
        {isVehicle ? <VehicleBookingWizard /> : <BookingWizard />}
      </div>
    </div>
  );
}
