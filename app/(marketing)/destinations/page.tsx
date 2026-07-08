import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

const DESTINATIONS = [
  {
    id: 1,
    name: "North Sikkim",
    slug: "north-sikkim",
    image: "https://images.unsplash.com/photo-1626079973809-541dd441b83d?q=80&w=800&auto=format&fit=crop",
    description: "The land of majestic peaks, frozen lakes, and high altitude valleys. North Sikkim offers an unparalleled experience of the raw Himalayas.",
    toursCount: 12
  },
  {
    id: 2,
    name: "Gangtok",
    slug: "gangtok",
    image: "https://images.unsplash.com/photo-1579730537243-d85f818ecad2?q=80&w=800&auto=format&fit=crop",
    description: "The vibrant capital city of Sikkim, offering a perfect blend of modern amenities and traditional Buddhist culture.",
    toursCount: 25
  },
  {
    id: 3,
    name: "Lachung & Yumthang",
    slug: "lachung-yumthang",
    image: "https://images.unsplash.com/photo-1616421041180-2a7924dcc65b?q=80&w=800&auto=format&fit=crop",
    description: "Known as the Valley of Flowers, Yumthang offers spectacular views of blooming rhododendrons and hot springs.",
    toursCount: 8
  },
  {
    id: 4,
    name: "Nathula Pass",
    slug: "nathula-pass",
    image: "https://images.unsplash.com/photo-1534061838843-85f8b9f71c4c?q=80&w=800&auto=format&fit=crop",
    description: "The historic Silk Route connecting India and Tibet, featuring the stunning Changu Lake and Baba Mandir.",
    toursCount: 15
  },
  {
    id: 5,
    name: "Pelling",
    slug: "pelling",
    image: "https://images.unsplash.com/photo-1598418928373-cf6776840742?q=80&w=800&auto=format&fit=crop",
    description: "Famous for its magnificent views of the Kanchenjunga range and historic monasteries like Pemayangtse.",
    toursCount: 10
  }
];

export default function DestinationsPage() {
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
          {DESTINATIONS.map((dest) => (
            <Link key={dest.id} href={`/destinations/${dest.slug}`} className="group block">
              <div className="relative h-[400px] rounded-3xl overflow-hidden mb-6 shadow-sm hover:shadow-xl transition-all duration-500">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold text-primary flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {dest.toursCount} Tours
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
        </div>
      </div>
    </div>
  );
}
