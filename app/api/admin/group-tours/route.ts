import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

async function createGroupTourHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();

    // Auto-generate slug if missing
    if (!data.slug && data.title) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();

    // Validation
    if (!data.title || !data.destination || !data.description || data.price === undefined) {
      return NextResponse.json({ success: false, message: 'Missing required fields (title, destination, description, price)' }, { status: 400 });
    }

    data.price = Number(data.price) || 0;
    data.childPrice = Number(data.childPrice) || 0;
    data.gstPercentage = Number(data.gstPercentage) || 0;
    data.days = Number(data.days) || 0;
    data.nights = Number(data.nights) || 0;
    if (data.maxAdults) data.maxAdults = Number(data.maxAdults);
    if (data.maxChildren) data.maxChildren = Number(data.maxChildren);
    if (data.maxInfants) data.maxInfants = Number(data.maxInfants);
    if (data.rating) data.rating = Number(data.rating);
    if (data.reviews) data.reviews = Number(data.reviews);

    if (data.personPricing && Array.isArray(data.personPricing)) {
      data.personPricing = data.personPricing
        .map((p: any) => ({
          persons: Number(p.persons) || 1,
          price: Number(p.price) || 0
        }))
        .filter((p: any) => p.persons > 0 && p.price > 0)
        .sort((a: any, b: any) => a.persons - b.persons);
    } else {
      data.personPricing = [];
    }

    if (data.termsAndConditions && !data.terms) {
      data.terms = data.termsAndConditions;
    }

    const docRef = await adminDb.collection('group_tours').add(data);

    return NextResponse.json({
      success: true,
      message: 'Group tour created successfully',
      data: { id: docRef.id, ...data }
    });
  } catch (error: any) {
    console.error('Create group tour error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create group tour', error: error.message }, { status: 500 });
  }
}

async function getGroupToursHandler(req: AuthenticatedRequest) {
  try {
    const snapshot = await adminDb.collection('group_tours').get();
    const tours = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: tours });
  } catch (error: any) {
    console.error('Fetch group tours error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch group tours', error: error.message }, { status: 500 });
  }
}

async function updateGroupTourHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Group tour ID is required' }, { status: 400 });
    }

    updateData.updatedAt = new Date().toISOString();

    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.childPrice !== undefined) updateData.childPrice = Number(updateData.childPrice);
    if (updateData.gstPercentage !== undefined) updateData.gstPercentage = Number(updateData.gstPercentage);
    if (updateData.days !== undefined) updateData.days = Number(updateData.days);
    if (updateData.nights !== undefined) updateData.nights = Number(updateData.nights);
    if (updateData.maxAdults !== undefined) updateData.maxAdults = Number(updateData.maxAdults);
    if (updateData.maxChildren !== undefined) updateData.maxChildren = Number(updateData.maxChildren);
    if (updateData.maxInfants !== undefined) updateData.maxInfants = Number(updateData.maxInfants);
    if (updateData.rating !== undefined) updateData.rating = Number(updateData.rating);
    if (updateData.reviews !== undefined) updateData.reviews = Number(updateData.reviews);

    if (updateData.personPricing !== undefined) {
      if (Array.isArray(updateData.personPricing)) {
        updateData.personPricing = updateData.personPricing
          .map((p: any) => ({
            persons: Number(p.persons) || 1,
            price: Number(p.price) || 0
          }))
          .filter((p: any) => p.persons > 0 && p.price > 0)
          .sort((a: any, b: any) => a.persons - b.persons);
      } else {
        updateData.personPricing = [];
      }
    }

    if (updateData.termsAndConditions) {
      updateData.terms = updateData.termsAndConditions;
    }

    await adminDb.collection('group_tours').doc(id).update(updateData);

    return NextResponse.json({ success: true, message: 'Group tour updated successfully' });
  } catch (error: any) {
    console.error('Update group tour error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update group tour', error: error.message }, { status: 500 });
  }
}

async function deleteGroupTourHandler(req: AuthenticatedRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Group tour ID required' }, { status: 400 });
    }

    await adminDb.collection('group_tours').doc(id).delete();

    return NextResponse.json({ success: true, message: 'Group tour deleted successfully' });
  } catch (error: any) {
    console.error('Delete group tour error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete group tour', error: error.message }, { status: 500 });
  }
}

export const POST = (req: NextRequest) => withAuth(req, createGroupTourHandler, true);
export const PUT = (req: NextRequest) => withAuth(req, updateGroupTourHandler, true);
export const DELETE = (req: NextRequest) => withAuth(req, deleteGroupTourHandler, true);
export const GET = (req: NextRequest) => withAuth(req, getGroupToursHandler, true);
