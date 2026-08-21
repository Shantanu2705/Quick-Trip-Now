import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
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

    const docRef = await adminDb.collection("bookings").add(bookingData);

    if (data.couponCode && data.userId && data.userId !== "guest") {
      const userRef = adminDb.collection("users").doc(data.userId);
      await userRef.update({
        usedCoupons: FieldValue.arrayUnion(data.couponCode)
      });
      // Optionally deactivate the coupon if you want it strictly one-time globally
      // but the rule was "used once per user", so tracking on user is enough.
      // However, if the coupon is single-use overall, we'd do:
      // const couponQ = await adminDb.collection('coupons').where('code', '==', data.couponCode).get();
      // if (!couponQ.empty) await couponQ.docs[0].ref.update({ isActive: false });
    }

    // Send notification
    await sendBookingNotification({ id: docRef.id, ...bookingData }, 'direct');

    return NextResponse.json({ success: true, bookingId: docRef.id });
  } catch (error: any) {
    console.error("Booking confirmation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
