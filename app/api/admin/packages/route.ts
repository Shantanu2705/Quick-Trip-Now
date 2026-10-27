import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

import { revalidatePath } from 'next/cache';

async function createPackageHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();
    
    // Auto-generate slug
    if (!data.slug) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();

    // Validate required fields
    const missingCreate: string[] = [];
    if (!data.title) missingCreate.push('Package Name');
    if (!data.destination) missingCreate.push('Destination');
    if (!data.duration) missingCreate.push('Duration');
    if (!data.image) missingCreate.push('Cover Image');
    if (!data.description) missingCreate.push('Description');
    if (missingCreate.length > 0) {
      return NextResponse.json({ success: false, message: `Missing required fields: ${missingCreate.join(', ')}` }, { status: 400 });
    }

    if (data.maxAdults) data.maxAdults = Number(data.maxAdults);
    if (data.maxChildren) data.maxChildren = Number(data.maxChildren);
    if (data.maxInfants) data.maxInfants = Number(data.maxInfants);

    data.days = Number(data.days) || 0;
    data.nights = Number(data.nights) || 0;

    if (data.price !== undefined) data.price = Number(data.price) || 0;
    if (data.childPrice !== undefined) data.childPrice = Number(data.childPrice) || 0;
    if (data.termsAndConditions || data.terms) {
      data.terms = data.termsAndConditions || data.terms || '';
      data.termsAndConditions = data.terms;
    }

    const docRef = await adminDb.collection('packages').add(data);
    
    // revalidatePath('/', 'layout'); // Removed to prevent hanging in Next.js dev server

    return NextResponse.json({ success: true, message: 'Package created', data: { id: docRef.id, ...data } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to create package', error: error.message }, { status: 500 });
  }
}

async function getPackagesHandler(req: AuthenticatedRequest) {
  try {
    const snapshot = await adminDb.collection('packages').get();
    const packages = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: packages });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch packages', error: error.message }, { status: 500 });
  }
}

async function updatePackageHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    
    if (!id) return NextResponse.json({ success: false, message: 'Package ID required' }, { status: 400 });

    updateData.updatedAt = new Date().toISOString();
    
    // Validate required fields
    const missingUpdate: string[] = [];
    if (!updateData.title) missingUpdate.push('Package Name');
    if (!updateData.destination) missingUpdate.push('Destination');
    if (!updateData.duration) missingUpdate.push('Duration');
    if (!updateData.image) missingUpdate.push('Cover Image');
    if (!updateData.description) missingUpdate.push('Description');
    if (missingUpdate.length > 0) {
      return NextResponse.json({ success: false, message: `Missing required fields: ${missingUpdate.join(', ')}` }, { status: 400 });
    }

    if (updateData.maxAdults) updateData.maxAdults = Number(updateData.maxAdults);
    if (updateData.maxChildren) updateData.maxChildren = Number(updateData.maxChildren);
    if (updateData.maxInfants) updateData.maxInfants = Number(updateData.maxInfants);

    updateData.days = Number(updateData.days) || 0;
    updateData.nights = Number(updateData.nights) || 0;

    if (updateData.price !== undefined) updateData.price = Number(updateData.price) || 0;
    if (updateData.childPrice !== undefined) updateData.childPrice = Number(updateData.childPrice) || 0;
    if (updateData.termsAndConditions || updateData.terms) {
      updateData.terms = updateData.termsAndConditions || updateData.terms || '';
      updateData.termsAndConditions = updateData.terms;
    }

    await adminDb.collection('packages').doc(id).update(updateData);
    
    // revalidatePath('/', 'layout'); // Removed to prevent hanging in Next.js dev server

    return NextResponse.json({ success: true, message: 'Package updated' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update package', error: error.message }, { status: 500 });
  }
}

async function deletePackageHandler(req: AuthenticatedRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) return NextResponse.json({ success: false, message: 'Package ID required' }, { status: 400 });

    await adminDb.collection('packages').doc(id).delete();
    
    // revalidatePath('/', 'layout'); // Removed to prevent hanging in Next.js dev server

    return NextResponse.json({ success: true, message: 'Package deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete package', error: error.message }, { status: 500 });
  }
}

export const POST = (req: NextRequest) => withAuth(req, createPackageHandler, true);
export const PUT = (req: NextRequest) => withAuth(req, updatePackageHandler, true);
export const DELETE = (req: NextRequest) => withAuth(req, deletePackageHandler, true);
export const GET = (req: NextRequest) => withAuth(req, getPackagesHandler, true);
