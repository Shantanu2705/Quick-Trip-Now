import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

async function createUserHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, phone, role } = body;

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not configured' }, { status: 500 });
    }

    // Check if user already exists
    try {
      await adminAuth.getUserByEmail(email);
      return NextResponse.json({ success: false, message: 'User already exists' }, { status: 409 });
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

    // Admin created users are automatically approved
    const status = 'approved';

    const userDoc = {
      uid: userRecord.uid,
      email,
      fullName,
      phone: phone || null,
      role,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByAdmin: req.user?.uid,
    };

    // Store user in Firestore
    await adminDb.collection('users').doc(userRecord.uid).set(userDoc);
    
    // Log the action
    await adminDb.collection('auditLogs').add({
      action: 'ADMIN_CREATE_USER',
      adminId: req.user?.uid,
      userId: userRecord.uid,
      details: `Admin ${req.user?.email} created ${role} ${email}`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `${role} account created successfully`,
      data: {
        uid: userRecord.uid,
        email,
        status,
        role
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

export const POST = (req: NextRequest) => withAuth(req, createUserHandler, true);
