import { NextRequest, NextResponse } from 'next/server';
import { requireCSRF } from '@/lib/csrf';
import { validateSensitiveField } from '@/lib/secure-input-validation';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// POST /api/auth/change-password - Change user password (proxy to backend)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // CSRF protection
    const csrfError = requireCSRF(request, body.csrfToken);
    if (csrfError) return csrfError;
    
    const { currentPassword, newPassword } = body;

    // SECURITY: Validate inputs
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Invalid input format' },
        { status: 400 }
      );
    }

    // SECURITY: Validate current password (basic check)
    if (typeof currentPassword !== 'string' || currentPassword.length < 1 || currentPassword.length > 128) {
      return NextResponse.json(
        { error: 'Invalid input format' },
        { status: 400 }
      );
    }

    // SECURITY: Validate new password using secure validation
    const passwordValidation = validateSensitiveField('password', newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid input format' },
        { status: 400 }
      );
    }

    // Forward request directly to backend - let backend handle authentication
    // Backend has middleware to verify token from cookies
    const cookie = request.headers.get('cookie');
    const authHeader = request.headers.get('authorization');
    const backendUrl = `${BACKEND_URL}/api/auth/password`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (cookie) {
      headers['Cookie'] = cookie;
    }
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to change password' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
