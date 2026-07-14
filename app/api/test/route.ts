import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET() {
  const isLoaded = !!adminAuth;
  return NextResponse.json({ success: true, message: `API is working. Firebase Admin loaded: ${isLoaded}` });
}
