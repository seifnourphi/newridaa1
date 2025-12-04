import { NextResponse } from 'next/server';

// CSRF token endpoint for double-submit cookie pattern
export async function GET() {
  try {
    // Generate a random token
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    const response = NextResponse.json({
      csrfToken: token,
    });

    // Set non-HttpOnly cookie so backend (via proxy) receives it and
    // frontend JS can also read/use it.
    // Use 'none' for sameSite in development to ensure cookies work across localhost ports
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('csrfToken', token, {
      httpOnly: false,
      sameSite: isProduction ? 'lax' : 'lax', // Use 'lax' for both to ensure cookies are sent
      secure: isProduction,
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours (increased from 1 hour)
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate CSRF token',
      },
      { status: 500 }
    );
  }
}

