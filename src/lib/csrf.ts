/**
 * Enhanced CSRF Protection Middleware (Edge-Compatible)
 *
 * Features:
 * - Secure CSRF token generation (Edge + Node)
 * - Strong double-submit cookie validation
 * - timingSafeEqual to prevent timing attacks
 * - State-changing method protection
 * - Unified utilities for middleware & API routes
 */

import { NextRequest, NextResponse } from "next/server";

const CSRF_COOKIE = "csrf-token";
const CSRF_HEADER = "X-CSRF-Token";

/** Generate CSRF token (Edge runtime compatible) */
export function generateCSRFToken(): string {
  // Edge/browser environment
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Node fallback
  const nodeCrypto = require("crypto");
  return nodeCrypto.randomBytes(32).toString("hex");
}

/** Constant-time comparison */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Extract CSRF token from request */
export function getCSRFToken(request: NextRequest): string | null {
  return (
    request.cookies.get(CSRF_COOKIE)?.value ||
    request.headers.get(CSRF_HEADER) ||
    null
  );
}

/** Validate CSRF token (double-submit cookie pattern) */
export function verifyCSRF(
  request: NextRequest,
  tokenFromBody?: string
): boolean {
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
  const requestToken = tokenFromBody || request.headers.get(CSRF_HEADER);

  if (!cookieToken || !requestToken) return false;

  try {
    return timingSafeEqual(cookieToken, requestToken);
  } catch {
    return false;
  }
}

/** Enforce CSRF validation for state-changing methods */
export function requireCSRF(
  request: NextRequest,
  tokenFromBody?: string
): NextResponse | null {
  const method = request.method.toUpperCase();

  // Only protect state-changing methods
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return null;
  }

  if (!verifyCSRF(request, tokenFromBody)) {
    return NextResponse.json(
      { error: "Your session has expired. Please refresh the page and try again." },
      { status: 403 }
    );
  }

  return null;
}

/** Assign CSRF cookie to response */
export function setCSRFToken(
  response: NextResponse,
  token?: string
): NextResponse {
  const csrf = token || generateCSRFToken();
  const isProd = process.env.NODE_ENV === "production";

  response.cookies.set(CSRF_COOKIE, csrf, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 60 * 60 * 24, // 24h
    path: "/",
  });

  return response;
}






