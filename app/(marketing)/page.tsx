import { Hero } from "@/components/shared/Hero";
import { PopularDestinations } from "@/components/shared/PopularDestinations";
import { FeaturedTours } from "@/components/shared/FeaturedTours";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PopularDestinations />
      <FeaturedTours />
    </>
  );
}
