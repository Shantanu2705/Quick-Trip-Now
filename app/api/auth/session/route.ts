import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

async function sessionHandler(req: AuthenticatedRequest) {
  // If the middleware didn't throw an error, it means the user's token is valid
  // and their status is approved (or they are an admin).
  return NextResponse.json({
    success: true,
    message: 'Session valid',
    data: {
      user: req.user
    }
  });
}

export const GET = async (req: NextRequest) => {
  try {
    return await withAuth(req, sessionHandler);
  } catch (error: any) {
    console.error("Critical Route Handler Error:", error);
    return NextResponse.json({ success: false, message: "Critical Error", error: error.message }, { status: 500 });
  }
};
