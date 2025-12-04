import { NextRequest, NextResponse } from 'next/server';
import { verifyJWTFromRequestAsync } from '@/lib/jwt-validator';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// GET /api/account/orders - Get user's orders (proxy to backend)
export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    // Note: We verify in frontend but also forward to backend which will verify again
    // This provides double protection but if frontend verification fails, we still forward
    // to backend to let it handle the authentication (in case of JWT_SECRET mismatch)
    const userToken = await verifyJWTFromRequestAsync(request);
    
    // Debug logging (remove in production)
    if (!userToken) {
      console.log('[Orders API] Frontend JWT verification failed - forwarding to backend anyway');
      const authHeader = request.headers.get('authorization');
      const cookie = request.cookies.get('token')?.value;
      console.log('[Orders API] Auth header present:', !!authHeader);
      console.log('[Orders API] Cookie present:', !!cookie);
      // Don't return 401 here - let backend handle authentication
      // This allows the request to proceed even if frontend verification fails
      // (useful if JWT_SECRET is different or missing in frontend)
    }
    
    // Only check if we have a valid token payload with userId or email
    // If not, we still forward to backend (it will handle auth)
    // if (!userToken || (!userToken.userId && !userToken.email)) {
    //   // Commented out: let backend handle authentication
    //   // return NextResponse.json(
    //   //   { error: 'Unauthorized' },
    //   //   { status: 401 }
    //   // );
    // }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    // Build query string for backend
    const queryParams = new URLSearchParams();
    if (status && status !== 'all') {
      queryParams.set('status', status);
    }
    queryParams.set('page', page);
    queryParams.set('limit', limit);

    // Forward request to backend
    const cookie = request.headers.get('cookie');
    const authHeader = request.headers.get('authorization');
    
    // Extract token from cookies or Authorization header
    let token = null;
    
    // First, try to get token from Authorization header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Try to get token from cookies using Next.js cookies API
      const tokenCookie = request.cookies.get('token')?.value;
      if (tokenCookie) {
        token = tokenCookie;
      } else if (cookie) {
        // Fallback: try to extract token from cookie string
        const tokenMatch = cookie.match(/token=([^;]+)/);
        if (tokenMatch) {
          token = tokenMatch[1];
        }
      }
    }
    
    const backendUrl = `${BACKEND_URL}/api/orders?${queryParams.toString()}`;
    
    // Prepare headers for backend request
    const backendHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Always forward Authorization header if token is available
    // This ensures the backend can authenticate the request
    if (token) {
      backendHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    // Forward cookies as well (for httpOnly cookies)
    if (cookie) {
      backendHeaders['Cookie'] = cookie;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: backendHeaders,
      credentials: 'include',
    });

    // Safely parse response
    let data: any;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { error: text || 'Failed to fetch orders' };
      }
    } catch (parseError) {
      console.error('[Orders API] Failed to parse response:', parseError);
      data = { error: 'Failed to parse response from server' };
    }

    if (!response.ok) {
      console.error('[Orders API] Backend error:', response.status, data);
      return NextResponse.json(
        { error: data.error || data.message || 'Failed to fetch orders' },
        { status: response.status }
      );
    }

    // Transform backend response to match frontend format if needed
    return NextResponse.json(data);

  } catch (error) {
    console.error('Account orders API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
