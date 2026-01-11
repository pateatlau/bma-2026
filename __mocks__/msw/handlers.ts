/**
 * MSW Request Handlers
 *
 * Mock Service Worker handlers for API mocking in integration tests.
 * These handlers intercept network requests and return mock responses.
 */
import { http, HttpResponse } from 'msw';

// Base URL for API requests (update this to match your API)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';

// Supabase URL for auth/database mocking
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';

/**
 * Mock user data
 */
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  user_metadata: {
    full_name: 'Test User',
  },
};

/**
 * Mock session data
 */
export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
};

/**
 * Auth handlers for Supabase authentication endpoints
 */
export const authHandlers = [
  // Sign in with password
  http.post(`${SUPABASE_URL}/auth/v1/token`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };

    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        ...mockSession,
      });
    }

    return HttpResponse.json({ error: 'Invalid login credentials' }, { status: 400 });
  }),

  // Sign up
  http.post(`${SUPABASE_URL}/auth/v1/signup`, async ({ request }) => {
    const body = (await request.json()) as { email?: string };

    if (body.email?.includes('existing')) {
      return HttpResponse.json({ error: 'User already registered' }, { status: 400 });
    }

    return HttpResponse.json({
      user: mockUser,
      session: mockSession,
    });
  }),

  // Sign out
  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    return HttpResponse.json({});
  }),

  // Get session
  http.get(`${SUPABASE_URL}/auth/v1/session`, () => {
    return HttpResponse.json({
      session: mockSession,
    });
  }),

  // Get user
  http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json(mockUser);
  }),

  // Password reset
  http.post(`${SUPABASE_URL}/auth/v1/recover`, async ({ request }) => {
    const body = (await request.json()) as { email?: string };

    if (body.email) {
      return HttpResponse.json({});
    }

    return HttpResponse.json({ error: 'Email is required' }, { status: 400 });
  }),
];

/**
 * Database handlers for Supabase REST API
 */
export const databaseHandlers = [
  // Generic select handler for any table
  http.get(`${SUPABASE_URL}/rest/v1/:table`, () => {
    // Return empty array by default for unknown tables
    return HttpResponse.json([]);
  }),

  // Generic insert handler
  http.post(`${SUPABASE_URL}/rest/v1/:table`, async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json(body, { status: 201 });
  }),

  // Generic update handler
  http.patch(`${SUPABASE_URL}/rest/v1/:table`, async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json(body);
  }),

  // Generic delete handler
  http.delete(`${SUPABASE_URL}/rest/v1/:table`, () => {
    return HttpResponse.json({}, { status: 204 });
  }),
];

/**
 * API handlers for custom backend endpoints
 */
export const apiHandlers = [
  // Health check endpoint
  http.get(`${API_BASE_URL}/health`, () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  }),

  // Example: Get user profile
  http.get(`${API_BASE_URL}/api/profile`, () => {
    return HttpResponse.json({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.user_metadata.full_name,
      avatar_url: null,
    });
  }),

  // Example: Update user profile
  http.patch(`${API_BASE_URL}/api/profile`, async ({ request }) => {
    const updates = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json({
      id: mockUser.id,
      email: mockUser.email,
      ...updates,
    });
  }),
];

/**
 * Error handlers for testing error scenarios
 */
export const errorHandlers = [
  // Server error endpoint for testing
  http.get(`${API_BASE_URL}/api/error/500`, () => {
    return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }),

  // Not found endpoint for testing
  http.get(`${API_BASE_URL}/api/error/404`, () => {
    return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
  }),

  // Unauthorized endpoint for testing
  http.get(`${API_BASE_URL}/api/error/401`, () => {
    return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }),

  // Rate limit endpoint for testing
  http.get(`${API_BASE_URL}/api/error/429`, () => {
    return HttpResponse.json(
      { error: 'Too Many Requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }),
];

/**
 * All handlers combined
 */
export const handlers = [...authHandlers, ...databaseHandlers, ...apiHandlers, ...errorHandlers];

/**
 * Network error handler for testing offline scenarios
 */
export const networkErrorHandler = http.all('*', () => {
  return HttpResponse.error();
});
