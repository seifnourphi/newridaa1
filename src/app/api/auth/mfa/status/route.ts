import { NextRequest, NextResponse } from 'next/server';
import { verifyJWTFromRequestAsync } from '@/lib/jwt-validator';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Helper function to verify user token
async function verifyUserToken(request: NextRequest) {
  return await verifyJWTFromRequestAsync(request);
}

// GET /api/auth/mfa/status - Get MFA status (proxy to backend)
export async function GET(request: NextRequest) {
  try {
    const userToken = await verifyUserToken(request);
    
    // If no valid token, return default MFA status (not enabled)
    // This allows the page to load without errors even if token is expired
    if (!userToken || !userToken.email) {
      return NextResponse.json({
        success: true,
        mfaEnabled: false
      });
    }

    // Forward request to backend MFA status endpoint
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
      
      // Call backend MFA status endpoint
      const mfaResponse = await fetch(`${BACKEND_URL}/api/auth/mfa/status`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (mfaResponse.ok) {
        const mfaData = await mfaResponse.json();
        return NextResponse.json({
          success: true,
          mfaEnabled: mfaData.mfaEnabled || false
        });
      }
    } catch (err) {
      // Silent fail - return default
    }

    // Default response - MFA not enabled
    return NextResponse.json({
      success: true,
      mfaEnabled: false
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
