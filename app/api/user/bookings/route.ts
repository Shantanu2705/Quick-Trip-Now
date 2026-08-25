import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

async function userBookingsHandler(req: AuthenticatedRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not configured' }, { status: 500 });
    }

    const userId = req.user.uid;
    
    // Fetch bookings for this specific user
    const snapshot = await adminDb.collection('bookings')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
      
    const bookings = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      data: bookings
    });
  } catch (error: any) {
    console.error('List user bookings error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

export const GET = (req: NextRequest) => withAuth(req, userBookingsHandler, false); // false = not requiring admin
