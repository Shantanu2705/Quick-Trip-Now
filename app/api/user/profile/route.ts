import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

async function getUserProfileHandler(req: AuthenticatedRequest) {
  try {
    const userId = req.user.uid;
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { id: userDoc.id, ...userDoc.data() }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

async function updateUserProfileHandler(req: AuthenticatedRequest) {
  try {
    const userId = req.user.uid;
    const data = await req.json();
    
    const { fullName, phone, newPassword } = data;
    
    // First, verify the user's role
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    
    const userData = userDoc.data();
    const isAgent = userData.role === 'agent';
    
    const updates: any = {};
    if (fullName !== undefined) updates.fullName = fullName;
    if (phone !== undefined) updates.phone = phone;
    
    // Handle password update
    if (newPassword) {
      if (isAgent) {
        return NextResponse.json({ success: false, message: 'Agents cannot change their password. Please contact an admin.' }, { status: 403 });
      }
      
      if (newPassword.length < 6) {
        return NextResponse.json({ success: false, message: 'Password must be at least 6 characters' }, { status: 400 });
      }
      
      // Update Firebase Auth
      await adminAuth.updateUser(userId, { password: newPassword });
      
      // Update Firestore so admin can see it
      updates.password = newPassword;
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date().toISOString();
      await adminDb.collection('users').doc(userId).update(updates);
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update profile', error: error.message }, { status: 500 });
  }
}

export const GET = (req: NextRequest) => withAuth(req, getUserProfileHandler, false);
export const PUT = (req: NextRequest) => withAuth(req, updateUserProfileHandler, false);
