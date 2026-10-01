import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: Request) {
  try {
    const db = adminDb;
    const snapshot = await db.collection("howToUse").orderBy("createdAt", "desc").get();
    const items = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    console.error("Error fetching how-to-use items:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const db = adminDb;
    
    if (!data.title || !data.videoUrl) {
      return NextResponse.json({ success: false, message: "Title and Video URL are required" }, { status: 400 });
    }

    const docRef = await db.collection("howToUse").add({
      title: data.title,
      videoUrl: data.videoUrl,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, data: { id: docRef.id, ...data } });
  } catch (error: any) {
    console.error("Error adding how-to-use item:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    const db = adminDb;
    await db.collection("howToUse").doc(id).delete();
    
    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting how-to-use item:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
