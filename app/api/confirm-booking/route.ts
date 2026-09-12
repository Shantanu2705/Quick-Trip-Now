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

    const lockRef = adminDb.collection('counters').doc('bookings_lock');
    
    const bookingId = await adminDb.runTransaction(async (transaction: Transaction) => {
      // Lock for concurrent writes
      await transaction.get(lockRef as any);
      
      const query = adminDb.collection("bookings").orderBy("id", "desc").limit(1);
      const snapshot = await transaction.get(query as any);
      
      let newCount = 10001;
      
      if (!snapshot.empty) {
        const lastId = snapshot.docs[0].id;
        const match = lastId.match(/QTN-(\d+)/);
        if (match) {
          newCount = Math.max(10001, parseInt(match[1], 10) + 1);
        }
      }
      
      transaction.set(lockRef, { lastUpdated: new Date().toISOString() }, { merge: true });
      
      const generatedId = `QTN-${newCount}`;
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

    // Send WhatsApp notification
    await sendBookingNotification({
      id: bookingId,
      phone: data.phone || data.customerPhone || data.contact,
      amount: data.paidAmount || data.amount || 0,
      totalAmount: data.totalAmount || data.amount || 0,
      date: data.date || data.tripDate || data.startDate || data.pickupDate || "your scheduled date",
      package: data.package || data.packageName || data.service || "Quick Trip Now Package",
      name: data.name || data.customerName || data.firstName || "Customer"
    }, 'direct');

    return NextResponse.json({ success: true, bookingId });
  } catch (error: any) {
    console.error("Booking confirmation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
