import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { code, userId } = await req.json();

    if (!code || !userId) {
      return NextResponse.json({ success: false, message: 'Coupon code and user ID are required.' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase not configured' }, { status: 500 });
    }

    // 1. Fetch coupon
    const couponSnapshot = await adminDb.collection('coupons').where('code', '==', code.toUpperCase()).get();
    
    if (couponSnapshot.empty) {
      return NextResponse.json({ success: false, message: 'Invalid coupon code.' }, { status: 400 });
    }

    const couponDoc = couponSnapshot.docs[0];
    const coupon = couponDoc.data();

    // 2. Check if active
    if (!coupon.isActive) {
      return NextResponse.json({ success: false, message: 'This coupon is no longer active.' }, { status: 400 });
    }

    // 3. Check target user
    if (coupon.targetUserId !== userId) {
      return NextResponse.json({ success: false, message: 'This coupon is not valid for your account.' }, { status: 400 });
    }

    // 4. Check if already used
    const userSnapshot = await adminDb.collection('users').doc(userId).get();
    if (userSnapshot.exists) {
      const userData = userSnapshot.data();
      if (userData?.usedCoupons?.includes(coupon.code)) {
        return NextResponse.json({ success: false, message: 'You have already used this coupon.' }, { status: 400 });
      }
    }

    // 5. Check minimum bookings
    const minBookings = coupon.minBookingsRequired || 2;
    if (minBookings > 0) {
      const bookingsSnapshot = await adminDb.collection('bookings').where('userId', '==', userId).get();
      if (bookingsSnapshot.size < minBookings) {
        return NextResponse.json({ 
          success: false, 
          message: `This coupon requires at least ${minBookings} completed bookings.` 
        }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      discountPercentage: coupon.discountPercentage 
    });

  } catch (error: any) {
    console.error('Validate coupon error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
