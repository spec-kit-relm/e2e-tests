import type { Page } from '@playwright/test';

/** Page object for the storefront home page (E2E-2). */
export class HomePage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async open() {
    await this.page.goto('/');
  }

  checkoutLink() {
    return this.page.getByRole('link', { name: /checkout/i });
  }
}
