// /lib/validation/client-validation.ts
/**
 * Client validation utilities (improved)
 *
 * - Client-side only (UX). MUST be duplicated/validated server-side too.
 * - All functions return ValidationResult so UI can show messages easily.
 * - Configurable and type-safe.
 */

export type ValidationResult = { valid: true } | { valid: false; error: string };

export interface ClientValidationConfig {
  passwordMinLength?: number;
  passwordMaxLength?: number;
  usernameMinLength?: number;
  usernameMaxLength?: number;
  forbiddenChars?: RegExp;
  emailPattern?: RegExp;
}

// Default config (safe defaults)
export const DEFAULT_CONFIG: Required<ClientValidationConfig> = {
  passwordMinLength: 8,
  passwordMaxLength: 128,
  usernameMinLength: 3,
  usernameMaxLength: 50,
  // forbidden characters: those likely to lead to XSS / template injection / SQL-injection characters on UI
  forbiddenChars: /[<>"'`;={}()\[\]$\\]/,
  // reasonably strict but permissive email regex for client-side validation
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// -----------------------------
// Helpers
// -----------------------------
export function hasForbiddenChars(input: string, cfg: ClientValidationConfig = {}): boolean {
  if (typeof input !== 'string' || input.length === 0) return false;
  const re = cfg.forbiddenChars ?? DEFAULT_CONFIG.forbiddenChars;
  return re.test(input);
}

export function escapeHtml(text?: string | null): string {
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
  return text.replace(/[&<>"'`/]/g, (ch) => map[ch] ?? ch);
}

// -----------------------------
// Password validation
// - Allows ASCII letters, numbers and a safe set of punctuation.
// - Enforces length limits.
// -----------------------------
export function validatePassword(password: unknown, cfg: ClientValidationConfig = {}): ValidationResult {
  const c = { ...DEFAULT_CONFIG, ...cfg };
  if (typeof password !== 'string') return { valid: false, error: 'Password is required' };

  const len = password.length;
  if (len < c.passwordMinLength) return { valid: false, error: `Password must be at least ${c.passwordMinLength} characters long` };
  if (len > c.passwordMaxLength) return { valid: false, error: `Password must be less than ${c.passwordMaxLength} characters` };

  // Disallow obviously dangerous chars in password on client side (server must also enforce)
  const passwordForbidden = /[<>"'`;={}\[\]\\]/;
  if (passwordForbidden.test(password)) return { valid: false, error: 'Password contains invalid characters' };

  // Strong but permissive pattern: letters, numbers and common safe symbols
  const PASSWORD_REGEX = /^[A-Za-z0-9@#\-_!$%^&*()+=]+$/;
  if (!PASSWORD_REGEX.test(password)) {
    return { valid: false, error: 'Password contains invalid characters (allowed: letters, numbers, @#-_!$%^&*()+=)' };
  }

  return { valid: true };
}

// -----------------------------
// Email validation
// -----------------------------
export function validateEmail(email: unknown, cfg: ClientValidationConfig = {}): ValidationResult {
  const c = { ...DEFAULT_CONFIG, ...cfg };
  if (typeof email !== 'string' || email.trim().length === 0) return { valid: false, error: 'Email is required' };

  if (hasForbiddenChars(email, c)) return { valid: false, error: 'Email contains invalid characters' };

  if (!c.emailPattern.test(email.trim().toLowerCase())) return { valid: false, error: 'Invalid email format' };

  return { valid: true };
}

// -----------------------------
// Username validation
// - Allows ASCII alphanum, underscore, hyphen and Arabic letters (U+0600–U+06FF)
// -----------------------------
export function validateUsername(username: unknown, cfg: ClientValidationConfig = {}): ValidationResult {
  const c = { ...DEFAULT_CONFIG, ...cfg };
  if (typeof username !== 'string' || username.trim().length === 0) return { valid: false, error: 'Username is required' };
  const trimmed = username.trim();

  if (hasForbiddenChars(trimmed, c)) return { valid: false, error: 'Username contains invalid characters' };

  if (trimmed.length < c.usernameMinLength || trimmed.length > c.usernameMaxLength) {
    return { valid: false, error: `Username must be ${c.usernameMinLength}-${c.usernameMaxLength} characters` };
  }

  const USERNAME_REGEX = /^[a-zA-Z0-9_\-\u0600-\u06FF]+$/;
  if (!USERNAME_REGEX.test(trimmed)) {
    return { valid: false, error: 'Username may contain letters, numbers, underscores, hyphens, or Arabic characters' };
  }

  return { valid: true };
}

// -----------------------------
// Comment validation
// -----------------------------
export function validateComment(comment: unknown, minLen = 3, maxLen = 1000, cfg: ClientValidationConfig = {}): ValidationResult {
  const c = { ...DEFAULT_CONFIG, ...cfg };
  if (typeof comment !== 'string') return { valid: false, error: 'Comment is required' };

  if (hasForbiddenChars(comment, c)) return { valid: false, error: 'Comment contains invalid characters' };

  const trimmed = comment.trim();
  if (trimmed.length < minLen) return { valid: false, error: `Comment must be at least ${minLen} characters` };
  if (trimmed.length > maxLen) return { valid: false, error: `Comment must be less than ${maxLen} characters` };

  return { valid: true };
}

// -----------------------------
// Convenience sanitizers (client-side UX helpers)
// -----------------------------
export function sanitizeInput(input: string, cfg: ClientValidationConfig = {}): string {
  // Remove leading/trailing whitespace and collapse multiple spaces.
  if (typeof input !== 'string') return '';
  return input.trim().replace(/\s{2,}/g, ' ');
}

// -----------------------------
// Exports
// -----------------------------
export default {
  validatePassword,
  validateEmail,
  validateUsername,
  validateComment,
  hasForbiddenChars,
  escapeHtml,
  sanitizeInput,
};

