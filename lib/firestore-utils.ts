import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit } from "firebase/firestore";

export interface Destination {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  isPopular?: boolean;
  isUpcoming?: boolean;
  history?: string;
  touristPlaces?: string;
  bestTimeToVisit?: string;
  mainAttractions?: string[];
  durations?: string[];
}

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  price: number; // Flat rate for the route
  image: string;
  maxAdults?: number;
  maxChildren?: number;
  maxChildAge?: number;
  gstPercentage?: number;
  ac?: boolean;
  seats?: number;
  unavailableDates?: string[];
  inclusions?: { text: string; included: boolean }[];
  exclusions?: { text: string; included: boolean }[];
  termsAndConditions?: string;
}

export interface CabRoute {
  id: string;
  title: string;
  destination: string;
  packageId?: string;
  allowedVehicles?: string[];
  vehiclePrices?: Record<string, number>;
  vehicleSeasonalPrices?: Record<string, { startDate: string; endDate: string; price: number }[]>;
  terms?: string;
  inclusions?: { text: string; included: boolean }[];
  gstPercentage?: number;
  vehiclePartPayments?: Record<string, { enabled: boolean; percentage: number }>;
  createdAt?: any;
}

export interface Package {
  id: string;
  slug?: string;
  title: string;
  description: string;
  image: string;
  destination: string;
  duration: string;
  days: number;
  nights: number;
  category: string;
  status: string;
  isFeatured: boolean;
  highlights: string[];
  itinerary: any[];
  inclusions: any[];
  rating: number;
  reviews: number;
  termsAndConditions: string;
  maxAdults: number;
  maxChildren: number;
  maxInfants: number;
  gstPercentage: number;
  vehiclePartPayments?: Record<string, { enabled: boolean; percentage: number }>;
  allowedVehicles?: string[]; // Array of vehicle IDs
  vehiclePrices?: Record<string, number>; // Vehicle ID to Price mapping
  vehicleSeasonalPrices?: Record<string, { startDate: string; endDate: string; price: number }[]>;
}

export interface PersonPricingTier {
  persons: number; // e.g. 1, 2, 3, etc.
  price: number;   // total package price for this group size (e.g. 6000 for 1, 8500 for 2, 11000 for 3)
}

export interface GroupTour {
  id: string;
  slug?: string;
  title: string;
  description: string;
  image: string;
  destination: string;
  duration: string;
  days: number;
  nights: number;
  status: string;
  isFeatured?: boolean;
  highlights: string[];
  itinerary: { day: number; title: string; desc: string }[];
  inclusions: { text: string; included: boolean }[];
  rating: number;
  reviews: number;
  termsAndConditions: string;
  terms?: string;
  maxAdults: number;
  maxChildren: number;
  maxInfants: number;
  gstPercentage: number;
  // Package-based pricing:
  price: number; // Base Price Per Person (Adult)
  childPrice?: number; // Base Price Per Child
  personPricing?: PersonPricingTier[]; // Dynamic pricing for number of persons (e.g. 1 person: 6000, 2 persons: 8500, 3 persons: 11000)
  seasonalPrices?: {
    startDate: string;
    endDate: string;
    price: number;
    childPrice?: number;
    personPricing?: PersonPricingTier[];
  }[];
  partPayment?: { enabled: boolean; percentage: number };
  createdAt?: string;
  updatedAt?: string;
}

export function calculateGroupTourPricing({
  tour,
  adults,
  children = 0,
  date,
}: {
  tour: GroupTour;
  adults: number;
  children?: number;
  date?: Date | string;
}) {
  let isSeasonal = false;
  let activeSeason: any = null;

  if (date && tour.seasonalPrices && tour.seasonalPrices.length > 0) {
    const dateStr = typeof date === "string" ? date.slice(0, 10) : (date instanceof Date ? date.toISOString().slice(0, 10) : "");
    if (dateStr) {
      activeSeason = tour.seasonalPrices.find(
        sp => dateStr >= sp.startDate && dateStr <= sp.endDate
      );
      if (activeSeason) {
        isSeasonal = true;
      }
    }
  }

  // Tiers priority: active season personPricing if available, else tour.personPricing
  const rawTiers = (activeSeason?.personPricing && activeSeason.personPricing.length > 0)
    ? activeSeason.personPricing
    : (tour.personPricing && tour.personPricing.length > 0)
    ? tour.personPricing
    : [];

  const tiers: PersonPricingTier[] = rawTiers
    .filter((t: any) => Number(t.persons) > 0 && Number(t.price) > 0)
    .map((t: any) => ({ persons: Number(t.persons), price: Number(t.price) }))
    .sort((a: any, b: any) => a.persons - b.persons);

  const baseAdultPrice = activeSeason ? activeSeason.price : (tour.price || 0);
  const childPrice = (activeSeason && activeSeason.childPrice !== undefined) ? activeSeason.childPrice : (tour.childPrice || 0);

  let adultsTotal = 0;
  let adultPricePerPerson = baseAdultPrice;
  let activeTierMatch: PersonPricingTier | null = null;

  if (tiers && tiers.length > 0) {
    const exactMatch = tiers.find(t => t.persons === adults);

    if (exactMatch) {
      activeTierMatch = exactMatch;
      adultsTotal = exactMatch.price;
      adultPricePerPerson = adults > 0 ? Math.round(exactMatch.price / adults) : exactMatch.price;
    } else {
      const maxTier = tiers[tiers.length - 1];
      if (adults > maxTier.persons) {
        let incrementalRate = baseAdultPrice;
        if (tiers.length >= 2) {
          const secondMax = tiers[tiers.length - 2];
          const diffPersons = maxTier.persons - secondMax.persons;
          if (diffPersons > 0) {
            incrementalRate = Math.round((maxTier.price - secondMax.price) / diffPersons);
          }
        } else if (maxTier.persons > 0) {
          incrementalRate = Math.round(maxTier.price / maxTier.persons);
        }
        adultsTotal = maxTier.price + (adults - maxTier.persons) * incrementalRate;
        adultPricePerPerson = adults > 0 ? Math.round(adultsTotal / adults) : incrementalRate;
      } else {
        const minTier = tiers[0];
        if (adults < minTier.persons && adults > 0) {
          adultsTotal = Math.round((minTier.price / minTier.persons) * adults);
          adultPricePerPerson = Math.round(minTier.price / minTier.persons);
        } else {
          adultsTotal = adults * baseAdultPrice;
          adultPricePerPerson = baseAdultPrice;
        }
      }
    }
  } else {
    adultsTotal = adults * baseAdultPrice;
    adultPricePerPerson = baseAdultPrice;
  }

  const childrenTotal = children * childPrice;
  const subtotal = adultsTotal + childrenTotal;
  const gstRate = tour.gstPercentage || 0;
  const gstAmount = Math.round((subtotal * gstRate) / 100);
  const grandTotal = subtotal + gstAmount;

  const partPaymentEnabled = tour.partPayment?.enabled || false;
  const partPercentage = tour.partPayment?.percentage || 50;
  const advancePayable = partPaymentEnabled
    ? Math.round((grandTotal * partPercentage) / 100)
    : grandTotal;
  const balancePayable = grandTotal - advancePayable;

  return {
    adultPricePerPerson,
    adultsTotal,
    childPrice,
    childrenTotal,
    subtotal,
    gstRate,
    gstAmount,
    grandTotal,
    partPaymentEnabled,
    partPercentage,
    advancePayable,
    balancePayable,
    isSeasonal,
    hasDynamicTiers: tiers.length > 0,
    activeTierMatch,
    availableTiers: tiers
  };
}

export interface TransferPackage {
  id: string;
  title: string;
  description: string;
}

export async function getPackages() {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, 'packages'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Package));
}

export async function getGroupTours(): Promise<GroupTour[]> {
  // 1. Try public API endpoint first (uses adminDb, avoids client firestore permission issues & auto-seeds defaults)
  try {
    const res = await fetch('/api/group-tours', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
        return data.data;
      }
    }
  } catch (apiErr) {
    // API failed, try client firestore below
  }

  // 2. Direct client Firestore query
  try {
    if (db) {
      const snapshot = await getDocs(collection(db, 'group_tours'));
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroupTour));
      }
    }
  } catch (err) {
    console.error("Error fetching group tours from client Firestore:", err);
  }

  return [];
}

export async function getTransferPackages() {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, 'transfer_packages'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransferPackage));
}

export async function getDestinations() {
  if (!db) return [];
  const q = collection(db!, "destinations");
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Destination));
}

export async function getVehicles() {
  if (!db) return [];
  const q = collection(db!, "vehicles");
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Vehicle));
}


export async function getCabRoutes() {
  if (!db) return [];
  const q = collection(db!, "cab_routes");
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as CabRoute));
}

