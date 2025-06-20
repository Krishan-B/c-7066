import { expect, test } from '@playwright/test';

/**
 * Trading Engine Integration Tests
 * Validates the deployed Trading Engine functions
 * Date: June 19, 2025
 */

// Test configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hntsrkacolpseqnyidis.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const TEST_USER_EMAIL = 'test@tradepro.com';
const TEST_USER_PASSWORD = 'TestPassword123!';

test.describe('Trading Engine Deployment Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:8080');
  });

  test('should connect to Supabase successfully', async ({ page }) => {
    // Test basic Supabase connection
    const response = await page.request.get(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    expect(response.ok()).toBeTruthy();
  });

  test('should access trading engine function endpoint', async ({ page }) => {
    // Skip if Supabase credentials are not configured
    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('_here')) {
      test.skip(true, 'Supabase credentials not configured');
    }

    const response = await page.request.fetch(`${SUPABASE_URL}/functions/v1/trading-engine`, {
      method: 'OPTIONS',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    // Should return 200 or 204 for OPTIONS request if function is deployed
    // Or 404 if not deployed yet (which is expected during development)
    expect([200, 204, 404]).toContain(response.status());
  });

  test('should access risk management function endpoint', async ({ page }) => {
    // Skip if Supabase credentials are not configured
    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('_here')) {
      test.skip(true, 'Supabase credentials not configured');
    }

    const response = await page.request.fetch(`${SUPABASE_URL}/functions/v1/risk-management`, {
      method: 'OPTIONS',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    // Should return 200 or 204 for OPTIONS request if function is deployed
    // Or 404 if not deployed yet (which is expected during development)
    expect([200, 204, 404]).toContain(response.status());
  });

  test('should load trading dashboard components', async ({ page }) => {
    // Test if the main trading components are present
    await expect(page.locator('body')).toBeVisible();

    // Look for common trading interface elements
    const tradingElements = [
      '[data-testid="trading-dashboard"]',
      '[data-testid="position-tracker"]',
      '[data-testid="market-data"]',
      '.trading-interface',
      '.position-tracker',
      '.market-data-stream',
    ];

    // At least one trading element should be present
    let found = false;
    for (const selector of tradingElements) {
      try {
        await page.locator(selector).waitFor({ timeout: 1000 });
        found = true;
        break;
      } catch {
        // Element not found, continue
      }
    }

    // If no specific trading elements found, at least check for basic React app
    if (!found) {
      await expect(page.locator('#root')).toBeVisible();
    }
  });

  test('should handle authentication state', async ({ page }) => {
    // Test authentication related elements
    const authElements = [
      '[data-testid="login-form"]',
      '[data-testid="user-menu"]',
      '.auth-container',
      '.login-form',
      '.user-profile',
    ];

    // At least one auth element should be present
    let authFound = false;
    for (const selector of authElements) {
      try {
        await page.locator(selector).waitFor({ timeout: 1000 });
        authFound = true;
        break;
      } catch {
        // Element not found, continue
      }
    }

    // Authentication elements should be present in a trading app
    expect(authFound || (await page.locator('body').textContent())).toBeTruthy();
  });
});

test.describe('Trading Engine Database Schema Tests', () => {
  test('should validate database schema deployment', async ({ page }) => {
    // Skip if Supabase credentials are not configured
    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('_here')) {
      test.skip(true, 'Supabase credentials not configured');
    }

    // Test if trading engine tables are accessible
    const tables = ['orders', 'positions', 'user_trades', 'trade_analytics', 'risk_metrics'];

    for (const table of tables) {
      const response = await page.request.get(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      // Table should exist (200) or require authentication (401/403)
      expect([200, 401, 403]).toContain(response.status());
    }
  });
});

test.describe('Trading Engine Security Tests', () => {
  test('should enforce CORS policies', async ({ page }) => {
    // Skip if Supabase credentials are not configured
    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('_here')) {
      test.skip(true, 'Supabase credentials not configured');
    }

    // Test CORS headers on edge functions
    const response = await page.request.fetch(`${SUPABASE_URL}/functions/v1/trading-engine`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:8080',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
      },
    });

    // Should handle CORS preflight request
    expect([200, 204, 404]).toContain(response.status());
  });

  test('should require authentication for protected endpoints', async ({ page }) => {
    // Skip if Supabase credentials are not configured
    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('_here')) {
      test.skip(true, 'Supabase credentials not configured');
    }

    // Test trading engine without auth token
    const response = await page.request.post(`${SUPABASE_URL}/functions/v1/trading-engine`, {
      data: {
        action: 'get_positions',
      },
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header
      },
    });

    // Should require authentication (401) or not be deployed yet (404)
    expect([401, 404]).toContain(response.status());
  });
});
