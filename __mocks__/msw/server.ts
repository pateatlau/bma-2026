/**
 * MSW Server Setup
 *
 * Server instance for Node.js environment (Jest tests).
 * Import this in your test setup files.
 */
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server instance
 *
 * Usage in tests:
 * ```ts
 * import { server } from '@/__mocks__/msw/server';
 *
 * beforeAll(() => server.listen());
 * afterEach(() => server.resetHandlers());
 * afterAll(() => server.close());
 * ```
 */
export const server = setupServer(...handlers);

/**
 * Helper to add temporary handlers for specific tests
 *
 * @example
 * ```ts
 * import { server, addHandler } from '@/__mocks__/msw/server';
 * import { http, HttpResponse } from 'msw';
 *
 * it('handles custom response', () => {
 *   addHandler(
 *     http.get('/api/custom', () => HttpResponse.json({ custom: true }))
 *   );
 *   // Test code...
 * });
 * ```
 */
export const addHandler = (...newHandlers: Parameters<typeof server.use>) => {
  server.use(...newHandlers);
};

/**
 * Helper to reset to default handlers
 */
export const resetHandlers = () => {
  server.resetHandlers();
};
