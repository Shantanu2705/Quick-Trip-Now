import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

async function getUserDashboardHandler(req: AuthenticatedRequest) {
  try {
    const userId = req.user?.uid;
    if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const bookingsSnapshot = await adminDb.collection('bookings')
      .where('userId', '==', userId)
      .get();
    
    const bookings = bookingsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    bookings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const couponsSnapshot = await adminDb.collection('coupons')
      .where('targetUserId', '==', userId)
      .get();
      
    const coupons = couponsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, bookings, coupons });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch dashboard data', error: error.message }, { status: 500 });
  }
}

export const GET = (req: NextRequest) => withAuth(req, getUserDashboardHandler, false);
