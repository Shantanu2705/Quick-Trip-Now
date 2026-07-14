import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

async function getSettingsHandler(req: AuthenticatedRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not configured' }, { status: 500 });
    }

    const doc = await adminDb.collection('settings').doc('platform').get();
    
    // Default settings if none exist
    const defaultSettings = {
      siteName: 'Quick Trip Now',
      contactEmail: 'support@quicktripnow.com',
      contactPhone: '+91 98765 43210',
      taxRate: 18,
      agentRegistrationEnabled: true,
      maintenanceMode: false,
      globalMaxChildAge: 12
    };

    const settings = doc.exists ? { ...defaultSettings, ...doc.data() } : defaultSettings;

    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    console.error('Get settings error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

async function updateSettingsHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();

    if (!adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not configured' }, { status: 500 });
    }

    await adminDb.collection('settings').doc('platform').set({
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update settings', error: error.message }, { status: 500 });
  }
}

export const GET = (req: NextRequest) => withAuth(req, getSettingsHandler, true);
export const POST = (req: NextRequest) => withAuth(req, updateSettingsHandler, true);
