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
    if (!data.title || !data.destination || !data.duration || !data.image || !data.description) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    if (!data.seasonalPrices || !Array.isArray(data.seasonalPrices) || data.seasonalPrices.length === 0) {
      return NextResponse.json({ success: false, message: 'At least one seasonal price is required' }, { status: 400 });
    }

    // Validate seasonal prices
    for (const season of data.seasonalPrices) {
      if (!season.startDate || !season.endDate || !season.price) {
        return NextResponse.json({ success: false, message: 'All fields in seasonal pricing are required' }, { status: 400 });
      }
      if (new Date(season.endDate) < new Date(season.startDate)) {
        return NextResponse.json({ success: false, message: 'End date cannot be before start date in seasonal pricing' }, { status: 400 });
      }
      if (Number(season.price) <= 0) {
        return NextResponse.json({ success: false, message: 'Price must be greater than zero' }, { status: 400 });
      }
      season.price = Number(season.price);
    }

    data.days = Number(data.days) || 0;
    data.nights = Number(data.nights) || 0;

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
    if (!updateData.title || !updateData.destination || !updateData.duration || !updateData.image || !updateData.description) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    if (!updateData.seasonalPrices || !Array.isArray(updateData.seasonalPrices) || updateData.seasonalPrices.length === 0) {
      return NextResponse.json({ success: false, message: 'At least one seasonal price is required' }, { status: 400 });
    }

    // Validate seasonal prices
    for (const season of updateData.seasonalPrices) {
      if (!season.startDate || !season.endDate || !season.price) {
        return NextResponse.json({ success: false, message: 'All fields in seasonal pricing are required' }, { status: 400 });
      }
      if (new Date(season.endDate) < new Date(season.startDate)) {
        return NextResponse.json({ success: false, message: 'End date cannot be before start date in seasonal pricing' }, { status: 400 });
      }
      if (Number(season.price) <= 0) {
        return NextResponse.json({ success: false, message: 'Price must be greater than zero' }, { status: 400 });
      }
      season.price = Number(season.price);
    }

    updateData.days = Number(updateData.days) || 0;
    updateData.nights = Number(updateData.nights) || 0;

    // Remove old properties if they exist
    if ('price' in updateData) delete updateData.price;
    if ('pricePerChild' in updateData) delete updateData.pricePerChild;

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
