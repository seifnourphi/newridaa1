import { NextRequest, NextResponse } from 'next/server';
import { verifyJWTFromRequestAsync } from '@/lib/jwt-validator';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Helper function to verify user token
async function verifyUserToken(request: NextRequest) {
  return await verifyJWTFromRequestAsync(request);
}

// POST /api/auth/mfa/toggle - Toggle MFA (enable/disable)
export async function POST(request: NextRequest) {
  try {
    const userToken = await verifyUserToken(request);
    
    if (!userToken || !userToken.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized'
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const cookie = request.headers.get('cookie');
    const authHeader = request.headers.get('authorization');
    
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (cookie) {
        headers['Cookie'] = cookie;
      }
      
      if (authHeader) {
        headers['Authorization'] = authHeader;
      }
      
      // Call backend MFA toggle endpoint
      const mfaResponse = await fetch(`${BACKEND_URL}/api/auth/mfa/toggle`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        credentials: 'include',
      });

      const mfaData = await mfaResponse.json();
      
      if (mfaResponse.ok) {
        return NextResponse.json(mfaData);
      } else {
        return NextResponse.json(
          {
            success: false,
            error: mfaData.error || 'Failed to toggle MFA'
          },
          { status: mfaResponse.status }
        );
      }
    } catch (err) {
      console.error('Error toggling MFA:', err);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to toggle MFA'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('MFA toggle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

