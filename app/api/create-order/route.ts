import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, AuthenticatedRequest } from "@/lib/auth-middleware";

async function createOrderHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { amount, bookingDetails, upiId } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, message: "Invalid amount", error: "INVALID_AMOUNT" }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { success: false, message: "Razorpay keys not configured.", error: "MISSING_KEYS" },
        { status: 500 }
      );
    }

    // Optional: UPI ID validation logic according to prompt requirements
    // For production, Razorpay's UPI flow (Collect or Intent) will validate this 
    // during the transaction. If specific UPI pre-validation API exists, use it here.
    if (upiId) {
      // Basic format check
      if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
        return NextResponse.json({ success: false, message: "This UPI ID is invalid or unavailable. Please enter a valid UPI ID." }, { status: 400 });
      }
      // Note: Do not fake bank validation. Let the gateway handle the actual UPI push/collect.
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const receiptId = `receipt_${Date.now()}`;
    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: "INR",
      receipt: receiptId,
    };

    const order = await razorpay.orders.create(options);
    
    // Store order in Firestore securely
    const orderDoc = {
      orderId: order.id,
      userId: req.user?.uid || null, // null for guest checkouts if allowed, though auth middleware prevents this
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: "created",
      bookingDetails: bookingDetails || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection("orders").doc(order.id).set(orderDoc);

    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error: any) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create Razorpay order.", error: error.message },
      { status: 500 }
    );
  }
}

// Ensure the endpoint is protected
export const POST = (req: NextRequest) => withAuth(req, createOrderHandler);
