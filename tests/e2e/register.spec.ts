import { expect, test } from '@playwright/test';

test('User can register a new account', async ({ page }) => {
  await page.goto('/auth?tab=signup');
  await page.fill('input[data-testid="register-email"]', `e2euser+${Date.now()}@example.com`);
  await page.fill('input[data-testid="register-password"]', 'StrongPassword123!');
  await page.fill('input[data-testid="register-confirm-password"]', 'StrongPassword123!');
  // Fill other required fields if present (e.g., first name, last name, country, phone)
  await page.click(
    'button[type="submit"]:has-text("Sign Up"), button[type="submit"]:has-text("Register")'
  );
  await expect(page.locator('text=/check your email|verification/i')).toBeVisible();
});
