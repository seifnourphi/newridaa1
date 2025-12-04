// User management using Backend API (MongoDB)

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

/* -------------------------------------------------
   User Interface
-------------------------------------------------- */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  password: string;
  emailVerified: boolean;
  isActive: boolean;
  subscribedToNewsletter?: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

/* -------------------------------------------------
   Utils (Normalization & Sanitization)
-------------------------------------------------- */
function normalizeEmail(email: string): string {
  return String(email).trim().toLowerCase();
}

function sanitizeName(name: string): string {
  return String(name).trim();
}

function sanitizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  return phone.replace(/[^0-9+\-\s]/g, '').trim();
}

/* -------------------------------------------------
   Helper: Make API request to backend
-------------------------------------------------- */
async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  try {
    const url = `${BACKEND_URL}/api${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error(`[API Request] Error for ${endpoint}:`, err);
    throw err;
  }
}

/* -------------------------------------------------
   Convert Backend User → User
-------------------------------------------------- */
function backendUserToUser(backendUser: any): User {
  // Backend returns name as single field, split it
  const nameParts = (backendUser.name || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    id: backendUser._id || backendUser.id,
    firstName,
    lastName,
    email: backendUser.email,
    phone: backendUser.phone ?? null,
    password: backendUser.password ?? '',
    emailVerified: backendUser.emailVerified ?? false,
    isActive: backendUser.isActive ?? true,
    subscribedToNewsletter: backendUser.subscribedToNewsletter ?? false,
    avatar: backendUser.avatar ?? undefined,
    createdAt: backendUser.createdAt ? new Date(backendUser.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: backendUser.updatedAt ? new Date(backendUser.updatedAt).toISOString() : new Date().toISOString(),
    lastLoginAt: backendUser.lastLoginAt ? new Date(backendUser.lastLoginAt).toISOString() : undefined,
  };
}

/* -------------------------------------------------
   Get User By Email
-------------------------------------------------- */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const normalizedEmail = normalizeEmail(email);
    
    // Note: Backend doesn't have a direct get-by-email endpoint
    // This would need to be implemented in backend or use /api/auth/me with token
    // For now, return null as this is typically used with JWT token
    console.warn('[getUserByEmail] Direct email lookup not available via API. Use JWT token instead.');
    return null;

  } catch (err) {
    console.error('[getUserByEmail] Error:', err);
    return null;
  }
}

/* -------------------------------------------------
   Get User By ID
-------------------------------------------------- */
export async function getUserById(id: string): Promise<User | null> {
  try {
    // Backend doesn't have a direct get-by-id endpoint for users
    // Use /api/account/profile with authentication instead
    console.warn('[getUserById] Direct ID lookup not available via API. Use /api/account/profile with auth instead.');
    return null;

  } catch (err) {
    console.error('[getUserById] Error:', err);
    return null;
  }
}

/* -------------------------------------------------
   Create User
-------------------------------------------------- */
export async function createUser(
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string; // already hashed before calling
    subscribedToNewsletter?: boolean;
  },
  emailVerified: boolean = true
): Promise<User> {

  try {
    // Email validation
    const normalizedEmail = normalizeEmail(userData.email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      throw new Error('Invalid email format');
    }

    // Required fields
    const firstName = sanitizeName(userData.firstName);
    const lastName = sanitizeName(userData.lastName);
    const phone = sanitizePhone(userData.phone);

    if (!firstName || !lastName || !normalizedEmail || !userData.password) {
      throw new Error('Missing required fields');
    }

    // Combine firstName and lastName for backend
    const name = `${firstName} ${lastName}`.trim();

    // Create user via backend API
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email: normalizedEmail,
        password: userData.password, // Backend will hash it
        phone,
        subscribedToNewsletter: userData.subscribedToNewsletter ?? false,
      }),
    });

    if (response.success && response.data && response.data.user) {
      return backendUserToUser(response.data.user);
    }

    throw new Error(response.error || 'Failed to create user');

  } catch (err) {
    console.error('[createUser] Error:', err);
    throw err;
  }
}

/* -------------------------------------------------
   Update Email Verification
-------------------------------------------------- */
export async function updateUserEmailVerification(email: string, verified: boolean): Promise<boolean> {
  try {
    // Backend handles email verification via /api/auth/verify-code
    // This function may not be needed if verification is handled differently
    console.warn('[updateUserEmailVerification] Email verification handled via /api/auth/verify-code');
    return false;

  } catch (err) {
    console.error('[updateUserEmailVerification] Error:', err);
    return false;
  }
}

/* -------------------------------------------------
   Update Last Login
-------------------------------------------------- */
export async function updateUserLastLogin(email: string): Promise<boolean> {
  try {
    // Backend handles last login update automatically on login
    // This function may not be needed
    console.warn('[updateUserLastLogin] Last login is handled automatically by backend on login');
    return false;

  } catch (err) {
    console.error('[updateUserLastLogin] Error:', err);
    return false;
  }
}

/* -------------------------------------------------
   Remove Password Before Returning
-------------------------------------------------- */
export function getUserWithoutPassword(user: User): Omit<User, 'password'> {
  const { password, ...rest } = user;
  return rest;
}

/* -------------------------------------------------
   Get All Users (Admin)
-------------------------------------------------- */
export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  try {
    // Backend admin endpoint: /api/admin/users
    const response = await apiRequest('/admin/users', {
      method: 'GET',
    });

    if (response.success && response.data && Array.isArray(response.data.users)) {
      return response.data.users.map((u: any) => {
        const user = backendUserToUser(u);
        return getUserWithoutPassword(user);
      });
    }

    return [];

  } catch (err) {
    console.error('[getAllUsers] Error:', err);
    return [];
  }
}

/* -------------------------------------------------
   Check If User Exists
-------------------------------------------------- */
export async function userExists(email: string): Promise<boolean> {
  try {
    // Backend doesn't have a direct exists check endpoint
    // Try to register and catch error, or implement in backend
    console.warn('[userExists] Direct exists check not available via API');
    return false;

  } catch (err) {
    console.error('[userExists] Error:', err);
    return false;
  }
}
