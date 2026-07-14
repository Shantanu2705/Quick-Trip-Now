import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

async function createVehicleHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();
    if (!data.name || !data.type || !data.image || !data.price) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();
    data.price = Number(data.price) || 0;
    data.seats = Number(data.seats) || 4;
    data.maxAdults = Number(data.maxAdults) || 4;
    data.maxChildren = Number(data.maxChildren) || 0;
    data.maxChildAge = Number(data.maxChildAge) || 12;
    data.ac = data.ac === true || data.ac === 'true';

    const docRef = await adminDb.collection('vehicles').add(data);
    
    return NextResponse.json({ success: true, message: 'Vehicle created', data: { id: docRef.id, ...data } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to create vehicle', error: error.message }, { status: 500 });
  }
}

async function getVehiclesHandler(req: AuthenticatedRequest) {
  try {
    const snapshot = await adminDb.collection("vehicles").orderBy("createdAt", "desc").get();
    const vehicles = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, data: vehicles });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch vehicles', error: error.message }, { status: 500 });
  }
}

async function updateVehicleHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    
    if (!id) return NextResponse.json({ success: false, message: 'Vehicle ID required' }, { status: 400 });
    if (!data.name || !data.type || !data.image || !data.price) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    updateData.updatedAt = new Date().toISOString();
    updateData.price = Number(data.price);
    updateData.seats = Number(data.seats) || 4;
    updateData.maxAdults = Number(data.maxAdults) || 4;
    updateData.maxChildren = Number(data.maxChildren) || 0;
    updateData.maxChildAge = Number(data.maxChildAge) || 12;
    updateData.ac = data.ac === true || data.ac === 'true';

    await adminDb.collection('vehicles').doc(id).update(updateData);
    
    return NextResponse.json({ success: true, message: 'Vehicle updated' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update vehicle', error: error.message }, { status: 500 });
  }
}

async function deleteVehicleHandler(req: AuthenticatedRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) return NextResponse.json({ success: false, message: 'Vehicle ID required' }, { status: 400 });

    await adminDb.collection('vehicles').doc(id).delete();
    
    return NextResponse.json({ success: true, message: 'Vehicle deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete vehicle', error: error.message }, { status: 500 });
  }
}

export const POST = (req: NextRequest) => withAuth(req, createVehicleHandler, true);
export const PUT = (req: NextRequest) => withAuth(req, updateVehicleHandler, true);
export const DELETE = (req: NextRequest) => withAuth(req, deleteVehicleHandler, true);
export const GET = (req: NextRequest) => withAuth(req, getVehiclesHandler, true);
