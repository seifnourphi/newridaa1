import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// POST /api/auth/mfa/toggle - Toggle MFA (enable/disable)
export async function POST(request: NextRequest) {
  try {
    // Forward request directly to backend - let backend handle authentication
    // Backend has middleware to verify token from cookies or Authorization header
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
      
      // Call backend MFA toggle endpoint - backend will verify authentication
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
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to toggle MFA'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

