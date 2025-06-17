import { expect, test } from '@playwright/test';

test('User can enable two-factor authentication', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"], input[name="email"], input#email', 'testuser@example.com');
  await page.fill(
    'input[type="password"], input[name="password"], input#password',
    'TestPassword123!'
  );
  await page.click('button[type="submit"], button:has-text("Log In"), button:has-text("Sign In")');
  await expect(page).toHaveURL(/dashboard|home/);

  await page.goto('/settings/security');
  await page.click(
    'button:has-text("Enable Two-Factor Authentication"), button:has-text("Enable 2FA")'
  );
  await page.fill(
    'input[name="twoFactorCode"], input#twoFactorCode, input[name="2faCode"], input#2faCode',
    '123456'
  );
  await page.click('button[type="submit"], button:has-text("Verify"), button:has-text("Confirm")');
  await expect(
    page.locator('text=/2fa enabled|two-factor authentication enabled|success/i')
  ).toBeVisible();
});
