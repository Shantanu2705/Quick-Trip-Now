import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

async function updateStatusHandler(
  req: AuthenticatedRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = await params;
    const body = await req.json();
    const { status, reason, discountPercentage } = body;

    const validStatuses = ['approved', 'rejected', 'blocked', 'disabled', 'pending'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }

    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
      lastStatusReason: reason || null
    };

    if (discountPercentage !== undefined) {
      updateData.discountPercentage = Number(discountPercentage);
    }

    // Update Firestore
    await userRef.update(updateData);

    // Optionally update Firebase Auth disabled status
    if (status === 'blocked' || status === 'disabled' || status === 'rejected') {
      await adminAuth.updateUser(uid, { disabled: true }).catch(console.error);
    } else if (status === 'approved') {
      await adminAuth.updateUser(uid, { disabled: false }).catch(console.error);
    }

    // Log action
    await adminDb.collection('auditLogs').add({
      action: 'UPDATE_USER_STATUS',
      adminId: req.user?.uid,
      targetUserId: uid,
      details: `User status changed to ${status}${reason ? ' Reason: ' + reason : ''}`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `User status updated to ${status}`
    });

  } catch (error: any) {
    console.error('Update status error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

export const POST = (req: NextRequest, ctx: any) => withAuth(req, (authReq) => updateStatusHandler(authReq, ctx), true);
