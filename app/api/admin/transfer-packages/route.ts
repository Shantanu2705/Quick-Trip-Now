import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

async function createTransferPackageHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();

    if (!data.title) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();

    const docRef = await adminDb.collection('transfer_packages').add(data);

    return NextResponse.json({ success: true, message: 'Transfer Package created', data: { id: docRef.id, ...data } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to create transfer package', error: error.message }, { status: 500 });
  }
}

async function getTransferPackagesHandler(req: AuthenticatedRequest) {
  try {
    const snapshot = await adminDb.collection('transfer_packages').get();
    const packages = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: packages });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch transfer packages', error: error.message }, { status: 500 });
  }
}

async function updateTransferPackageHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    
    if (!id) return NextResponse.json({ success: false, message: 'Package ID required' }, { status: 400 });

    if (!updateData.title) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    updateData.updatedAt = new Date().toISOString();

    await adminDb.collection('transfer_packages').doc(id).update(updateData);

    return NextResponse.json({ success: true, message: 'Transfer Package updated' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update transfer package', error: error.message }, { status: 500 });
  }
}

async function deleteTransferPackageHandler(req: AuthenticatedRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) return NextResponse.json({ success: false, message: 'Package ID required' }, { status: 400 });

    await adminDb.collection('transfer_packages').doc(id).delete();

    // Optionally delete all cab_routes under this package, or leave them orphaned
    // We'll leave them for now.

    return NextResponse.json({ success: true, message: 'Transfer Package deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete transfer package', error: error.message }, { status: 500 });
  }
}

export const POST = (req: NextRequest) => withAuth(req, createTransferPackageHandler, true);
export const PUT = (req: NextRequest) => withAuth(req, updateTransferPackageHandler, true);
export const DELETE = (req: NextRequest) => withAuth(req, deleteTransferPackageHandler, true);
export const GET = (req: NextRequest) => withAuth(req, getTransferPackagesHandler, true);
