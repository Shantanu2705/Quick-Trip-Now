import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit } from "firebase/firestore";

export interface Destination {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  isPopular?: boolean;
  history?: string;
  touristPlaces?: string;
  bestTimeToVisit?: string;
  mainAttractions?: string[];
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
  ac?: boolean;
  seats?: number;
  unavailableDates?: string[];
}

export interface CabRoute {
  id: string;
  title: string;
  subtitle: string;
  itinerary?: { location: string }[];
  distance?: string;
  duration?: string;
  createdAt?: any;
}

export interface Package {
  id: string;
  title: string;
  slug: string;
  image: string; // Featured image
  images?: string[]; // Gallery images
  description?: string;
  duration: string;
  days?: number;
  nights?: number;
  category: string;
  childPrice?: number;
  maxChildAge?: number;
  seasonalPrices?: { startDate: string; endDate: string; price: number }[];
  rating: number;
  reviews: number;
  destinationId?: string;
  destination?: string;
  status?: string;
  isFeatured?: boolean;
  highlights?: string[];
  itinerary?: { day: number; title: string; desc: string }[];
  inclusions?: { text: string; included: boolean }[];
}

export async function getPackages() {
  if (!db) return [];
  const q = collection(db!, "packages");
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Package));
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
