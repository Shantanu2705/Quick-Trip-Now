import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, AuthenticatedRequest } from "@/lib/auth-middleware";

async function getInquiriesHandler(req: AuthenticatedRequest) {
  try {
    const snapshot = await adminDb.collection("inquiries").orderBy("createdAt", "desc").get();
    const inquiries = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: inquiries });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Failed to fetch inquiries", error: error.message }, { status: 500 });
  }
}

async function updateInquiryHandler(req: AuthenticatedRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "Inquiry ID required" }, { status: 400 });

    const data = await req.json();
    await adminDb.collection("inquiries").doc(id).update(data);
    return NextResponse.json({ success: true, message: "Inquiry updated" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Failed to update inquiry", error: error.message }, { status: 500 });
  }
}

async function deleteInquiryHandler(req: AuthenticatedRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "Inquiry ID required" }, { status: 400 });

    await adminDb.collection("inquiries").doc(id).delete();
    return NextResponse.json({ success: true, message: "Inquiry deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Failed to delete inquiry", error: error.message }, { status: 500 });
  }
}

export const GET = (req: NextRequest) => withAuth(req, getInquiriesHandler, true);
export const PUT = (req: NextRequest) => withAuth(req, updateInquiryHandler, true);
export const DELETE = (req: NextRequest) => withAuth(req, deleteInquiryHandler, true);
