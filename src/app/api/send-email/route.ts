import { NextRequest, NextResponse } from 'next/server';
import { verifyJWTFromRequestAsync } from '@/lib/jwt-validator';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Helper function to verify user token
async function verifyUserToken(request: NextRequest) {
  return await verifyJWTFromRequestAsync(request);
}

// POST /api/send-email - Send email (proxy to backend)
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    const { to, subject, text, html } = body;

    if (!to || !subject) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email address and subject are required'
        },
        { status: 400 }
      );
    }

    // Forward request directly to backend - let backend handle authentication
    // Backend has middleware to verify token from cookies
    const cookie = request.headers.get('cookie');
    const authHeader = request.headers.get('authorization');
    
    // Debug: log cookie info
    console.log('Send email - Cookie check:', {
      hasCookie: !!cookie,
      cookieLength: cookie?.length,
      hasAdminToken: cookie?.includes('adminToken'),
      hasToken: cookie?.includes('token'),
      hasAuthHeader: !!authHeader
    });
    
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
      
      // Call backend send-email endpoint - backend will verify authentication
      const emailResponse = await fetch(`${BACKEND_URL}/api/settings/send-email`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ to, subject, text, html }),
      });

      const emailData = await emailResponse.json();
      
      if (emailResponse.ok) {
        return NextResponse.json(emailData);
      } else {
        // Backend returned error - forward it to frontend
        return NextResponse.json(
          {
            success: false,
            error: emailData.error || 'Failed to send email'
          },
          { status: emailResponse.status }
        );
      }
    } catch (err) {
      console.error('Error sending email:', err);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send email'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

