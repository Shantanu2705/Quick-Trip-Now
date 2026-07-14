import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    let role = 'user';
    
    // Attempt to parse body for role (it might be empty)
    try {
      const bodyText = await req.text();
      if (bodyText) {
        const body = JSON.parse(bodyText);
        if (body.role === 'agent') role = 'agent';
      }
    } catch (e) {
      // Ignore parse errors
    }

    // Check if user exists in Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      // Create user document for OAuth users
      await adminDb.collection('users').doc(uid).set({
        uid,
        email: email || '',
        fullName: name || 'User',
        photoURL: picture || '',
        role,
        status: role === 'agent' ? 'pending' : 'approved',

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Log the action
      await adminDb.collection('auditLogs').add({
        action: 'OAUTH_SIGNUP',
        userId: uid,
        details: `User ${email} signed up via OAuth`,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, message: 'OAuth user synced' });
  } catch (error: any) {
    console.error('OAuth sync error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
