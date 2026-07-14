import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

import { getGlobalSettings } from "@/lib/settings-server";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getGlobalSettings();

  if (settings?.maintenanceMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
        <div className="max-w-md space-y-6">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary">Be Right Back</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We are currently performing routine maintenance to improve your booking experience. 
            Please check back shortly.
          </p>
          <div className="w-12 h-1 bg-primary/20 rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer phone={settings?.contactPhone} email={settings?.contactEmail} />
    </>
  );
}
