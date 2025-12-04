import { NextRequest, NextResponse } from 'next/server';
import { verifyJWTFromRequestAsync } from '@/lib/jwt-validator';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Helper function to verify user token
async function verifyUserToken(request: NextRequest) {
  return await verifyJWTFromRequestAsync(request);
}

// POST /api/auth/mfa/verify-setup - Verify MFA setup code
export async function POST(request: NextRequest) {
  try {
    // Forward request directly to backend - let backend handle authentication
    // Backend has middleware to verify token from cookies or Authorization header
    const body = await request.json();
    
    // Validate request body
    if (!body.code || typeof body.code !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Verification code is required'
        },
        { status: 400 }
      );
    }

    if (!body.mfaSecretId || typeof body.mfaSecretId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'MFA secret ID is required'
        },
        { status: 400 }
      );
    }

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
      
      // Call backend MFA verify-setup endpoint - backend will verify authentication
      const mfaResponse = await fetch(`${BACKEND_URL}/api/auth/mfa/verify-setup`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        credentials: 'include',
      });

      const mfaData = await mfaResponse.json();
      
      if (mfaResponse.ok) {
        return NextResponse.json(mfaData);
      } else {
        // Backend returned error - forward it to frontend
        return NextResponse.json(
          {
            success: false,
            error: mfaData.error || 'Failed to verify MFA setup'
          },
          { status: mfaResponse.status }
        );
      }
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to verify MFA setup'
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

