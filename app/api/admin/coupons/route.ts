import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

async function listCouponsHandler(req: AuthenticatedRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not configured' }, { status: 500 });
    }
    
    const snapshot = await adminDb.collection('coupons').get();
    let coupons = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    // Sort by created date descending in memory
    coupons.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ success: true, data: coupons });
  } catch (error: any) {
    console.error('List coupons error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

async function createCouponHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { code, discountPercentage } = body;

    if (!code || !discountPercentage) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not configured' }, { status: 500 });
    }

    // Check if code already exists
    const existing = await adminDb.collection('coupons').where('code', '==', code).get();
    if (!existing.empty) {
      return NextResponse.json({ success: false, message: 'Coupon code already exists' }, { status: 400 });
    }

    const coupon = {
      code: code.toUpperCase(),
      discountPercentage: Number(discountPercentage),
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const docRef = await adminDb.collection('coupons').add(coupon);

    return NextResponse.json({ success: true, data: { id: docRef.id, ...coupon } });
  } catch (error: any) {
    console.error('Create coupon error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

async function deleteCouponHandler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not configured' }, { status: 500 });
    }

    await adminDb.collection('coupons').doc(id).delete();

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error: any) {
    console.error('Delete coupon error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete coupon', error: error.message }, { status: 500 });
  }
}

async function toggleCouponHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not configured' }, { status: 500 });
    }

    await adminDb.collection('coupons').doc(id).update({ isActive, updatedAt: new Date().toISOString() });

    return NextResponse.json({ success: true, message: 'Coupon updated successfully' });
  } catch (error: any) {
    console.error('Update coupon error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update coupon', error: error.message }, { status: 500 });
  }
}

export const GET = (req: NextRequest) => withAuth(req, listCouponsHandler, true);
export const POST = (req: NextRequest) => withAuth(req, createCouponHandler, true);
export const DELETE = (req: NextRequest) => withAuth(req, deleteCouponHandler, true);
export const PUT = (req: NextRequest) => withAuth(req, toggleCouponHandler, true);
