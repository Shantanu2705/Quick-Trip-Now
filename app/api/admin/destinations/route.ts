import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

async function listDestinationsHandler(req: AuthenticatedRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not configured' }, { status: 500 });
    }

    const snapshot = await adminDb.collection('destinations').orderBy('name', 'asc').get();
    const destinations = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      data: destinations
    });
  } catch (error: any) {
    console.error('List destinations error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

async function createDestinationHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();
    if (!data.name || !data.slug || !data.image) {
      return NextResponse.json({ success: false, message: 'Name, slug, and image are required' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not configured' }, { status: 500 });
    }

    const newDest = {
      name: data.name,
      slug: data.slug,
      image: data.image,
      description: data.description || '',
      createdAt: new Date().toISOString()
    };

    const docRef = await adminDb.collection('destinations').add(newDest);

    return NextResponse.json({ success: true, data: { id: docRef.id, ...newDest } });
  } catch (error: any) {
    console.error('Create destination error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create destination', error: error.message }, { status: 500 });
  }
}

async function updateDestinationHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json({ success: false, message: 'Destination ID is required' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not configured' }, { status: 500 });
    }

    await adminDb.collection('destinations').doc(id).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: 'Destination updated successfully' });
  } catch (error: any) {
    console.error('Update destination error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update destination', error: error.message }, { status: 500 });
  }
}

async function deleteDestinationHandler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Destination ID required' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not configured' }, { status: 500 });
    }

    await adminDb.collection('destinations').doc(id).delete();

    return NextResponse.json({ success: true, message: 'Destination deleted successfully' });
  } catch (error: any) {
    console.error('Delete destination error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete destination', error: error.message }, { status: 500 });
  }
}

export const GET = (req: NextRequest) => withAuth(req, listDestinationsHandler, true);
export const POST = (req: NextRequest) => withAuth(req, createDestinationHandler, true);
export const PUT = (req: NextRequest) => withAuth(req, updateDestinationHandler, true);
export const DELETE = (req: NextRequest) => withAuth(req, deleteDestinationHandler, true);
