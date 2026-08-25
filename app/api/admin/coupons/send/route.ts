import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

async function sendCouponNotificationHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { couponCode, minTrips, discountPercentage } = body;

    if (!couponCode) {
      return NextResponse.json({ success: false, message: 'Coupon code is required' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not configured' }, { status: 500 });
    }

    // 1. Fetch all users
    const usersSnapshot = await adminDb.collection('users').where('role', '==', 'user').get();
    let eligibleUserIds = usersSnapshot.docs.map((doc: any) => doc.id);

    // 2. If minTrips > 0, filter by bookings
    const minTripsNum = Number(minTrips) || 0;
    if (minTripsNum > 0) {
      const bookingsSnapshot = await adminDb.collection('bookings').get();
      const bookingCounts: Record<string, number> = {};
      
      bookingsSnapshot.docs.forEach((doc: any) => {
        const data = doc.data();
        if (data.userId) {
          bookingCounts[data.userId] = (bookingCounts[data.userId] || 0) + 1;
        }
      });

      eligibleUserIds = eligibleUserIds.filter(uid => (bookingCounts[uid] || 0) >= minTripsNum);
    }

    // 3. Create notifications
    const batch = adminDb.batch();
    const createdAt = new Date().toISOString();
    let sentCount = 0;

    for (const uid of eligibleUserIds) {
      const notificationRef = adminDb.collection('notifications').doc();
      batch.set(notificationRef, {
        userId: uid,
        title: 'New Coupon Available!',
        message: `You've received a special coupon code: ${couponCode.toUpperCase()}. Apply it at checkout to get ${discountPercentage || 'a'}% off your next trip!`,
        isRead: false,
        createdAt
      });
      sentCount++;
    }

    if (sentCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({ 
      success: true, 
      message: `Coupon sent successfully to ${sentCount} users.`,
      sentCount 
    });
  } catch (error: any) {
    console.error('Send coupon error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

export const POST = (req: NextRequest) => withAuth(req, sendCouponNotificationHandler, true);
