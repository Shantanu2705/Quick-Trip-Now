import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Basic validation
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const inquiryDoc = {
      ...data,
      createdAt: new Date().toISOString(),
      status: "new" // new, read, replied
    };

    const docRef = await adminDb.collection("inquiries").add(inquiryDoc);

    return NextResponse.json({ success: true, message: "Inquiry saved successfully", id: docRef.id });
  } catch (error: any) {
    console.error("Error saving inquiry:", error);
    return NextResponse.json({ success: false, message: "Failed to save inquiry", error: error.message }, { status: 500 });
  }
}
