import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

// GET all notifications for a user
async function getNotificationsHandler(req: AuthenticatedRequest) {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not configured' }, { status: 500 });
    }

    const snapshot = await adminDb.collection('notifications')
      .where('userId', '==', userId)
      .get();
      
    let notifications = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    // Sort by created date descending in memory
    notifications.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (error: any) {
    console.error('List notifications error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// PUT to mark a notification as read
async function markNotificationReadHandler(req: AuthenticatedRequest) {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json({ success: false, message: 'Notification ID required' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not configured' }, { status: 500 });
    }

    const docRef = adminDb.collection('notifications').doc(notificationId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ success: false, message: 'Notification not found' }, { status: 404 });
    }

    if (doc.data()?.userId !== userId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await docRef.update({ isRead: true });

    return NextResponse.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    console.error('Update notification error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

export const GET = (req: NextRequest) => withAuth(req, getNotificationsHandler);
export const PUT = (req: NextRequest) => withAuth(req, markNotificationReadHandler);
