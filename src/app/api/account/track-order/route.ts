import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// GET /api/account/track-order - Track order (proxy to backend)
export async function GET(request: NextRequest) {
  try {
    console.log('[Track Order Route] Request received');
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const tracking = searchParams.get('tracking');
    const order = searchParams.get('order');
    console.log('[Track Order Route] Query params:', { tracking, order });

    // Build query string for backend
    const queryParams = new URLSearchParams();
    if (tracking) {
      queryParams.set('tracking', tracking);
    }
    if (order) {
      queryParams.set('order', order);
    }

    // Forward request to backend
    const cookie = request.headers.get('cookie');
    const authHeader = request.headers.get('authorization');
    
    // Extract token from cookies or Authorization header
    let token = null;
    
    // First, try to get token from Authorization header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Try to get token from cookies
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
    
    const backendUrl = `${BACKEND_URL}/api/account/track-order?${queryParams.toString()}`;
    
    // Prepare headers for backend request
    const backendHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Always forward Authorization header if token is available
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
        data = text ? { error: text } : { error: 'Unknown error' };
      }
    } catch (parseError) {
      console.error('[Track Order API] Failed to parse response:', parseError);
      data = { 
        success: false,
        error: 'Failed to parse response from server' 
      };
    }

    // Forward response with status
    return NextResponse.json(data, {
      status: response.status,
    });

  } catch (error: any) {
    console.error('Track order API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to track order' 
      },
      { status: 500 }
    );
  }
}

