import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from './firebase-admin';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    uid: string;
    email: string;
    role?: string;
    status?: string;
  };
}

export async function withAuth(
  req: NextRequest,
  handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse> | NextResponse,
  requireAdmin: boolean = false
) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized', error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Fetch user from Firestore to check status and role
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ success: false, message: 'Unauthorized', error: 'User not found in database' }, { status: 401 });
    }

    const userData = userDoc.data();
    const status = userData?.status;
    const role = userData?.role;

    // Strict status checking
    if (status === 'pending') {
      return NextResponse.json({ success: false, message: 'Account pending approval', error: 'PENDING_APPROVAL' }, { status: 403 });
    }
    if (status === 'rejected' || status === 'blocked' || status === 'disabled' || status === 'deleted') {
      return NextResponse.json({ success: false, message: 'Account access denied', error: 'ACCOUNT_DISABLED' }, { status: 403 });
    }
    if (status !== 'approved' && role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Account not approved', error: 'NOT_APPROVED' }, { status: 403 });
    }

    if (requireAdmin && role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden', error: 'Admin access required' }, { status: 403 });
    }

    // Attach user to request (using a custom property or modifying request is tricky in Next.js App Router, so we pass it differently)
    const authReq = req as AuthenticatedRequest;
    authReq.user = {
      uid,
      email: decodedToken.email || '',
      role,
      status
    };

    return handler(authReq);

  } catch (error: any) {
    console.error('Auth middleware error:', error);
    return NextResponse.json({ success: false, message: 'Unauthorized', error: error.message }, { status: 401 });
  }
}
