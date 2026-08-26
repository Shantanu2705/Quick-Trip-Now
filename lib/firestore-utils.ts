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
  allowedVehicles?: string[]; // Array of vehicle IDs
  vehiclePrices?: Record<string, number>; // Vehicle ID to Price mapping
  vehicleSeasonalPrices?: Record<string, { startDate: string; endDate: string; price: number }[]>;
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
