import { Hero } from "@/components/shared/Hero";
import { PopularDestinations } from "@/components/shared/PopularDestinations";
import { FeaturedTours } from "@/components/shared/FeaturedTours";

import { getGlobalSettings } from "@/lib/settings-server";

export default async function HomePage() {
  const settings = await getGlobalSettings();
  const globalMaxChildAge = settings?.globalMaxChildAge || 12;

  return (
    <>
      <Hero globalMaxChildAge={globalMaxChildAge} />
      <PopularDestinations />
      <FeaturedTours />
    </>
  );
}
