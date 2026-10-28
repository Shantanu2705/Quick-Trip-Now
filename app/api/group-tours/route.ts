import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const DEFAULT_GROUP_TOURS = [
  {
    title: "Gangtok & North Sikkim Group Tour",
    slug: "gangtok-north-sikkim-group-tour",
    description: "Join fellow travelers on an unforgettable high-altitude journey across North Sikkim. Visit Lachung, Yumthang Valley, hot springs, and experience breathtaking Himalayan vistas.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
    destination: "Gangtok",
    duration: "3 Days / 2 Nights",
    days: 3,
    nights: 2,
    status: "Active",
    isFeatured: true,
    price: 6000,
    childPrice: 2400,
    personPricing: [
      { persons: 1, price: 6000 },
      { persons: 2, price: 8500 },
      { persons: 3, price: 11000 },
      { persons: 4, price: 13500 },
    ],
    gstPercentage: 5,
    maxAdults: 20,
    maxChildren: 10,
    maxInfants: 5,
    rating: 4.9,
    reviews: 138,
    partPayment: { enabled: true, percentage: 40 },
    highlights: [
      "Shared luxury mountain vehicle transfer",
      "Yumthang Valley of Flowers excursion",
      "Seven Sisters & Singhik viewpoints",
      "Twin sharing hotel stays with breakfast & dinner",
      "All North Sikkim inner-line permits included"
    ],
    itinerary: [
      {
        day: 1,
        title: "Gangtok to Lachung Scenic Mountain Drive",
        desc: "Morning pickup from Gangtok. Travel through picturesque mountain roads passing Seven Sisters Waterfall and Singhik Viewpoint. Arrive in Lachung by evening for dinner and overnight stay."
      },
      {
        day: 2,
        title: "Yumthang Valley of Flowers & Hot Spring",
        desc: "Early morning drive to the famous Yumthang Valley (11,800 ft). Witness snow-clad peaks, rhododendron sanctuaries, and natural sulfur hot springs. Optional trip to Zero Point. Return to Lachung."
      },
      {
        day: 3,
        title: "Lachung to Gangtok Return",
        desc: "Enjoy hearty mountain breakfast before beginning the scenic return journey back to Gangtok with memories of a lifetime."
      }
    ],
    inclusions: [
      { text: "Shared luxury mountain coach transfers", included: true },
      { text: "2 Nights accommodation on twin/triple sharing", included: true },
      { text: "Daily breakfast and dinner", included: true },
      { text: "All inner-line tourist permits & environmental fees", included: true },
      { text: "Zero Point additional transfer fee", included: false },
      { text: "Personal laundry, beverages, and tips", included: false }
    ],
    termsAndConditions: "1. 100% advance or part payment required to confirm your seat.\n2. Valid government photo ID (Voter ID / Passport) required for North Sikkim permits.\n3. Group tour operates with fixed daily departure schedules.\n4. Alternate sightseeing will be offered if road access is impacted by adverse weather.",
    terms: "1. 100% advance or part payment required to confirm your seat.\n2. Valid government photo ID (Voter ID / Passport) required for North Sikkim permits.\n3. Group tour operates with fixed daily departure schedules.\n4. Alternate sightseeing will be offered if road access is impacted by adverse weather."
  },
  {
    title: "Gurudongmar Lake & Lachen Group Expedition",
    slug: "gurudongmar-lake-lachen-group-expedition",
    description: "An exhilarating group expedition to sacred Gurudongmar Lake, perched at 17,800 feet. Travel through high mountain passes, Chopta Valley, and Thangu plateau.",
    image: "https://images.unsplash.com/photo-1626079973809-541dd441b83d?q=80&w=1200&auto=format&fit=crop",
    destination: "Lachen",
    duration: "2 Days / 1 Night",
    days: 2,
    nights: 1,
    status: "Active",
    isFeatured: true,
    price: 5500,
    childPrice: 3200,
    personPricing: [
      { persons: 1, price: 5500 },
      { persons: 2, price: 8000 },
      { persons: 3, price: 10500 },
      { persons: 4, price: 13000 }
    ],
    gstPercentage: 5,
    maxAdults: 18,
    maxChildren: 6,
    maxInfants: 2,
    rating: 4.9,
    reviews: 94,
    partPayment: { enabled: true, percentage: 50 },
    highlights: [
      "Sacred Gurudongmar Lake at 17,800 ft",
      "Scenic Chopta Valley & Thangu military outpost",
      "Dedicated high-clearance mountain group vehicle",
      "Authentic mountain homestay with room heaters"
    ],
    itinerary: [
      {
        day: 1,
        title: "Gangtok to Lachen Highland Journey",
        desc: "Drive through the Teesta river valley towards Lachen. Visit Chungthang confluence on the way. Check in to mountain lodge and acclimatize."
      },
      {
        day: 2,
        title: "Gurudongmar Lake Drive & Return to Gangtok",
        desc: "Early 4:00 AM departure to Gurudongmar Lake through Cold Desert terrain. Enjoy panoramic Tibetan plateau views, stop for breakfast at Thangu, and return to Gangtok by evening."
      }
    ],
    inclusions: [
      { text: "High-altitude group 4x4 vehicle transfers", included: true },
      { text: "1 Night stay in Lachen with heating amenities", included: true },
      { text: "All meals (Breakfast, Lunch, Dinner)", included: true },
      { text: "Special military zone inner-line permits", included: true },
      { text: "Personal oxygen cylinders or extreme cold gear rental", included: false }
    ],
    termsAndConditions: "1. Not recommended for children under 5 or persons with severe respiratory ailments.\n2. Permits strictly require Indian citizenship & original government ID.\n3. High-altitude acclimatization guidelines must be followed.",
    terms: "1. Not recommended for children under 5 or persons with severe respiratory ailments.\n2. Permits strictly require Indian citizenship & original government ID.\n3. High-altitude acclimatization guidelines must be followed."
  },
  {
    title: "Pelling & West Sikkim Scenic Heritage Tour",
    slug: "pelling-west-sikkim-scenic-heritage-tour",
    description: "Explore the cultural heartland of Sikkim in a friendly group environment. Marvel at Kanchenjunga views from Pelling Skywalk, ancient monasteries, and sacred lakes.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
    destination: "Pelling",
    duration: "3 Days / 2 Nights",
    days: 3,
    nights: 2,
    status: "Active",
    isFeatured: true,
    price: 3800,
    childPrice: 2100,
    personPricing: [
      { persons: 1, price: 3800 },
      { persons: 2, price: 5800 },
      { persons: 3, price: 7800 },
      { persons: 4, price: 9800 }
    ],
    gstPercentage: 5,
    maxAdults: 24,
    maxChildren: 12,
    maxInfants: 6,
    rating: 4.8,
    reviews: 82,
    partPayment: { enabled: true, percentage: 35 },
    highlights: [
      "Pelling Glass Skywalk & Chenrezig Colossus",
      "Pemayangtse Monastery & Rabdentse Royal Palace Ruins",
      "Sacred Khecheopalri Wish-Fulfilling Lake",
      "Kanchenjunga Falls & Rimbi Rock Garden"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Pelling & Glass Skywalk",
        desc: "Scenic group drive to West Sikkim. Visit the breathtaking Pelling Glass Skywalk overlooking Himalayan ranges. Check in to hotel."
      },
      {
        day: 2,
        title: "Full Day West Sikkim Heritage & Lakes",
        desc: "Visit sacred Khecheopalri Lake, Rimbi Waterfall, Kanchenjunga Waterfall, and historical Rabdentse palace ruins."
      },
      {
        day: 3,
        title: "Pemayangtse Monastery & Return",
        desc: "Morning visit to 300-year-old Pemayangtse Monastery before returning to your departure hub."
      }
    ],
    inclusions: [
      { text: "Full group sightseeing transfers", included: true },
      { text: "2 Nights accommodation with valley views", included: true },
      { text: "Daily morning breakfast", included: true },
      { text: "Certified local tour coordinator", included: true },
      { text: "Entry tickets to Skywalk & monuments", included: false }
    ],
    termsAndConditions: "1. Advance part payment or full payment confirms reservation.\n2. Modest attire requested when entering monasteries.\n3. Free cancellation up to 7 days before departure.",
    terms: "1. Advance part payment or full payment confirms reservation.\n2. Modest attire requested when entering monasteries.\n3. Free cancellation up to 7 days before departure."
  }
];

export async function GET() {
  try {
    if (adminDb) {
      const snapshot = await adminDb.collection("group_tours").get();
      if (!snapshot.empty) {
        const tours = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ success: true, data: tours });
      }

      // Auto seed initial tours if collection is empty
      const batch = adminDb.batch();
      const seeded: any[] = [];
      for (const tour of DEFAULT_GROUP_TOURS) {
        const docRef = adminDb.collection("group_tours").doc();
        const data = {
          ...tour,
          id: docRef.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        batch.set(docRef, data);
        seeded.push(data);
      }
      await batch.commit();
      return NextResponse.json({ success: true, data: seeded });
    }

    return NextResponse.json({ success: true, data: DEFAULT_GROUP_TOURS.map((t, i) => ({ id: `default-${i}`, ...t })) });
  } catch (error: any) {
    console.error("Error in GET /api/group-tours:", error);
    return NextResponse.json({ success: true, data: DEFAULT_GROUP_TOURS.map((t, i) => ({ id: `default-${i}`, ...t })) });
  }
}
