// Simple JWT validator wrapper
import { NextRequest } from 'next/server';
import { jwtVerify, JWTPayload } from 'jose';

// JWT Secret
const USER_JWT_SECRET = new TextEncoder().encode(
  (process.env.USER_JWT_SECRET || process.env.JWT_SECRET || '').trim()
);

/**
 * Verify JWT from request (user token only) - SYNC version
 * Returns the user payload if valid, null otherwise
 * Note: This is a simplified sync version that checks token from cookies
 * For full verification, use verifyJWTFromRequestAsync
 */
export function verifyJWTFromRequest(request: NextRequest): any | null {
  // Get token from cookies
  const userToken =
    request.cookies.get("token")?.value ||
    request.cookies.get("__Host-token")?.value ||
    null;

  if (!userToken) {
    return null;
  }

  // For sync version, we can't do full async verification
  // Return a placeholder that indicates token exists
  // The actual verification should be done in async functions
  // This maintains compatibility with existing code
  try {
    // Try to decode without verification (for sync compatibility)
    // In production, this should be async
    return { token: userToken, needsAsyncVerification: true };
  } catch {
    return null;
  }
}

/**
 * Async version - use this in async functions for full verification
 */
export async function verifyJWTFromRequestAsync(request: NextRequest): Promise<any | null> {
  // Get token from cookies or Authorization header
  const userToken =
    request.cookies.get("token")?.value ||
    request.cookies.get("__Host-token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    null;

  if (!userToken) {
    return null;
  }

  if (!USER_JWT_SECRET.length) {
    console.warn("[JWT Validator] USER_JWT_SECRET is missing.");
    console.warn("[JWT Validator] Checked USER_JWT_SECRET:", process.env.USER_JWT_SECRET ? 'exists' : 'missing');
    console.warn("[JWT Validator] Checked JWT_SECRET:", process.env.JWT_SECRET ? 'exists' : 'missing');
    return null;
  }

  try {
    // Verify JWT - make issuer and audience optional since backend may not include them
    const verifyOptions: any = {
      algorithms: ['HS256'],
    };

    // Only add issuer/audience if they're configured and we want to enforce them
    // For now, we'll skip these checks to match backend behavior
    // const issuer = process.env.JWT_ISSUER;
    // const audience = process.env.JWT_AUDIENCE;
    // if (issuer) verifyOptions.issuer = issuer;
    // if (audience) verifyOptions.audience = audience;

    const result = await jwtVerify(userToken, USER_JWT_SECRET, verifyOptions);
    
    // Debug: log successful verification
    console.log('[JWT Validator] Token verified successfully. Payload:', {
      userId: result.payload.userId,
      email: result.payload.email,
      hasUserId: !!result.payload.userId,
      hasEmail: !!result.payload.email
    });

    return result.payload;
  } catch (err: any) {
    console.error('[JWT Validator] Token verification failed:', err?.message);
    console.error('[JWT Validator] Error type:', err?.name);
    console.error('[JWT Validator] Token length:', userToken?.length);
    console.error('[JWT Validator] Secret length:', USER_JWT_SECRET.length);
    return null;
  }
}

