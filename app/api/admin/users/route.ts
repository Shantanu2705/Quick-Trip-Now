import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

async function listUsersHandler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const role = searchParams.get('role');

    if (!adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not configured' }, { status: 500 });
    }

    let query: any = adminDb.collection('users');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (role) {
      query = query.where('role', '==', role);
    }
    
    const snapshot = await query.get();
    let users = snapshot.docs.map((doc: any) => doc.data());

    // Sort by created date descending in memory to avoid requiring a composite index
    users.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      data: users
    });
  } catch (error: any) {
    console.error('List users error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

async function deleteUserHandler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ success: false, message: 'UID required' }, { status: 400 });
    }

    if (!adminDb || !adminAuth) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not configured' }, { status: 500 });
    }

    // Delete from Firestore
    await adminDb.collection('users').doc(uid).delete();
    
    // Delete from Firebase Auth
    await adminAuth.deleteUser(uid);

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete user', error: error.message }, { status: 500 });
  }
}

export const GET = (req: NextRequest) => withAuth(req, listUsersHandler, true);
export const DELETE = (req: NextRequest) => withAuth(req, deleteUserHandler, true);
