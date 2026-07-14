import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Firebase not configured" }, { status: 500 });
    }

    const bookingData = {
      ...data,
      createdAt: new Date().toISOString(),
      status: "confirmed"
    };

    const docRef = await adminDb.collection("bookings").add(bookingData);

    return NextResponse.json({ success: true, bookingId: docRef.id });
  } catch (error: any) {
    console.error("Booking confirmation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
