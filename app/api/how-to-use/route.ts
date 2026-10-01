import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: Request) {
  try {
    const db = adminDb;
    const snapshot = await db.collection("howToUse").orderBy("createdAt", "desc").get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    console.error("Error fetching how-to-use items:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
