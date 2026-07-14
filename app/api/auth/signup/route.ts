import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName, phone, role: reqRole } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json({ success: false, message: 'Missing required fields', error: 'VALIDATION_ERROR' }, { status: 400 });
    }

    // Check if user already exists
    try {
      await adminAuth.getUserByEmail(email);
      return NextResponse.json({ success: false, message: 'User already exists', error: 'USER_EXISTS' }, { status: 409 });
    } catch (e: any) {
      if (e.code !== 'auth/user-not-found') {
        throw e;
      }
    }

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: fullName,
      phoneNumber: phone || undefined,
    });

    // Determine initial role (if it's the first user ever, maybe make them admin? The prompt asks for this)
    // Let's check if there are any admins. If not, this is the first user.
    const adminsSnapshot = await adminDb.collection('users').where('role', '==', 'admin').limit(1).get();
    const isFirstUser = adminsSnapshot.empty;
    
    let role = isFirstUser ? 'admin' : 'user';
    let status = isFirstUser ? 'approved' : 'approved';

    if (!isFirstUser && reqRole === 'agent') {
      role = 'agent';
      status = 'pending';
    }

    const userDoc = {
      uid: userRecord.uid,
      email,
      fullName,
      phone: phone || null,
      role,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store user in Firestore
    await adminDb.collection('users').doc(userRecord.uid).set(userDoc);
    
    // Log the action
    await adminDb.collection('auditLogs').add({
      action: 'USER_SIGNUP',
      userId: userRecord.uid,
      details: `User ${email} signed up with status ${status}`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Signup successful',
      data: {
        uid: userRecord.uid,
        email,
        status,
        role
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
