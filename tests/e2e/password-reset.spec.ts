import { test, expect } from '@playwright/test';

test('User can request a password reset', async ({ page }) => {
  await page.goto('/auth');
  await page.waitForSelector('input#email, input[name="email"]');
  // Try both possible button texts
  const forgotBtn =
    (await page.$('button:has-text("Forgot Password")')) ||
    (await page.$('button:has-text("Forgot Password?")'));
  if (forgotBtn) await forgotBtn.click();
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', 'testuser@example.com');
  await page.click('button:has-text("Send Reset Link")');
  await expect(page.locator('text=/check your email|reset link sent|instructions/i')).toBeVisible();
});

test('User can reset password with valid token', async ({ page }) => {
  await page.goto('/reset-password?token=FAKE_TOKEN');
  await page.fill(
    'input[type="password"][name="newPassword"], input#newPassword',
    'NewStrongPassword123!'
  );
  await page.fill(
    'input[type="password"][name="confirmPassword"], input#confirmPassword',
    'NewStrongPassword123!'
  );
  await page.click('button[type="submit"], button:has-text("Reset Password")');
  await expect(page.locator('text=/password updated|success|reset complete/i')).toBeVisible();
});
