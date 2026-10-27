import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const TOURS = [
  {
    title: "North Sikkim 3 Days 2 Nights",
    slug: "north-sikkim-3-days",
    image: "/images/sikkim_tour_1.png",
    duration: "3 Days / 2 Nights",
    category: "Shared Tour",
    price: 4000,
    destination: "Gangtok",
    termsAndConditions: "1. 100% advance or part payment required for confirmation.\n2. Permits required for North Sikkim must be applied with valid government ID.\n3. In case of road blockage due to landslide or weather, alternate sightseeing will be provided.",
    terms: "1. 100% advance or part payment required for confirmation.\n2. Permits required for North Sikkim must be applied with valid government ID.\n3. In case of road blockage due to landslide or weather, alternate sightseeing will be provided.",
    inclusions: [
      { text: "Accommodation on twin sharing basis", included: true },
      { text: "Breakfast and Dinner included", included: true },
      { text: "Sightseeing transfers as per itinerary", included: true },
      { text: "Personal expenses and entry tickets", included: false }
    ],
    rating: 4.8,
    reviews: 124
  },
  {
    title: "Lachung Luxury Camp Retreat",
    slug: "lachung-luxury-camp",
    image: "/images/sikkim_tour_2.png",
    duration: "2 Days / 1 Night",
    category: "Private Tour",
    price: 8500,
    destination: "Lachen",
    termsAndConditions: "1. Advance payment required to confirm luxury camp.\n2. Valid government ID required for all travelers.\n3. Camp schedule subject to mountain weather conditions.",
    terms: "1. Advance payment required to confirm luxury camp.\n2. Valid government ID required for all travelers.\n3. Camp schedule subject to mountain weather conditions.",
    inclusions: [
      { text: "Luxury tent accommodation with heater", included: true },
      { text: "All meals (Breakfast, Lunch, Dinner)", included: true },
      { text: "Campfire and guided nature walk", included: true },
      { text: "Personal bar or laundry service", included: false }
    ],
    rating: 4.9,
    reviews: 89
  },
  {
    title: "Monastery & Culture Tour",
    slug: "monastery-culture-tour",
    image: "/images/sikkim_tour_3.png",
    duration: "1 Day",
    category: "Package",
    price: 2500,
    destination: "Pelling",
    termsAndConditions: "1. Modest dress required when visiting monasteries.\n2. Tour starts at 8:30 AM from hotel pickup point.\n3. Photography permissions vary by monastery.",
    terms: "1. Modest dress required when visiting monasteries.\n2. Tour starts at 8:30 AM from hotel pickup point.\n3. Photography permissions vary by monastery.",
    inclusions: [
      { text: "Guided monastery tour with certified local guide", included: true },
      { text: "Traditional Sikkim lunch", included: true },
      { text: "All monastery entry permits", included: true },
      { text: "Camera permits and souvenirs", included: false }
    ],
    rating: 5.0,
    reviews: 45
  }
];

const DESTINATIONS = [
  {
    name: "Gangtok",
    slug: "gangtok",
    image: "/images/gangtok.jpg",
    description: "The capital city known for its cleanliness, natural beauty, and vibrant culture."
  },
  {
    name: "Pelling",
    slug: "pelling",
    image: "/images/pelling.jpg",
    description: "Famous for the spectacular views of Mount Kanchenjunga and ancient monasteries."
  },
  {
    name: "Lachen",
    slug: "lachen",
    image: "/images/lachen.jpg",
    description: "A scenic mountain village that serves as the base for Gurudongmar Lake."
  }
];

export async function GET(req: Request) {
  try {
    // Note: In a production app, protect this route with authentication!
    
    if (!adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not configured. Cannot seed.' }, { status: 500 });
    }

    const packagesRef = adminDb.collection('packages');
    const destRef = adminDb.collection('destinations');

    // Add Packages
    for (const pkg of TOURS) {
      const q = await packagesRef.where('slug', '==', pkg.slug).get();
      if (q.empty) {
        await packagesRef.add({ ...pkg, createdAt: new Date().toISOString() });
      }
    }

    // Add Destinations
    for (const dest of DESTINATIONS) {
      const q = await destRef.where('slug', '==', dest.slug).get();
      if (q.empty) {
        await destRef.add({ ...dest, createdAt: new Date().toISOString() });
      }
    }

    return NextResponse.json({ success: true, message: 'Database seeded successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to seed database', error: error.message }, { status: 500 });
  }
}
