import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

async function updatePasswordHandler(req: AuthenticatedRequest, context: { params: Promise<{ uid: string }> }) {
  try {
    const { uid } = await context.params;
    const body = await req.json();
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not configured' }, { status: 500 });
    }

    // Update user in Firebase Auth
    await adminAuth.updateUser(uid, {
      password: newPassword,
    });

    // Update password in Firestore
    await adminDb.collection('users').doc(uid).update({
      password: newPassword,
      updatedAt: new Date().toISOString(),
    });
    
    // Log the action
    await adminDb.collection('auditLogs').add({
      action: 'ADMIN_UPDATE_PASSWORD',
      adminId: req.user?.uid,
      userId: uid,
      details: `Admin ${req.user?.email} updated password for user ${uid}`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error: any) {
    console.error('Update password error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

export const POST = (req: NextRequest, context: { params: Promise<{ uid: string }> }) => withAuth(req, (r) => updatePasswordHandler(r, context), true);
