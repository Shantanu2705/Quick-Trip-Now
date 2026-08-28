import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue, Transaction } from "firebase-admin/firestore";
import { sendBookingNotification } from "@/lib/notification-service";

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

    const counterRef = adminDb.collection('counters').doc('bookings');
    
    const bookingId = await adminDb.runTransaction(async (transaction: Transaction) => {
      const counterDoc = await transaction.get(counterRef as any) as any;
      let newCount = 1;
      
      if (counterDoc.exists) {
        newCount = (counterDoc.data()?.count || 0) + 1;
      }
      
      transaction.set(counterRef, { count: newCount }, { merge: true });
      
      const generatedId = `QUICKTRIP${newCount}`;
      const bookingRef = adminDb.collection("bookings").doc(generatedId);
      
      transaction.set(bookingRef, {
        ...bookingData,
        id: generatedId
      });
      
      return generatedId;
    });

    if (data.couponCode && data.userId && data.userId !== "guest") {
      const userRef = adminDb.collection("users").doc(data.userId);
      await userRef.update({
        usedCoupons: FieldValue.arrayUnion(data.couponCode)
      });
    }

    // Send notification
    await sendBookingNotification({ id: bookingId, ...bookingData }, 'direct');

    return NextResponse.json({ success: true, bookingId });
  } catch (error: any) {
    console.error("Booking confirmation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
