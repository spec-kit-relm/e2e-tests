import { expect, test } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';

test.describe('@smoke storefront', () => {
  test.skip(!process.env.BASE_URL, 'set BASE_URL to run against an environment');

  test('SMOKE-1 home page offers a way to checkout', async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    await expect(home.checkoutLink()).toBeVisible();
  });
});
