import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

async function userBookingsHandler(req: AuthenticatedRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not configured' }, { status: 500 });
    }

    if (!req.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
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

async function updateBookingHandler(req: AuthenticatedRequest) {
  try {
    if (!adminDb) return NextResponse.json({ success: false, message: 'Firebase Admin not configured' }, { status: 500 });
    if (!req.user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'Missing booking ID' }, { status: 400 });

    const body = await req.json();
    const { pendingAmount, paidAmount, status } = body;

    const docRef = adminDb.collection('bookings').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    if (doc.data()?.userId !== req.user.uid) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });

    await docRef.update({
      pendingAmount: pendingAmount !== undefined ? pendingAmount : doc.data()?.pendingAmount,
      paidAmount: paidAmount !== undefined ? paidAmount : doc.data()?.paidAmount,
      status: status || doc.data()?.status,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update booking error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

export const GET = (req: NextRequest) => withAuth(req, userBookingsHandler, false); // false = not requiring admin
export const PUT = (req: NextRequest) => withAuth(req, updateBookingHandler, false);
