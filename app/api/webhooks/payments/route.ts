import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ success: false, message: "Missing signature" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Webhook secret not configured");
      return NextResponse.json({ success: false, message: "Webhook secret missing" }, { status: 500 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      // Log failed verification attempt
      await adminDb.collection("auditLogs").add({
        action: "WEBHOOK_VERIFICATION_FAILED",
        timestamp: new Date().toISOString(),
        details: "Invalid Razorpay webhook signature",
      });
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const paymentData = event.payload.payment.entity;

    // We get order_id from the payment entity
    const orderId = paymentData.order_id;
    const paymentId = paymentData.id;

    if (!orderId) {
      return NextResponse.json({ success: true, message: "No order id associated" });
    }

    // Check for duplicate processing by checking if this transaction already exists
    const transactionRef = adminDb.collection("transactions").doc(paymentId);
    const transactionDoc = await transactionRef.get();

    if (transactionDoc.exists) {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    const status = paymentData.status;

    // Save transaction
    await transactionRef.set({
      paymentId,
      orderId,
      status,
      method: paymentData.method, // upi, card, netbanking, etc.
      amount: paymentData.amount,
      currency: paymentData.currency,
      vpa: paymentData.vpa || null, // UPI ID used
      email: paymentData.email || null,
      contact: paymentData.contact || null,
      gatewayResponse: paymentData,
      createdAt: new Date().toISOString(),
    });

    // Update order status based on payment
    if (eventType === "payment.captured") {
      await adminDb.collection("orders").doc(orderId).update({
        status: "paid",
        paymentId: paymentId,
        updatedAt: new Date().toISOString(),
      });

      // Log success
      await adminDb.collection("activityLogs").add({
        action: "PAYMENT_SUCCESS",
        orderId,
        paymentId,
        timestamp: new Date().toISOString(),
      });
      
    } else if (eventType === "payment.failed") {
      await adminDb.collection("orders").doc(orderId).update({
        status: "payment_failed",
        paymentId: paymentId,
        updatedAt: new Date().toISOString(),
      });

      // Log failure
      await adminDb.collection("activityLogs").add({
        action: "PAYMENT_FAILURE",
        orderId,
        paymentId,
        reason: paymentData.error_description || "Unknown",
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });

  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ success: false, message: "Internal server error", error: error.message }, { status: 500 });
  }
}
