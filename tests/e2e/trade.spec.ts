import { expect, test } from '@playwright/test';

test('User can place a trade', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"], input[name="email"], input#email', 'testuser@example.com');
  await page.fill(
    'input[type="password"], input[name="password"], input#password',
    'TestPassword123!'
  );
  await page.click('button[type="submit"], button:has-text("Log In"), button:has-text("Sign In")');
  await expect(page).toHaveURL(/dashboard|home/);

  await page.goto('/trade');
  await page.fill('input[name="symbol"], input#symbol', 'EUR/USD');
  await page.fill('input[name="amount"], input#amount', '1000');
  await page.click(
    'button[type="submit"], button:has-text("Place Trade"), button:has-text("Trade")'
  );
  await expect(page.locator('text=/trade confirmed|order placed|success/i')).toBeVisible();
});
