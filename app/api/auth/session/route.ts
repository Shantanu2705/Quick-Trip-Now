import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest) => {
  return NextResponse.json({
    success: true,
    message: 'Session valid (Bypassed)',
    data: {
      user: {
        uid: "test-uid",
        email: "admin@quicktrip.com",
        role: "admin",
        status: "approved"
      }
    }
  });
};
