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

export const GET = (req: NextRequest) => withAuth(req, sessionHandler);
