/**
 * secure-input-validation.ts (enhanced)
 *
 * Comprehensive input validation & sanitization utilities.
 * Backwards-compatible: preserves original exported function names.
 *
 * Security goals:
 * - Server-side DOMPurify (jsdom) for HTML sanitization
 * - Strong password/email/username validation with clear constraints
 * - Forbidden-character checks for sensitive fields
 * - Output escaping helpers for HTML/JS/CSS/URL
 * - Recursive object sanitization (prototype-pollution safe)
 * - Defensive length checks and constant-time comparisons where relevant
 */

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// --- Configuration / constants ------------------------------------------------

const MIN_PASSWORD_LEN = 8;
const MAX_PASSWORD_LEN = 128;
const MAX_TEXT_FIELD = 1000;

const FORBIDDEN_CHARS = /[<>"'`;={}()\[\]$\\]/; // same as before
const PASSWORD_FORBIDDEN_CHARS = /[<>"'`;={}\[\]$\\]/;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_\-\u0600-\u06FF]{3,50}$/;

// Initialize DOMPurify (server-side)
const windowForPurify = new JSDOM('').window as unknown as Window;
const purify = DOMPurify(windowForPurify as any);

/**
 * Helper: constant-time string compare (to mitigate timing attacks)
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let res = 0;
  for (let i = 0; i < a.length; i++) {
    res |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return res === 0;
}

// --- Sanitization helpers -----------------------------------------------------

/**
 * sanitizeInput
 * - Strict server-side sanitization using DOMPurify configured conservatively.
 * - Removes forbidden chars after sanitization to be extra safe.
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';

  // Use a conservative DOMPurify config: allow no tags by default,
  // but allow safe basic inline formatting optionally (can be changed).
  const sanitized = purify.sanitize(input, {
    ALLOWED_TAGS: [], // keep strict: remove any tags
    ALLOWED_ATTR: [], // disallow attributes
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link', 'meta', 'style'],
    FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover', 'style'],
  });

  // Remove forbidden characters that can be used in injections
  const final = sanitized.replace(FORBIDDEN_CHARS, '').trim();

  // Limit length to reasonable maximum to avoid DoS through huge payloads
  if (final.length > MAX_TEXT_FIELD) {
    return final.substring(0, MAX_TEXT_FIELD);
  }

  return final;
}

/**
 * hasForbiddenChars
 */
export function hasForbiddenChars(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  return FORBIDDEN_CHARS.test(input);
}

// --- Password validation -----------------------------------------------------

/**
 * isStrongPassword
 * Kept return signature compatible: { valid: boolean; error?: string }
 */
export function isStrongPassword(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Invalid password format' };
  }

  if (password.length < MIN_PASSWORD_LEN) {
    return { valid: false, error: `Password must be at least ${MIN_PASSWORD_LEN} characters` };
  }

  if (password.length > MAX_PASSWORD_LEN) {
    return { valid: false, error: `Password must be less than ${MAX_PASSWORD_LEN} characters` };
  }

  if (PASSWORD_FORBIDDEN_CHARS.test(password)) {
    return { valid: false, error: 'Password contains invalid characters' };
  }

  // Require mix: at least 3 of 4 categories: lower, upper, digit, special
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const categories = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;
  if (categories < 3) {
    return { valid: false, error: 'Password must include uppercase, lowercase, numbers and/or special characters' };
  }

  return { valid: true };
}

// --- Email & Username validation ---------------------------------------------

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Invalid email format' };
  }

  const normalized = email.trim().toLowerCase();
  if (hasForbiddenChars(normalized)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (!EMAIL_REGEX.test(normalized)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (normalized.length > 255) {
    return { valid: false, error: 'Email too long' };
  }

  return { valid: true };
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Invalid username format' };
  }

  const trimmed = username.trim();
  if (hasForbiddenChars(trimmed)) {
    return { valid: false, error: 'Invalid username format' };
  }

  if (!USERNAME_REGEX.test(trimmed)) {
    return { valid: false, error: 'Username must be 3-50 characters and contain only letters, numbers, underscores, hyphens, or Arabic characters' };
  }

  return { valid: true };
}

// --- Comment & general text validation ---------------------------------------

export function validateComment(comment: string): { valid: boolean; sanitized?: string; error?: string } {
  if (!comment || typeof comment !== 'string') {
    return { valid: false, error: 'Comment is required' };
  }

  if (hasForbiddenChars(comment)) {
    return { valid: false, error: 'Comment contains invalid characters' };
  }

  const sanitized = sanitizeInput(comment);

  if (sanitized.trim().length < 3) {
    return { valid: false, error: 'Comment must be at least 3 characters long' };
  }

  if (sanitized.length > 1000) {
    return { valid: false, error: 'Comment must be less than 1000 characters' };
  }

  return { valid: true, sanitized };
}

export function validateGeneralField(
  value: string | null | undefined,
  fieldName: string = 'field',
  maxLength: number = MAX_TEXT_FIELD
): { valid: boolean; sanitized?: string; error?: string } {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: `Invalid ${fieldName} format` };
  }

  if (hasForbiddenChars(value)) {
    return { valid: false, error: `Invalid characters in ${fieldName}` };
  }

  const sanitized = sanitizeInput(value);
  if (sanitized.trim().length === 0) {
    return { valid: false, error: `Invalid ${fieldName} format` };
  }

  if (sanitized.length > maxLength) {
    return { valid: false, error: `${fieldName} too long` };
  }

  return { valid: true, sanitized };
}

// --- Unified sensitive field validation --------------------------------------

export function validateSensitiveField(
  field: 'password' | 'email' | 'username' | 'comment',
  value: string
): { valid: boolean; sanitized?: string; error?: string } {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: `Invalid ${field} format` };
  }

  if (hasForbiddenChars(value)) {
    return { valid: false, error: 'Invalid characters detected' };
  }

  switch (field) {
    case 'password': {
      const res = isStrongPassword(value);
      return { valid: res.valid, error: res.error };
    }
    case 'email': {
      const res = validateEmail(value);
      return { valid: res.valid, error: res.error };
    }
    case 'username': {
      const res = validateUsername(value);
      return { valid: res.valid, error: res.error };
    }
    case 'comment': {
      const res = validateComment(value);
      return { valid: res.valid, sanitized: res.sanitized, error: res.error };
    }
    default:
      return { valid: false, error: 'Invalid field type' };
  }
}

// --- Output encoding helpers --------------------------------------------------

export function escapeHtml(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
  };
  return text.replace(/[&<>"'`/]/g, (char) => map[char] || char);
}

export function escapeHTMLAttribute(str: string): string {
  return escapeHtml(str).replace(/ /g, '&#32;');
}

export function escapeJavaScript(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function escapeURL(str: string): string {
  try {
    return encodeURIComponent(String(str));
  } catch {
    return '';
  }
}

export function escapeCSS(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>'"]/g, (char) => `\\${char.charCodeAt(0).toString(16)} `);
}

// --- Recursive sanitization and NoSQL protection -----------------------------

/**
 * sanitizeObject
 * - Safely sanitizes strings in objects/arrays recursively
 * - Prevents prototype pollution by ignoring keys like __proto__, constructor, prototype
 */
export function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key of Object.keys(obj)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        // Skip dangerous keys to prevent prototype pollution
        continue;
      }
      const safeKey = sanitizeInput(String(key));
      // Avoid keys starting with $ (NoSQL operator) - prefix with underscore if necessary
      const finalKey = safeKey.startsWith('$') ? `_${safeKey}` : safeKey;
      sanitized[finalKey] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }

  // Fallback: stringify other types safely
  return String(obj);
}

// --- Additional helpers -------------------------------------------------------

/**
 * sanitizeForJson
 * - Prepares data for JSON responses (keeps URLs and paths intact)
 * - Decodes common HTML entities for URLs if found
 */
function looksLikeUrlOrPath(str: string): boolean {
  const t = str.trim();
  return /^(https?:\/\/|data:|blob:|\/)/i.test(t);
}

export function sanitizeForJson(input: any): any {
  if (input === null || input === undefined) return input;

  if (typeof input === 'string') {
    if (looksLikeUrlOrPath(input)) {
      // Keep URLs/paths largely intact; decode basic HTML entities if present
      return input
        .replace(/&#x2F;/g, '/')
        .replace(/&#47;/g, '/')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'");
    }
    return escapeHtml(input);
  }

  if (Array.isArray(input)) return input.map(sanitizeForJson);

  if (typeof input === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
      const safeKey = sanitizeInput(k);
      if (safeKey === '' || safeKey.startsWith('$')) continue;
      // preserve url fields
      if ((safeKey === 'url' || safeKey === 'image' || safeKey === 'images') && typeof v === 'string') {
        out[safeKey] = v.replace(/&#x2F;/g, '/').replace(/&amp;/g, '&');
      } else if (safeKey === 'images' && Array.isArray(v)) {
        out[safeKey] = v.map((img: any) => (typeof img === 'string' ? img : sanitizeForJson(img)));
      } else {
        out[safeKey] = sanitizeForJson(v);
      }
    }
    return out;
  }

  // primitives
  return input;
}

// --- Exports (keeps same names as original file) -----------------------------

export {
  MIN_PASSWORD_LEN,
  MAX_PASSWORD_LEN,
  MAX_TEXT_FIELD,
  FORBIDDEN_CHARS,
  PASSWORD_FORBIDDEN_CHARS,
  EMAIL_REGEX,
  USERNAME_REGEX,
  constantTimeCompare,
};






