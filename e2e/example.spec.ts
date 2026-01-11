import { test, expect } from '@playwright/test';

/**
 * Example E2E tests
 *
 * Template tests demonstrating common Playwright patterns.
 * These can be used as a starting point for new tests.
 */

test.describe('Example Tests', () => {
  /**
   * Basic navigation test
   */
  test('can navigate to the app', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.*/);
  });

  /**
   * Screenshot test for visual regression
   * Note: Skipped because visual snapshots are platform-dependent (Linux CI vs macOS local).
   * To enable, generate baseline images on Linux: npx playwright test --update-snapshots
   */
  test.skip('home page visual snapshot', async ({ page }) => {
    await page.goto('/');

    // Wait for any animations to complete
    await page.waitForLoadState('networkidle');

    // Take a screenshot for visual comparison
    // This will fail the first time - the screenshot becomes the baseline
    await expect(page).toHaveScreenshot('home.png', {
      maxDiffPixels: 100,
      animations: 'disabled',
    });
  });

  /**
   * Mobile responsive test
   */
  test('is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Verify the page renders
    await expect(page.locator('body')).toBeVisible();
  });

  /**
   * Tablet responsive test
   */
  test('is responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Verify the page renders
    await expect(page.locator('body')).toBeVisible();
  });

  /**
   * Desktop responsive test
   */
  test('is responsive on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // Verify the page renders
    await expect(page.locator('body')).toBeVisible();
  });
});

/**
 * Network interception example
 */
test.describe('API Mocking', () => {
  test('can mock API responses', async ({ page }) => {
    // Mock an API endpoint
    await page.route('**/api/health', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'healthy', mocked: true }),
      });
    });

    await page.goto('/');

    // The test would verify that mocked data is used
    // Update this based on how your app uses the API
  });

  test('can simulate network errors', async ({ page }) => {
    // Simulate network failure for a specific endpoint
    await page.route('**/api/failing-endpoint', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/');

    // The test would verify error handling
    // Update based on your app's error handling UI
  });
});
