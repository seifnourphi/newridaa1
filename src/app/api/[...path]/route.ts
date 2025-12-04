import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Allow-list of first path segments that are permitted through the proxy.
// This limits accidental exposure of future internal APIs via the generic proxy.
const ALLOWED_PREFIXES = new Set<string>([
  'auth',
  'products',
  'categories',
  'sections',
  'orders',
  'checkout',
  'users',
  'account',
  'settings',
  'analytics',
  'coupons',
  'advertisements',
  'testimonials',
  'customer-reviews',
  'admin',
  'upload',
]);

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PATCH');
}

async function proxyRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  try {
    const [prefix] = path;
    if (!prefix || !ALLOWED_PREFIXES.has(prefix)) {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    }

    const apiPath = path.join('/');
    const url = new URL(request.url);
    const queryString = url.search;
    const backendUrl = `${BACKEND_URL}/api/${apiPath}${queryString}`;

    // Get request body if exists (including DELETE requests that may have body)
    let body: any = null;
    if (method !== 'GET') {
      try {
        const contentType = request.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          body = await request.json();
        } else if (contentType?.includes('multipart/form-data')) {
          // For file uploads, pass through as FormData
          body = await request.formData();
        } else {
          body = await request.text();
        }
      } catch (e) {
        // No body
      }
    }

    // Prepare headers - forward all important headers
    const headers: HeadersInit = {
      'Content-Type': request.headers.get('content-type') || 'application/json',
    };

    // Forward cookies
    const cookie = request.headers.get('cookie');
    if (cookie) {
      headers['Cookie'] = cookie;
    }

    // Forward authorization header if exists
    const auth = request.headers.get('authorization');
    if (auth) {
      headers['Authorization'] = auth;
    }

    // Forward CSRF token header if exists
    const csrfToken = request.headers.get('x-csrf-token') || request.headers.get('X-CSRF-Token');
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }

    // Make request to backend
    const options: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };

    if (body) {
      if (body instanceof FormData) {
        // Don't set Content-Type for FormData, browser will set it with boundary
        delete headers['Content-Type'];
        options.body = body;
      } else if (typeof body === 'string') {
        options.body = body;
      } else {
        options.body = JSON.stringify(body);
      }
    }

    const response = await fetch(backendUrl, options);

    // Get response data - handle errors gracefully
    const contentType = response.headers.get('content-type') || '';
    
    // Handle binary responses (PDF, images, etc.)
    if (contentType.includes('application/pdf') || 
        contentType.includes('image/') || 
        contentType.includes('application/octet-stream')) {
      const blob = await response.blob();
      
      // Forward response with status and headers for binary content
      const responseHeaders = new Headers();
      
      // Forward set-cookie headers
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        responseHeaders.set('set-cookie', setCookie);
      }

      // Forward content-type
      if (contentType) {
        responseHeaders.set('content-type', contentType);
      }

      // Forward content-disposition if present (for file downloads)
      const contentDisposition = response.headers.get('content-disposition');
      if (contentDisposition) {
        responseHeaders.set('content-disposition', contentDisposition);
      }

      return new NextResponse(blob, {
        status: response.status,
        headers: responseHeaders,
      });
    }
    
    // Handle JSON and text responses
    let data: any;
    try {
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { error: text } : { error: 'Unknown error' };
      }
    } catch (parseError: any) {
      data = { 
        success: false,
        error: 'Failed to process server response' 
      };
    }

    // Forward response with status and headers
    const responseHeaders = new Headers();
    
    // Forward set-cookie headers
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      responseHeaders.set('set-cookie', setCookie);
    }

    // Forward content-type
    if (contentType) {
      responseHeaders.set('content-type', contentType);
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Service temporarily unavailable. Please try again later.',
      },
      { status: 500 }
    );
  }
}

