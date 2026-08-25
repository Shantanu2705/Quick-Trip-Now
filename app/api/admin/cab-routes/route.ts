import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

async function createCabRouteHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();
    
    if (!data.title || !data.packageId) {
      return NextResponse.json({ success: false, message: 'Missing required fields: title or packageId' }, { status: 400 });
    }

    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();

    const docRef = await adminDb.collection('cab_routes').add(data);
    
    return NextResponse.json({ success: true, message: 'Private transfer created', data: { id: docRef.id, ...data } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to create private transfer', error: error.message }, { status: 500 });
  }
}

async function getCabRoutesHandler(req: AuthenticatedRequest) {
  try {
    const snapshot = await adminDb.collection('cab_routes').get();
    const routes = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, data: routes });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch private transfers', error: error.message }, { status: 500 });
  }
}

async function updateCabRouteHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    
    if (!id) return NextResponse.json({ success: false, message: 'Private Transfer ID required' }, { status: 400 });

    if (!updateData.title || !updateData.packageId) {
      return NextResponse.json({ success: false, message: 'Missing required fields: title or packageId' }, { status: 400 });
    }

    updateData.updatedAt = new Date().toISOString();

    await adminDb.collection('cab_routes').doc(id).update(updateData);
    
    return NextResponse.json({ success: true, message: 'Private transfer updated' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update private transfer', error: error.message }, { status: 500 });
  }
}

async function deleteCabRouteHandler(req: AuthenticatedRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) return NextResponse.json({ success: false, message: 'Cab Route ID required' }, { status: 400 });

    await adminDb.collection('cab_routes').doc(id).delete();
    
    return NextResponse.json({ success: true, message: 'Private transfer deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete private transfer', error: error.message }, { status: 500 });
  }
}

export const POST = (req: NextRequest) => withAuth(req, createCabRouteHandler, true);
export const PUT = (req: NextRequest) => withAuth(req, updateCabRouteHandler, true);
export const DELETE = (req: NextRequest) => withAuth(req, deleteCabRouteHandler, true);
export const GET = (req: NextRequest) => withAuth(req, getCabRoutesHandler, true);
